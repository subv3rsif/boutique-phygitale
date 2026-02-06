import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { verifyStripeSignature, checkEventIdempotence, markEventProcessed, getRawBody } from '@/lib/stripe/webhook';
import { getOrderByStripeSessionId, updateOrderStatus } from '@/lib/db/helpers';
import { addToQueue } from '@/lib/email/queue';
import { generatePickupToken, generateTokenExpiration } from '@/lib/qr/token-generator';
import { db, orders, pickupTokens } from '@/lib/db';
import { eq } from 'drizzle-orm';

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events
 *
 * CRITICAL: This is the SOURCE OF TRUTH for payment confirmation
 * The success page does NOT confirm payment - only this webhook does
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Get raw body and signature
    const rawBody = await getRawBody(request);
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('No Stripe signature found');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // 2. Verify webhook signature
    let event: Stripe.Event;
    try {
      event = verifyStripeSignature(rawBody, signature);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`Received webhook event: ${event.type} (${event.id})`);

    // 3. Check idempotence (prevent duplicate processing)
    const alreadyProcessed = await checkEventIdempotence(event.id);
    if (alreadyProcessed) {
      console.log(`Event ${event.id} already processed, skipping`);
      return NextResponse.json({ received: true, skipped: true });
    }

    // 4. Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event);
        break;

      case 'checkout.session.expired':
        await handleCheckoutSessionExpired(event);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // 5. Mark event as processed (idempotence)
    await markEventProcessed(event.id, event.type);

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout session
 * This is where payment is confirmed and order status is updated
 */
async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;

  console.log(`Processing completed session: ${session.id}`);

  // Get order from database
  const order = await getOrderByStripeSessionId(session.id);

  if (!order) {
    console.error(`Order not found for session: ${session.id}`);
    throw new Error('Order not found');
  }

  console.log(`Found order: ${order.id}`);

  // Extract customer email from session
  const customerEmail = session.customer_details?.email || session.customer_email;

  if (!customerEmail) {
    console.error('No customer email in session');
    throw new Error('No customer email');
  }

  // Extract customer phone if provided
  const customerPhone = session.customer_details?.phone || order.customerPhone;

  // Update order status to 'paid'
  await db
    .update(orders)
    .set({
      status: 'paid',
      paidAt: new Date(),
      customerEmail,
      customerPhone,
      stripePaymentIntentId: session.payment_intent as string,
    })
    .where(eq(orders.id, order.id));

  console.log(`Order ${order.id} marked as paid`);

  // Add confirmation email to queue
  await addToQueue(
    order.id,
    order.fulfillmentMode === 'delivery' ? 'delivery_confirmation' : 'pickup_confirmation',
    customerEmail
  );

  console.log(`Confirmation email queued for ${customerEmail}`);

  // For pickup mode, generate QR code token
  if (order.fulfillmentMode === 'pickup') {
    console.log('Generating pickup token for order:', order.id);

    // Generate secure token
    const { token, tokenHash } = generatePickupToken();
    const expiresAt = generateTokenExpiration(30); // 30 days

    // Store token hash in database
    // Also store clear token temporarily in metadata for email sending
    // NOTE: In production, use Redis cache instead of storing in DB
    const [createdToken] = await db.insert(pickupTokens).values({
      orderId: order.id,
      tokenHash,
      expiresAt,
      metadata: { clearToken: token }, // Temporary storage for email
    }).returning();

    console.log(`Pickup token created for order ${order.id} (expires: ${expiresAt.toISOString()})`);
  }
}

/**
 * Handle expired checkout session
 * Cancel the order if payment was not completed
 */
async function handleCheckoutSessionExpired(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;

  console.log(`Processing expired session: ${session.id}`);

  // Get order from database
  const order = await getOrderByStripeSessionId(session.id);

  if (!order) {
    console.log(`Order not found for expired session: ${session.id}`);
    return;
  }

  // Only cancel if still pending
  if (order.status === 'pending') {
    await updateOrderStatus(order.id, 'canceled', {
      canceledAt: new Date(),
    });

    console.log(`Order ${order.id} canceled due to session expiration`);
  }
}

// Configure Next.js to not parse the body (we need raw body for signature verification)
export const runtime = 'nodejs';
