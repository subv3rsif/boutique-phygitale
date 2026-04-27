import { NextRequest, NextResponse } from 'next/server';
import { parseNotificationXML } from '@/lib/payfip/soap-parser';
import { validateIdop, consumeIdop, getPayfipOperationByIdop } from '@/lib/payfip/idop-manager';
import { updateOrderWithPayFipResult, getOrderById } from '@/lib/db/helpers';
import { db, emailQueue, pickupTokens } from '@/lib/db';
import { generatePickupToken, generateTokenExpiration, hashToken } from '@/lib/qr/token-generator';
import { decrementStock } from '@/lib/stock';
import { getProductBySlug } from '@/lib/products';
import { checkPaymentStatus } from '@/lib/payfip/payment-status';
import { getPayFipService } from '@/lib/payfip/client';

/**
 * POST /api/payfip/notification
 * PayFiP callback handler (URLNOTIF)
 *
 * Receives payment result notification from PayFiP and updates order status.
 * This is the SOURCE OF TRUTH for payment confirmation.
 *
 * SECURITY:
 * - Validates idop existence and expiration
 * - Prevents double-processing with consumeIdop
 * - Stores raw notification for audit trail
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📥 PayFiP notification received');

    // 1. Read raw body as text (XML)
    const rawBody = await request.text();
    console.log('Raw notification XML:', rawBody);

    // 2. Parse XML notification
    const notification = await parseNotificationXML(rawBody);
    console.log('Parsed notification:', notification);

    const { idop, resultrans, numauto, dattrans, heurtrans, refdet, montant, mel } = notification;

    // 3. Validate idop
    const validation = await validateIdop(idop);

    if (!validation.valid) {
      console.error(`Invalid idop: ${validation.error} - ${validation.message}`);
      // Return 200 to prevent PayFiP retries (idempotence)
      return new NextResponse('OK', { status: 200 });
    }

    const operation = validation.operation!;

    // 4. Get order
    const order = await getOrderById(operation.orderId);

    if (!order) {
      console.error(`Order not found: ${operation.orderId}`);
      return new NextResponse('OK', { status: 200 });
    }

    // 5. Check if order already processed
    if (order.status !== 'pending') {
      console.log(`Order ${order.id} already processed (status: ${order.status})`);
      return new NextResponse('OK', { status: 200 });
    }

    // 5.5. DOUBLE-CHECK PATTERN: Verify payment status with PayFiP
    // Based on eopayment/payfip_ws.py - always call recupererDetailPaiementSecurise
    // to verify the notification is legitimate and get authoritative payment status
    try {
      console.log(`🔍 Double-checking payment status with PayFiP for idop ${idop}`);
      const paymentStatusResult = await checkPaymentStatus(idop, operation.createdAt);

      // If PayFiP says WAITING, payment is still in progress - don't process yet
      if (paymentStatusResult.status === 'WAITING') {
        console.log('Payment still in progress (P5 < 120 min), skipping processing');
        return new NextResponse('OK', { status: 200 });
      }

      // If PayFiP says EXPIRED, payment timeout - mark as canceled
      if (paymentStatusResult.status === 'EXPIRED') {
        console.log('Payment expired (P5 ≥ 120 min), marking order as canceled');
        await updateOrderWithPayFipResult(operation.orderId, {
          status: 'canceled',
          idop,
          payfipResultTrans: 'A', // Treat as cancelled
          paidAt: undefined,
        });
        return new NextResponse('OK', { status: 200 });
      }

      // Compare notification status with PayFiP double-check result
      const notificationStatus = resultrans === 'P' || resultrans === 'V' ? 'PAID' :
                                 resultrans === 'A' ? 'CANCELLED' :
                                 resultrans === 'R' ? 'REFUSED' :
                                 resultrans === 'Z' ? 'REJECTED' : 'UNKNOWN';

      if (paymentStatusResult.status !== notificationStatus) {
        console.warn(`⚠️ Payment status mismatch! Notification: ${notificationStatus}, PayFiP: ${paymentStatusResult.status}`);
        console.warn(`Using PayFiP double-check result as authoritative source`);
      } else {
        console.log(`✅ Double-check confirmed: ${paymentStatusResult.status} (${paymentStatusResult.reason})`);
      }
    } catch (doubleCheckError) {
      console.error('⚠️ Double-check failed, proceeding with notification data:', doubleCheckError);
      // Continue processing with notification data if double-check fails
    }

    // 6. Determine order status based on RESULTRANS
    // P = paid (immediate), V = paid (SEPA pending), A/R/Z = canceled
    const status: 'paid' | 'canceled' = resultrans === 'P' || resultrans === 'V' ? 'paid' : 'canceled';

    // 7. Update order with PayFiP result
    await updateOrderWithPayFipResult(operation.orderId, {
      status,
      idop,
      payfipResultTrans: resultrans,
      payfipNumAuto: numauto || undefined,
      payfipDateTrans: dattrans,
      payfipHeureTrans: heurtrans,
      paidAt: status === 'paid' ? new Date() : undefined,
    });

    // 8. Consume idop (mark as used)
    await consumeIdop(idop, resultrans, numauto, dattrans, heurtrans, rawBody);

    // 9. Queue confirmation email
    if (status === 'paid') {
      console.log(`✅ Payment successful for order ${order.id} (${resultrans})`);

      // Decrement stock for each item
      for (const item of order.items) {
        try {
          // productId in order_items is actually the product ID, not slug
          await decrementStock(item.productId, item.qty, order.id, item.sizeSelected || undefined);
          const sizeInfo = item.sizeSelected ? ` (${item.sizeSelected})` : '';
          console.log(`[PAYFIP] Stock decremented: ${item.productId}${sizeInfo} -${item.qty}`);
        } catch (stockError) {
          console.error(`[PAYFIP] Stock decrement error for ${item.productId}:`, stockError);
          // Continue processing other items
        }
      }

      // Generate pickup token if pickup mode
      if (order.fulfillmentMode === 'pickup') {
        const { token, tokenHash } = generatePickupToken();
        const expiresAt = generateTokenExpiration(30); // 30 days

        // Store token
        await db.insert(pickupTokens).values({
          orderId: order.id,
          tokenHash,
          expiresAt,
          usedAt: null,
          usedBy: null,
        });

        console.log(`Generated pickup token for order ${order.id}`);
      }

      // Queue email
      const emailType = order.fulfillmentMode === 'pickup' ? 'pickup_confirmation' : 'delivery_confirmation';

      await db.insert(emailQueue).values({
        orderId: order.id,
        emailType: emailType as 'pickup_confirmation' | 'delivery_confirmation',
        recipientEmail: mel,
        status: 'pending',
        attempts: 0,
        nextRetryAt: new Date(),
      });

      console.log(`Queued ${emailType} email for ${mel}`);
    } else {
      console.log(`❌ Payment failed/canceled for order ${order.id} (${resultrans})`);
    }

    // 10. Return 200 OK (required for PayFiP)
    return new NextResponse('OK', { status: 200 });

  } catch (error) {
    console.error('PayFiP notification processing error:', error);

    // IMPORTANT: Always return 200 to prevent PayFiP retries
    // Log error but don't expose details to PayFiP
    return new NextResponse('OK', { status: 200 });
  }
}
