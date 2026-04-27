/**
 * Payment Status Checker with Temporal Logic
 * Based on eopayment/payfip_ws.py patterns
 *
 * Implements:
 * - P5 temporal logic (< 120 min = WAITING, ≥ 120 min = EXPIRED)
 * - CANCELLED temporal logic (< 2 min = WAITING to handle race conditions)
 * - Double-check pattern via recupererDetailPaiementSecurise
 */

import { getPayFipService } from './client';
import type { PaymentDetails } from './types';

export type PaymentStatus =
  | 'PAID'       // P or V - payment successful
  | 'WAITING'    // P5 < 120 min or CANCELLED < 2 min - payment in progress
  | 'EXPIRED'    // P5 ≥ 120 min - payment timeout
  | 'CANCELLED'  // A (annulé) after 2 min window
  | 'REFUSED'    // R (refusé)
  | 'REJECTED';  // Z (prélèvement rejeté)

export interface PaymentStatusResult {
  status: PaymentStatus;
  details: PaymentDetails | null;
  reason?: string;
}

/**
 * Calculate operation age in minutes
 */
function getOperationAgeMinutes(createdAt: Date): number {
  const now = new Date();
  const ageMs = now.getTime() - createdAt.getTime();
  return ageMs / (1000 * 60);
}

/**
 * Check payment status with temporal logic
 *
 * @param idop - PayFiP operation ID
 * @param createdAt - When the idop was created (operation timestamp)
 * @param skipDoubleCheck - Skip calling PayFiP API (for testing)
 * @returns Payment status with details
 */
export async function checkPaymentStatus(
  idop: string,
  createdAt: Date,
  skipDoubleCheck = false
): Promise<PaymentStatusResult> {
  const ageMinutes = getOperationAgeMinutes(createdAt);

  // Double-check pattern: always verify with PayFiP
  if (!skipDoubleCheck) {
    try {
      const details = await getPayFipService().recupererDetailPaiementSecurise(idop);

      // P5 error (no result): apply temporal logic
      if (!details) {
        if (ageMinutes < 120) {
          return {
            status: 'WAITING',
            details: null,
            reason: 'Payment in progress (P5 < 120 min)',
          };
        } else {
          return {
            status: 'EXPIRED',
            details: null,
            reason: 'Payment timeout (P5 ≥ 120 min)',
          };
        }
      }

      // Got payment details: interpret resultrans
      return interpretPaymentDetails(details, ageMinutes);

    } catch (error) {
      console.error('Error checking payment status with PayFiP:', error);
      // Fall through to local status if PayFiP call fails
    }
  }

  // If double-check skipped or failed, caller should use local DB status
  return {
    status: 'WAITING',
    details: null,
    reason: 'Could not verify with PayFiP',
  };
}

/**
 * Interpret payment details with temporal logic
 */
function interpretPaymentDetails(
  details: PaymentDetails,
  ageMinutes: number
): PaymentStatusResult {
  const { resultrans } = details;

  // P = paid (immediate confirmation)
  if (resultrans === 'P') {
    return {
      status: 'PAID',
      details,
      reason: 'Payment confirmed (card)',
    };
  }

  // V = paid (SEPA pending)
  if (resultrans === 'V') {
    return {
      status: 'PAID',
      details,
      reason: 'Payment confirmed (SEPA pending)',
    };
  }

  // A = annulé (cancelled by user)
  // Apply temporal logic: if < 2 min, might be race condition
  if (resultrans === 'A') {
    if (ageMinutes < 2) {
      return {
        status: 'WAITING',
        details,
        reason: 'Recently cancelled, waiting for confirmation (< 2 min)',
      };
    }
    return {
      status: 'CANCELLED',
      details,
      reason: 'Payment cancelled by user',
    };
  }

  // R = refusé (refused by bank)
  if (resultrans === 'R') {
    return {
      status: 'REFUSED',
      details,
      reason: 'Payment refused by bank',
    };
  }

  // Z = prélèvement rejeté (SEPA rejected)
  if (resultrans === 'Z') {
    return {
      status: 'REJECTED',
      details,
      reason: 'SEPA payment rejected',
    };
  }

  // Unknown resultrans
  return {
    status: 'WAITING',
    details,
    reason: `Unknown payment status: ${resultrans}`,
  };
}
