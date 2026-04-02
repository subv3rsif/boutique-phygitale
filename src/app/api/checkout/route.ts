import { NextRequest, NextResponse } from 'next/server';
import { checkoutInputSchema } from '@/lib/validations';
import { calculateCartTotals } from '@/lib/catalogue';
import { checkRateLimit, checkoutLimiter, createRateLimitResponse } from '@/lib/rate-limit';
import { getClientIP, getUserAgent } from '@/lib/utils';
import { getPayFipService } from '@/lib/payfip/client';
import { generateREFDET } from '@/lib/payfip/refdet';
import { storeIdop } from '@/lib/payfip/idop-manager';
import { PayFipSOAPError, getUserFriendlyErrorMessage } from '@/lib/payfip/errors';
import { createOrder } from '@/lib/db/helpers';
import { db, gdprConsents } from '@/lib/db';

/**
 * POST /api/checkout
 * Creates a PayFiP secure payment for checkout
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

    const { items, fulfillmentMode, pickupLocationId, gdprConsent, customerPhone, customerEmail } = validationResult.data;

    // 3. Verify GDPR consent
    if (!gdprConsent) {
      return NextResponse.json(
        { error: 'GDPR consent is required' },
        { status: 400 }
      );
    }

    // 4. Validate email (required for PayFiP)
    if (!customerEmail || !customerEmail.includes('@')) {
      return NextResponse.json(
        { error: 'A valid email address is required' },
        { status: 400 }
      );
    }

    // 5. Calculate totals from server-side catalogue (SOURCE OF TRUTH)
    const calculation = calculateCartTotals(items, fulfillmentMode);

    if ('error' in calculation) {
      return NextResponse.json(
        { error: calculation.error },
        { status: 400 }
      );
    }

    const { itemsTotal, shippingTotal, grandTotal, validatedItems } = calculation;

    // 6. Generate sequential REFDET (invoice reference)
    const refdet = await generateREFDET();

    // 7. Create order in database (status: 'pending')
    const orderId = await createOrder(
      {
        status: 'pending',
        fulfillmentMode,
        pickupLocationId: fulfillmentMode === 'pickup' ? pickupLocationId || 'la-fabrik' : null,
        customerEmail,
        customerPhone: customerPhone || null,
        refdet,
        idop: null,
        payfipResultTrans: null,
        payfipNumAuto: null,
        payfipDateTrans: null,
        payfipHeureTrans: null,
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

    // 8. Save GDPR consent
    const userAgent = getUserAgent(request);
    await db.insert(gdprConsents).values({
      orderId,
      ipAddress: ip,
      userAgent,
      privacyPolicyVersion: '1.0',
    });

    // 9. Create PayFiP secure payment
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const useMock = process.env.PAYFIP_USE_MOCK === 'true';

    const payfipResponse = await getPayFipService().creerPaiementSecurise({
      NUMCLI: process.env.PAYFIP_NUMCLI || 'MOCK00',
      EXER: process.env.PAYFIP_EXER || new Date().getFullYear().toString(),
      REFDET: refdet,
      OBJET: 'Boutique municipale 1885',
      MONTANT: grandTotal.toString(),
      MEL: customerEmail,
      URLNOTIF: `${appUrl}/api/payfip/notification`,
      URLREDIRECT: `${appUrl}/commande/resultat`,
      SAISIE: (process.env.PAYFIP_MODE || 'T') as 'T' | 'X' | 'W',
    });

    const { idop } = payfipResponse;

    // 10. Store idop in database (15 min expiration)
    await storeIdop(idop, orderId, refdet);

    // 11. Update order with idop
    await db.execute(
      `UPDATE orders SET idop = '${idop}' WHERE id = '${orderId}'`
    );

    // 12. Return redirect URL (mock or real PayFiP)
    const redirectUrl = useMock
      ? `${appUrl}/payfip-mock/${idop}`
      : `${process.env.PAYFIP_URL}?idop=${idop}`;

    return NextResponse.json({
      url: redirectUrl,
      idop,
      refdet,
    });

  } catch (error) {
    console.error('Checkout error:', error);

    // Handle PayFiP-specific errors
    if (error instanceof PayFipSOAPError) {
      const friendlyMessage = getUserFriendlyErrorMessage(error.code || '');
      return NextResponse.json(
        { error: friendlyMessage, code: error.code },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred during checkout. Please try again.' },
      { status: 500 }
    );
  }
}
