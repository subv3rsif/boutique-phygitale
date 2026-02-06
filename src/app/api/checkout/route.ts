import { NextRequest, NextResponse } from 'next/server';
import { checkoutInputSchema } from '@/lib/validations';
import { calculateCartTotals } from '@/lib/catalogue';
import { checkRateLimit, checkoutLimiter, createRateLimitResponse } from '@/lib/rate-limit';
import { getClientIP, getUserAgent } from '@/lib/utils';
import { stripe } from '@/lib/stripe/client';
import { createOrder } from '@/lib/db/helpers';
import { db, gdprConsents } from '@/lib/db';

/**
 * POST /api/checkout
 * Creates a Stripe Checkout session for payment
 *
 * SECURITY: All prices are recalculated server-side from catalogue
 * NEVER trust client-provided amounts
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting
    const ip = getClientIP(request);
    const { success, reset } = await checkRateLimit(checkoutLimiter, ip);

    if (!success) {
      return createRateLimitResponse(reset);
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const validationResult = checkoutInputSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { items, fulfillmentMode, pickupLocationId, gdprConsent, customerPhone } = validationResult.data;

    // 3. Verify GDPR consent
    if (!gdprConsent) {
      return NextResponse.json(
        { error: 'GDPR consent is required' },
        { status: 400 }
      );
    }

    // 4. Calculate totals from server-side catalogue (SOURCE OF TRUTH)
    const calculation = calculateCartTotals(items, fulfillmentMode);

    if ('error' in calculation) {
      return NextResponse.json(
        { error: calculation.error },
        { status: 400 }
      );
    }

    const { itemsTotal, shippingTotal, grandTotal, validatedItems } = calculation;

    // 5. Create order in database (status: 'pending')
    const orderId = await createOrder(
      {
        status: 'pending',
        fulfillmentMode,
        pickupLocationId: fulfillmentMode === 'pickup' ? pickupLocationId || 'la-fabrik' : null,
        customerEmail: '', // Will be filled by Stripe
        customerPhone: customerPhone || null,
        stripeSessionId: '', // Will be updated after session creation
        stripePaymentIntentId: null,
        itemsTotalCents: itemsTotal,
        shippingTotalCents: shippingTotal,
        grandTotalCents: grandTotal,
      },
      validatedItems.map((item) => ({
        productId: item.product.id,
        qty: item.qty,
        unitPriceCents: item.product.priceCents,
        shippingCentsPerUnit: item.product.shippingCents,
        nameSnapshot: item.product.name,
        imageSnapshot: item.product.image,
        orderId: '', // Will be set by createOrder
      }))
    );

    // 6. Save GDPR consent
    const userAgent = getUserAgent(request);
    await db.insert(gdprConsents).values({
      orderId,
      ipAddress: ip,
      userAgent,
      privacyPolicyVersion: '1.0',
    });

    // 7. Prepare Stripe line items
    const lineItems: any[] = validatedItems.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.product.name,
          description: item.product.description,
          images: [item.product.image],
        },
        unit_amount: item.product.priceCents,
      },
      quantity: item.qty,
    }));

    // Add shipping as separate line item if delivery mode
    if (fulfillmentMode === 'delivery' && shippingTotal > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Frais de livraison',
            description: 'Livraison par La Poste',
          },
          unit_amount: shippingTotal,
        },
        quantity: 1,
      });
    }

    // 8. Create Stripe Checkout Session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const sessionConfig: any = {
      mode: 'payment',
      line_items: lineItems,
      success_url: `${appUrl}/commande/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/panier`,
      metadata: {
        orderId,
        fulfillmentMode,
      },
      customer_email: undefined, // Let customer enter email
      phone_number_collection: {
        enabled: fulfillmentMode === 'pickup', // Collect phone for pickup
      },
    };

    // Only collect shipping address for delivery
    if (fulfillmentMode === 'delivery') {
      sessionConfig.shipping_address_collection = {
        allowed_countries: ['FR'], // France only
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // 9. Update order with Stripe session ID
    await db.execute(
      `UPDATE orders SET stripe_session_id = '${session.id}' WHERE id = '${orderId}'`
    );

    // 10. Return session URL for redirect
    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'An error occurred during checkout. Please try again.' },
      { status: 500 }
    );
  }
}
