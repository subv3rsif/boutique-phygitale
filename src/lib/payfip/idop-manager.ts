import { db, payfipOperations } from '@/lib/db';
import { eq, and, lt, isNull } from 'drizzle-orm';
import type { IdopValidationResult } from './types';
import { PayFipIdopError } from './errors';

/**
 * Validate idop (existence, expiration, consumption)
 * Returns validation result with operation data if valid
 */
export async function validateIdop(idop: string): Promise<IdopValidationResult> {
  const [operation] = await db
    .select()
    .from(payfipOperations)
    .where(eq(payfipOperations.idop, idop))
    .limit(1);

  // P1: idOp inconnu
  if (!operation) {
    return {
      valid: false,
      error: 'P1',
      message: 'idOp incorrect',
    };
  }

  // P4: idOp expiré (>15 minutes)
  if (new Date() > operation.expiresAt) {
    return {
      valid: false,
      error: 'P4',
      message: "L'idOp ne doit pas avoir été enregistré depuis plus de 15 minutes",
    };
  }

  // P3: idOp déjà consommé
  if (operation.consumedAt) {
    return {
      valid: false,
      error: 'P3',
      message: "L'idOp ne doit pas avoir déjà été utilisé pour un paiement",
    };
  }

  // Valid
  return {
    valid: true,
    operation: {
      id: operation.id,
      orderId: operation.orderId,
      refdet: operation.refdet,
      expiresAt: operation.expiresAt,
      consumedAt: operation.consumedAt,
    },
  };
}

/**
 * Store new idop in database
 */
export async function storeIdop(
  idop: string,
  orderId: string,
  refdet: string
): Promise<void> {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // +15 minutes

  await db.insert(payfipOperations).values({
    idop,
    orderId,
    refdet,
    expiresAt,
  });

  console.log(`Stored idop ${idop} for order ${orderId}, expires at ${expiresAt.toISOString()}`);
}

/**
 * Mark idop as consumed (after notification processing)
 */
export async function consumeIdop(
  idop: string,
  resultTrans: 'P' | 'V' | 'A' | 'R' | 'Z',
  numAuto: string,
  dateTrans: string,
  heureTrans: string,
  rawNotification: string
): Promise<void> {
  await db
    .update(payfipOperations)
    .set({
      consumedAt: new Date(),
      resultTrans,
      numAuto,
      dateTrans,
      heureTrans,
      notificationReceivedAt: new Date(),
      rawNotification,
    })
    .where(eq(payfipOperations.idop, idop));

  console.log(`Consumed idop ${idop} with result ${resultTrans}`);
}

/**
 * Get PayFiP operation by idop
 */
export async function getPayfipOperationByIdop(idop: string) {
  const [operation] = await db
    .select()
    .from(payfipOperations)
    .where(eq(payfipOperations.idop, idop))
    .limit(1);

  return operation || null;
}

/**
 * Get PayFiP operation by order ID
 */
export async function getPayfipOperationByOrderId(orderId: string) {
  const [operation] = await db
    .select()
    .from(payfipOperations)
    .where(eq(payfipOperations.orderId, orderId))
    .limit(1);

  return operation || null;
}

/**
 * Cleanup expired idops (for cron job)
 * Returns number of operations cleaned
 */
export async function cleanupExpiredIdops(): Promise<number> {
  const expiredOps = await db
    .select()
    .from(payfipOperations)
    .where(
      and(
        lt(payfipOperations.expiresAt, new Date()),
        isNull(payfipOperations.consumedAt)
      )
    );

  console.log(`Found ${expiredOps.length} expired idops to cleanup`);

  // Note: Orders will be canceled separately in cron job
  // This just logs for monitoring

  return expiredOps.length;
}
