// src/lib/products.ts
import { db, products } from '@/lib/db';
import { eq, and, desc } from 'drizzle-orm';
import type { Product, CreateProductInput, UpdateProductInput } from '@/types/product';
import { parseTags } from '@/lib/validations/product';

/**
 * Get all products (admin)
 */
export async function getAllProducts(): Promise<Product[]> {
  return await db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt));
}

/**
 * Get active products only (public)
 */
export async function getActiveProducts(): Promise<Product[]> {
  return await db
    .select()
    .from(products)
    .where(eq(products.active, true))
    .orderBy(desc(products.createdAt));
}

/**
 * Get product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  return product ?? null;
}

/**
 * Get product by slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.active, true)))
    .limit(1);

  return product ?? null;
}

/**
 * Check if slug exists
 */
export async function slugExists(slug: string, excludeId?: string): Promise<boolean> {
  const conditions = [eq(products.slug, slug)];
  if (excludeId) {
    conditions.push(eq(products.id, excludeId));
  }

  const [existing] = await db
    .select({ id: products.id })
    .from(products)
    .where(and(...conditions))
    .limit(1);

  return !!existing && existing.id !== excludeId;
}

/**
 * Create product
 */
export async function createProduct(input: CreateProductInput): Promise<Product> {
  // Check slug uniqueness
  const exists = await slugExists(input.slug);
  if (exists) {
    throw new Error('Slug already exists');
  }

  // Parse tags
  const tagsArray = parseTags(input.tags);

  const [product] = await db
    .insert(products)
    .values({
      slug: input.slug,
      name: input.name,
      description: input.description,
      priceCents: input.priceCents,
      shippingCents: input.shippingCents,
      stockQuantity: input.stockQuantity ?? 0,
      stockAlertThreshold: input.stockAlertThreshold ?? 5,
      weightGrams: input.weightGrams ?? null,
      tags: tagsArray.length > 0 ? tagsArray : null,
      payfipProductCode: input.payfipProductCode ?? '11',
      editionNumber: input.editionNumber ?? null,
      editionTotal: input.editionTotal ?? null,
      active: input.active ?? true,
    })
    .returning();

  if (!product) {
    throw new Error('Failed to create product');
  }

  console.log(`[PRODUCT] Created: ${product.slug}`);

  return product;
}

/**
 * Update product
 */
export async function updateProduct(
  id: string,
  input: UpdateProductInput
): Promise<Product> {
  // Check slug uniqueness if slug is being updated
  if (input.slug) {
    const exists = await slugExists(input.slug, id);
    if (exists) {
      throw new Error('Slug already exists');
    }
  }

  // Parse tags if provided
  const tagsArray = input.tags ? parseTags(input.tags) : undefined;

  const updateData: any = {
    ...input,
    tags: tagsArray,
    updatedAt: new Date(),
  };

  // Remove undefined values
  Object.keys(updateData).forEach((key) => {
    if (updateData[key] === undefined) {
      delete updateData[key];
    }
  });

  const [product] = await db
    .update(products)
    .set(updateData)
    .where(eq(products.id, id))
    .returning();

  if (!product) {
    throw new Error('Product not found');
  }

  console.log(`[PRODUCT] Updated: ${product.slug}`);

  return product;
}

/**
 * Delete product
 */
export async function deleteProduct(id: string): Promise<void> {
  const [deleted] = await db
    .delete(products)
    .where(eq(products.id, id))
    .returning();

  if (!deleted) {
    throw new Error('Product not found');
  }

  console.log(`[PRODUCT] Deleted: ${deleted.slug}`);
}

/**
 * Add images to product
 */
export async function addProductImages(
  productId: string,
  newImages: Array<{ url: string; path: string; isPrimary?: boolean }>
): Promise<Product> {
  const product = await getProductById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  const currentImages = product.images || [];
  const maxOrder = currentImages.length > 0
    ? Math.max(...currentImages.map((img) => img.order))
    : -1;

  // Add new images with incremented order
  const imagesToAdd = newImages.map((img, index) => ({
    url: img.url,
    path: img.path,
    order: maxOrder + 1 + index,
    isPrimary: img.isPrimary ?? false,
  }));

  // If new image is primary, unmark others
  let updatedImages = [...currentImages];
  if (imagesToAdd.some((img) => img.isPrimary)) {
    updatedImages = updatedImages.map((img) => ({ ...img, isPrimary: false }));
  }

  updatedImages.push(...imagesToAdd);

  const [updated] = await db
    .update(products)
    .set({ images: updatedImages })
    .where(eq(products.id, productId))
    .returning();

  if (!updated) {
    throw new Error('Product not found');
  }

  return updated;
}

/**
 * Remove image from product
 */
export async function removeProductImage(
  productId: string,
  imagePath: string
): Promise<Product> {
  const product = await getProductById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  const images = (product.images || []).filter((img) => img.path !== imagePath);

  // If removed image was primary, make first remaining image primary
  if (images.length > 0 && !images.some((img) => img.isPrimary) && images[0]) {
    images[0].isPrimary = true;
  }

  const [updated] = await db
    .update(products)
    .set({ images })
    .where(eq(products.id, productId))
    .returning();

  if (!updated) {
    throw new Error('Product not found');
  }

  return updated;
}
