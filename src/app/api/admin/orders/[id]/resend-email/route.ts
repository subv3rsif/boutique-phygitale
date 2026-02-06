import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { orders, emailQueue } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * POST /api/admin/orders/[id]/resend-email
 * Resends the confirmation email for an order
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

    // Determine email type based on order status and fulfillment mode
    let emailType: 'pickup_confirmation' | 'delivery_confirmation' | 'shipped_notification';

    if (order.fulfillmentMode === 'pickup') {
      emailType = 'pickup_confirmation';
    } else if (order.trackingNumber) {
      emailType = 'shipped_notification';
    } else {
      emailType = 'delivery_confirmation';
    }

    // Add new email to queue (don't update existing ones to preserve history)
    await db.insert(emailQueue).values({
      orderId,
      emailType,
      recipientEmail: order.customerEmail,
      status: 'pending',
      attempts: 0,
      nextRetryAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Email added to queue',
    });
  } catch (error) {
    console.error('Resend email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
