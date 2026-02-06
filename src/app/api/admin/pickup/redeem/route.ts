import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { orders, pickupTokens } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { redeemPickupTokenSchema } from '@/lib/validations';
import { hashToken } from '@/lib/qr/token-generator';

/**
 * POST /api/admin/pickup/redeem
 * Validates a pickup token and marks order as fulfilled
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const session = cookieStore.get('admin-session');

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get staff email from session
    let staffEmail = '';
    try {
      const sessionData = JSON.parse(session.value);
      staffEmail = sessionData.email;
    } catch {
      staffEmail = 'unknown';
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = redeemPickupTokenSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { token } = validationResult.data;

    // Hash the token to lookup in database
    const tokenHash = hashToken(token);

    // Find pickup token
    const [pickupToken] = await db
      .select()
      .from(pickupTokens)
      .where(eq(pickupTokens.tokenHash, tokenHash))
      .limit(1);

    if (!pickupToken) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 404 }
      );
    }

    // Check if token is expired
    if (new Date() > new Date(pickupToken.expiresAt)) {
      return NextResponse.json(
        { error: 'Token has expired' },
        { status: 410 } // 410 Gone
      );
    }

    // Check if token has already been used
    if (pickupToken.usedAt) {
      return NextResponse.json(
        {
          error: 'Token has already been used',
          usedAt: pickupToken.usedAt,
          usedBy: pickupToken.usedBy,
        },
        { status: 409 } // 409 Conflict
      );
    }

    // Find associated order
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, pickupToken.orderId))
      .limit(1);

    if (!order) {
      return NextResponse.json(
        { error: 'Associated order not found' },
        { status: 404 }
      );
    }

    // Verify order status
    if (order.status !== 'paid') {
      return NextResponse.json(
        {
          error: 'Order is not in a valid state for pickup',
          currentStatus: order.status,
        },
        { status: 400 }
      );
    }

    // Mark token as used
    await db
      .update(pickupTokens)
      .set({
        usedAt: new Date(),
        usedBy: staffEmail,
      })
      .where(eq(pickupTokens.id, pickupToken.id));

    // Mark order as fulfilled
    await db
      .update(orders)
      .set({
        status: 'fulfilled',
        fulfilledAt: new Date(),
      })
      .where(eq(orders.id, order.id));

    // Return success with order details
    return NextResponse.json({
      success: true,
      message: 'Pickup validated successfully',
      order: {
        id: order.id,
        customerEmail: order.customerEmail,
        grandTotalCents: order.grandTotalCents,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error('Redeem pickup token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
