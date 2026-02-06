import Stripe from 'stripe';
import { stripe } from './client';
import { db, stripeEvents } from '../db';
import { eq } from 'drizzle-orm';

/**
 * Stripe webhook helpers
 * CRITICAL: These functions ensure payment security
 */

/**
 * Verify Stripe webhook signature
 * This MUST be done for every webhook to prevent spoofing
 */
export function verifyStripeSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  }

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    return event;
  } catch (err) {
    const error = err as Error;
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }
}

/**
 * Check if event has already been processed (idempotence)
 * Returns true if event has already been processed
 */
export async function checkEventIdempotence(eventId: string): Promise<boolean> {
  const [existingEvent] = await db
    .select()
    .from(stripeEvents)
    .where(eq(stripeEvents.eventId, eventId))
    .limit(1);

  return !!existingEvent;
}

/**
 * Mark event as processed
 */
export async function markEventProcessed(eventId: string, eventType: string): Promise<void> {
  await db.insert(stripeEvents).values({
    eventId,
    eventType,
  });
}

/**
 * Get raw body from request (required for signature verification)
 * Next.js requires special handling for webhook routes
 */
export async function getRawBody(request: Request): Promise<Buffer> {
  const arrayBuffer = await request.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
