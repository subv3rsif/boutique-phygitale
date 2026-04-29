import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { payfipOperations, orders } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';

/**
 * GET /api/payfip/mock/details?idop=xxx
 * Mock helper endpoint to get payment details for mock payment page
 *
 * Only available in Mock mode (PAYFIP_USE_MOCK=true)
 */
export async function GET(request: NextRequest) {
  try {
    // Only allow in Mock mode
    const useMock = process.env.PAYFIP_USE_MOCK === 'true';

    if (!useMock) {
      return NextResponse.json(
        { error: 'Mock endpoints are disabled in production mode' },
        { status: 403 }
      );
    }

    // Get idop from query params
    const searchParams = request.nextUrl.searchParams;
    const idop = searchParams.get('idop');

    if (!idop) {
      return NextResponse.json(
        { error: 'Missing idop parameter' },
        { status: 400 }
      );
    }

    // Get payment details from database (not memory - fixes serverless issue)
    const operations = await db
      .select({
        refdet: payfipOperations.refdet,
        expiresAt: payfipOperations.expiresAt,
        customerEmail: orders.customerEmail,
        grandTotalCents: orders.grandTotalCents,
      })
      .from(payfipOperations)
      .innerJoin(orders, eq(payfipOperations.orderId, orders.id))
      .where(and(
        eq(payfipOperations.idop, idop),
        gt(payfipOperations.expiresAt, new Date())
      ))
      .limit(1);

    const operation = operations[0];

    if (!operation) {
      return NextResponse.json(
        { error: 'idop not found or expired' },
        { status: 404 }
      );
    }

    // Return payment details for mock UI
    return NextResponse.json({
      refdet: operation.refdet,
      montant: operation.grandTotalCents.toString(),
      mel: operation.customerEmail,
    });

  } catch (error) {
    console.error('Mock details error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve payment details' },
      { status: 500 }
    );
  }
}
