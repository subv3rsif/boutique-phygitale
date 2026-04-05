import { NextRequest, NextResponse } from 'next/server';
import { getActiveProducts } from '@/lib/products';

/**
 * GET /api/products
 * Get active products (public)
 */
export async function GET(request: NextRequest) {
  try {
    const products = await getActiveProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
