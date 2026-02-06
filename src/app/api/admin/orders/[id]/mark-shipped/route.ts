import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { orders, emailQueue } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { markShippedInputSchema } from '@/lib/validations';

/**
 * POST /api/admin/orders/[id]/mark-shipped
 * Marks a delivery order as shipped and sends tracking email
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    // Check authentication
    const cookieStore = await cookies();
    const session = cookieStore.get('admin-session');

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = markShippedInputSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { trackingNumber, trackingUrl } = validationResult.data;

    // Find order
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify order is eligible for shipping
    if (order.fulfillmentMode !== 'delivery') {
      return NextResponse.json(
        { error: 'Order is not a delivery order' },
        { status: 400 }
      );
    }

    if (order.status !== 'paid') {
      return NextResponse.json(
        { error: 'Order must be paid to mark as shipped' },
        { status: 400 }
      );
    }

    // Generate tracking URL if not provided
    const finalTrackingUrl =
      trackingUrl ||
      `https://www.laposte.fr/outils/suivre-vos-envois?code=${trackingNumber}`;

    // Update order
    await db
      .update(orders)
      .set({
        status: 'fulfilled',
        fulfilledAt: new Date(),
        trackingNumber,
        trackingUrl: finalTrackingUrl,
      })
      .where(eq(orders.id, orderId));

    // Add shipped notification email to queue
    await db.insert(emailQueue).values({
      orderId,
      emailType: 'shipped_notification',
      recipientEmail: order.customerEmail,
      status: 'pending',
      attempts: 0,
      nextRetryAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Order marked as shipped',
    });
  } catch (error) {
    console.error('Mark shipped error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
