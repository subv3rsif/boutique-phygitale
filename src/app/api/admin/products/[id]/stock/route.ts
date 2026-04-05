// src/app/api/admin/products/[id]/stock/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { getProductById } from '@/lib/products';
import { adjustStock, getStockMovements } from '@/lib/stock';
import { stockAdjustmentSchema } from '@/lib/validations/product';

/**
 * GET /api/admin/products/[id]/stock
 * Get stock movements (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check auth
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allowedEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    if (!allowedEmails.includes(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Await params
    const { id } = await params;

    // Get movements
    const movements = await getStockMovements(id);

    return NextResponse.json({ movements });
  } catch (error) {
    console.error('GET /api/admin/products/[id]/stock error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock movements' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/products/[id]/stock
 * Adjust stock (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check auth
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allowedEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    if (!allowedEmails.includes(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Await params
    const { id } = await params;

    // Check product exists
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Parse body
    const body = await request.json();

    // Validate
    const validation = stockAdjustmentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Adjust stock
    await adjustStock(id, validation.data, session.user.email);

    // Get updated product
    const updatedProduct = await getProductById(id);

    return NextResponse.json({ product: updatedProduct });
  } catch (error: any) {
    console.error('POST /api/admin/products/[id]/stock error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to adjust stock' },
      { status: 500 }
    );
  }
}
