import { NextRequest, NextResponse } from 'next/server';
import { getOrderByIdop } from '@/lib/db/helpers';
import { db, pickupTokens } from '@/lib/db';
import { eq } from 'drizzle-orm';

/**
 * GET /api/orders/by-idop/[idop]
 * Fetch order details by PayFiP idop for result page
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ idop: string }> }
) {
  try {
    const { idop } = await params;

    if (!idop) {
      return NextResponse.json(
        { error: 'Missing idop parameter' },
        { status: 400 }
      );
    }

    // Get order with items
    const order = await getOrderByIdop(idop);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Get pickup token if pickup mode
    let pickupToken = null;
    if (order.fulfillmentMode === 'pickup') {
      const [tokenRecord] = await db
        .select()
        .from(pickupTokens)
        .where(eq(pickupTokens.orderId, order.id))
        .limit(1);

      if (tokenRecord && tokenRecord.metadata) {
        // Extract clear token from metadata for QR code generation
        const metadata = tokenRecord.metadata as { clearToken?: string };
        pickupToken = {
          token: metadata.clearToken || '',
          expiresAt: tokenRecord.expiresAt.toISOString(),
        };
      }
    }

    // Return order data
    return NextResponse.json({
      id: order.id,
      refdet: order.refdet,
      status: order.status,
      fulfillmentMode: order.fulfillmentMode,
      customerEmail: order.customerEmail,
      grandTotalCents: order.grandTotalCents,
      payfipResultTrans: order.payfipResultTrans,
      createdAt: order.createdAt?.toISOString(),
      pickupToken,
      items: order.items,
    });

  } catch (error) {
    console.error('Error fetching order by idop:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
