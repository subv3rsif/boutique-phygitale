// src/app/api/admin/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-auth';
import { getProductById, updateProduct, deleteProduct } from '@/lib/products';
import { updateProductSchema } from '@/lib/validations/product';
import { deleteProductImages } from '@/lib/supabase-storage';

/**
 * GET /api/admin/products/[id]
 * Get product by ID (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check auth
    try {
      await requireAdminAuth();
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params
    const { id } = await params;

    // Get product
    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('GET /api/admin/products/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/products/[id]
 * Update product (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check auth
    try {
      await requireAdminAuth();
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params
    const { id } = await params;

    // Parse body
    const body = await request.json();

    // Validate
    const validation = updateProductSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Update product
    const product = await updateProduct(id, validation.data);

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error('PUT /api/admin/products/[id] error:', error);

    if (error.message === 'Product not found') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (error.message === 'Slug already exists') {
      return NextResponse.json(
        { error: 'Ce slug existe déjà. Modifiez le nom.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/products/[id]
 * Delete product (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check auth
    try {
      await requireAdminAuth();
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params
    const { id } = await params;

    // Get product to get slug
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete images from storage
    try {
      await deleteProductImages(product.slug);
    } catch (storageError) {
      console.error('Failed to delete product images:', storageError);
      // Continue with product deletion even if images fail
    }

    // Delete product
    await deleteProduct(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/admin/products/[id] error:', error);

    if (error.message === 'Product not found') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
