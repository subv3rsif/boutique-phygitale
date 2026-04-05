// src/app/api/admin/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { getAllProducts, createProduct } from '@/lib/products';
import { productSchema } from '@/lib/validations/product';

/**
 * GET /api/admin/products
 * Get all products (admin only)
 */
export async function GET(request: NextRequest) {
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

    // Get products
    const products = await getAllProducts();

    return NextResponse.json({ products });
  } catch (error) {
    console.error('GET /api/admin/products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/products
 * Create product (admin only)
 */
export async function POST(request: NextRequest) {
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

    // Parse body
    const body = await request.json();

    // Validate
    const validation = productSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Create product
    const product = await createProduct(validation.data);

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/admin/products error:', error);

    if (error.message === 'Slug already exists') {
      return NextResponse.json(
        { error: 'Ce slug existe déjà. Modifiez le nom.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
