import { NextRequest, NextResponse } from 'next/server';
import { getProductBySlug } from '@/lib/products';

/**
 * GET /api/products/[slug]
 * Get product by slug (public)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await getProductBySlug(params.slug);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('GET /api/products/[slug] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
