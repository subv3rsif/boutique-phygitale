// src/app/api/admin/products/[id]/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-auth';
import { getProductById, addProductImages } from '@/lib/products';
import { uploadProductImage } from '@/lib/supabase-storage';
import { imageUploadSchema } from '@/lib/validations/product';

/**
 * POST /api/admin/products/[id]/upload
 * Upload product image (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin access
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

    // Check max images
    if (product.images.length >= 5) {
      return NextResponse.json(
        { error: 'Maximum 5 images per product' },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const isPrimaryStr = formData.get('isPrimary') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;

    // Upload to Supabase
    const { url, path } = await uploadProductImage(buffer, fileName, product.slug);

    // Validate isPrimary
    const validation = imageUploadSchema.safeParse({
      isPrimary: isPrimaryStr === 'true',
    });

    // Add image to product
    const updatedProduct = await addProductImages(id, [
      {
        url,
        path,
        isPrimary: validation.success ? validation.data.isPrimary : false,
      },
    ]);

    return NextResponse.json({ product: updatedProduct }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/admin/products/[id]/upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}
