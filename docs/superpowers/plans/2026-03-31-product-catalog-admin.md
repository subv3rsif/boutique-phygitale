# Product Catalog Admin Interface - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer une interface admin complète pour gérer le catalogue produits (CRUD) avec galerie multi-photos et gestion automatique du stock.

**Architecture:** Base de données PostgreSQL (Drizzle ORM) avec tables `products` et `stock_movements`, API REST admin protégée, upload images vers Supabase Storage, interface admin React avec formulaires et décrémentation automatique du stock.

**Tech Stack:** Next.js 15, Drizzle ORM, Supabase Storage, Zod, React Hook Form, Tailwind CSS, Resend (emails)

---

## File Structure

### New Files

**Database Schema:**
- `src/lib/db/schema-products.ts` - Schéma Drizzle pour tables products & stock_movements

**Product Library:**
- `src/lib/products.ts` - Fonctions CRUD products (getProducts, createProduct, etc.)
- `src/lib/stock.ts` - Gestion stock (decrement, adjust, movements)
- `src/lib/supabase-storage.ts` - Upload/delete images Supabase Storage

**Validations:**
- `src/lib/validations/product.ts` - Schémas Zod pour produits

**API Routes Admin:**
- `src/app/api/admin/products/route.ts` - GET all, POST create
- `src/app/api/admin/products/[id]/route.ts` - GET one, PUT update, DELETE
- `src/app/api/admin/products/[id]/upload/route.ts` - POST upload image
- `src/app/api/admin/products/[id]/stock/route.ts` - POST adjust stock

**API Routes Public:**
- `src/app/api/products/route.ts` - GET products actifs (remplace catalogue.ts)
- `src/app/api/products/[slug]/route.ts` - GET product par slug

**Admin Pages:**
- `src/app/admin/products/page.tsx` - Liste produits
- `src/app/admin/products/new/page.tsx` - Créer produit
- `src/app/admin/products/[id]/edit/page.tsx` - Modifier produit

**Admin Components:**
- `src/components/admin/product-list.tsx` - Table liste produits
- `src/components/admin/product-form.tsx` - Formulaire produit
- `src/components/admin/image-upload.tsx` - Upload galerie images
- `src/components/admin/stock-adjuster.tsx` - Modal ajustement stock

**Email Templates:**
- `src/emails/stock-alert.tsx` - Email alerte stock faible
- `src/emails/out-of-stock.tsx` - Email rupture de stock

**Types:**
- `src/types/product.ts` - Types TypeScript produits

**Migration:**
- `drizzle/0001_add_products.sql` - Migration SQL

### Modified Files

- `src/lib/db/schema.ts` - Export nouveau schéma products
- `src/lib/db/index.ts` - Export products & stockMovements tables
- `src/app/api/payfip/notification/route.ts` - Ajouter décrémentation stock
- `src/app/page.tsx` - Utiliser API products au lieu de catalogue.ts
- `src/lib/catalogue.ts` - Déprécier (ou supprimer après migration)

---

## Task 1: Database Schema (Drizzle)

**Files:**
- Create: `src/lib/db/schema-products.ts`
- Modify: `src/lib/db/schema.ts`
- Modify: `src/lib/db/index.ts`

- [ ] **Step 1: Create products schema file**

```typescript
// src/lib/db/schema-products.ts
import { pgTable, uuid, varchar, integer, timestamp, text, boolean, index, json } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 100 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  priceCents: integer('price_cents').notNull(),
  shippingCents: integer('shipping_cents').notNull(),
  images: json('images').$type<Array<{
    url: string;
    path: string;
    order: number;
    isPrimary: boolean;
  }>>().default([]).notNull(),
  stockQuantity: integer('stock_quantity').default(0).notNull(),
  stockAlertThreshold: integer('stock_alert_threshold').default(5).notNull(),
  weightGrams: integer('weight_grams'),
  tags: text('tags').array(),
  payfipProductCode: varchar('payfip_product_code', { length: 10 }).default('11'),
  editionNumber: integer('edition_number'),
  editionTotal: integer('edition_total'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  slugIdx: index('idx_products_slug').on(table.slug),
  activeIdx: index('idx_products_active').on(table.active),
  stockIdx: index('idx_products_stock').on(table.stockQuantity),
}));

export const stockMovements = pgTable('stock_movements', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 20 }).notNull().$type<'sale' | 'restock' | 'adjustment' | 'return'>(),
  quantity: integer('quantity').notNull(),
  orderId: uuid('order_id'),
  note: text('note'),
  createdBy: varchar('created_by', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  productIdx: index('idx_stock_product').on(table.productId),
  orderIdx: index('idx_stock_order').on(table.orderId),
}));
```

- [ ] **Step 2: Export from main schema file**

Modify `src/lib/db/schema.ts`:

```typescript
// Add at the end
export * from './schema-products';
```

- [ ] **Step 3: Export tables from db index**

Modify `src/lib/db/index.ts`:

```typescript
// Import at top
import { products, stockMovements } from './schema';

// Export after db
export { products, stockMovements };
```

- [ ] **Step 4: Generate migration**

```bash
npx drizzle-kit generate
```

Expected: New migration file created in `drizzle/` folder

- [ ] **Step 5: Push schema to database**

```bash
npx drizzle-kit push
```

Expected: Tables `products` and `stock_movements` created in Supabase

- [ ] **Step 6: Commit**

```bash
git add src/lib/db/schema-products.ts src/lib/db/schema.ts src/lib/db/index.ts drizzle/
git commit -m "feat(db): add products and stock_movements tables"
```

---

## Task 2: Product Types

**Files:**
- Create: `src/types/product.ts`

- [ ] **Step 1: Create product types**

```typescript
// src/types/product.ts
export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  shippingCents: number;
  images: Array<{
    url: string;
    path: string;
    order: number;
    isPrimary: boolean;
  }>;
  stockQuantity: number;
  stockAlertThreshold: number;
  weightGrams: number | null;
  tags: string[] | null;
  payfipProductCode: string | null;
  editionNumber: number | null;
  editionTotal: number | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type StockMovement = {
  id: string;
  productId: string;
  type: 'sale' | 'restock' | 'adjustment' | 'return';
  quantity: number;
  orderId: string | null;
  note: string | null;
  createdBy: string | null;
  createdAt: Date;
};

export type ProductImage = {
  url: string;
  path: string;
  order: number;
  isPrimary: boolean;
};

export type CreateProductInput = {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  shippingCents: number;
  stockQuantity?: number;
  stockAlertThreshold?: number;
  weightGrams?: number;
  tags?: string;
  payfipProductCode?: string;
  editionNumber?: number;
  editionTotal?: number;
  active?: boolean;
};

export type UpdateProductInput = Partial<CreateProductInput>;

export type StockAdjustment = {
  type: 'add' | 'remove' | 'set';
  quantity: number;
  note?: string;
};
```

- [ ] **Step 2: Commit**

```bash
git add src/types/product.ts
git commit -m "feat(types): add product types"
```

---

## Task 3: Product Validations (Zod)

**Files:**
- Create: `src/lib/validations/product.ts`

- [ ] **Step 1: Create validation schemas**

```typescript
// src/lib/validations/product.ts
import { z } from 'zod';

// Slug validation (lowercase, numbers, hyphens only)
const slugRegex = /^[a-z0-9-]+$/;

export const productSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug requis')
    .max(100, 'Slug trop long')
    .regex(slugRegex, 'Slug invalide (minuscules, chiffres, tirets uniquement)'),
  name: z.string().min(1, 'Nom requis').max(255, 'Nom trop long'),
  description: z.string().min(1, 'Description requise'),
  priceCents: z.number().int().min(0, 'Prix doit être >= 0'),
  shippingCents: z.number().int().min(0, 'Frais de port >= 0'),
  stockQuantity: z.number().int().min(0, 'Stock >= 0').default(0),
  stockAlertThreshold: z.number().int().min(0, 'Seuil >= 0').default(5),
  weightGrams: z.number().int().min(0).optional(),
  tags: z.string().optional(),
  payfipProductCode: z.string().max(10).default('11'),
  editionNumber: z.number().int().min(1).optional(),
  editionTotal: z.number().int().min(1).optional(),
  active: z.boolean().default(true),
});

export const updateProductSchema = productSchema.partial();

export const stockAdjustmentSchema = z.object({
  type: z.enum(['add', 'remove', 'set']),
  quantity: z.number().int().min(0, 'Quantité >= 0'),
  note: z.string().optional(),
});

export const imageUploadSchema = z.object({
  isPrimary: z.boolean().default(false),
});

// Transform tags string to array
export function parseTags(tagsString?: string): string[] {
  if (!tagsString) return [];
  return tagsString
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

// Auto-generate slug from name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, '-') // Spaces to hyphens
    .replace(/-+/g, '-'); // Multiple hyphens to single
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/validations/product.ts
git commit -m "feat(validation): add product validation schemas"
```

---

## Task 4: Supabase Storage Helper

**Files:**
- Create: `src/lib/supabase-storage.ts`

- [ ] **Step 1: Create Supabase Storage helper**

```typescript
// src/lib/supabase-storage.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

const BUCKET_NAME = 'products';

/**
 * Upload image to Supabase Storage
 * @param file File buffer
 * @param fileName Unique file name
 * @param productSlug Product slug for folder organization
 * @returns Public URL and storage path
 */
export async function uploadProductImage(
  file: Buffer,
  fileName: string,
  productSlug: string
): Promise<{ url: string; path: string }> {
  const path = `${productSlug}/${fileName}`;

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      contentType: 'image/jpeg',
      cacheControl: '31536000', // 1 year
      upsert: false,
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  return {
    url: publicUrlData.publicUrl,
    path,
  };
}

/**
 * Delete image from Supabase Storage
 * @param path Storage path (e.g., "product-slug/image.jpg")
 */
export async function deleteProductImage(path: string): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) {
    console.error('Supabase delete error:', error);
    throw new Error(`Delete failed: ${error.message}`);
  }
}

/**
 * Delete all images for a product
 * @param productSlug Product slug (folder name)
 */
export async function deleteProductImages(productSlug: string): Promise<void> {
  const { data: files, error: listError } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .list(productSlug);

  if (listError) {
    console.error('List files error:', listError);
    return;
  }

  if (!files || files.length === 0) return;

  const filePaths = files.map((file) => `${productSlug}/${file.name}`);

  const { error: deleteError } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .remove(filePaths);

  if (deleteError) {
    console.error('Bulk delete error:', deleteError);
  }
}
```

- [ ] **Step 2: Create Supabase bucket (manual step)**

Instructions in commit message:
```
Manual step required:
1. Go to Supabase Dashboard → Storage
2. Create new bucket: "products"
3. Make it public (allow public read)
4. Set max file size: 5MB
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase-storage.ts
git commit -m "feat(storage): add Supabase Storage helper for product images

Manual setup required:
- Create 'products' bucket in Supabase
- Set as public
- Max file size: 5MB"
```

---

## Task 5: Product Library (CRUD Functions)

**Files:**
- Create: `src/lib/products.ts`

- [ ] **Step 1: Create product CRUD functions**

```typescript
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
  if (images.length > 0 && !images.some((img) => img.isPrimary)) {
    images[0].isPrimary = true;
  }

  const [updated] = await db
    .update(products)
    .set({ images })
    .where(eq(products.id, productId))
    .returning();

  return updated;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/products.ts
git commit -m "feat(lib): add product CRUD functions"
```

---

## Task 6: Stock Management Library

**Files:**
- Create: `src/lib/stock.ts`

- [ ] **Step 1: Create stock management functions**

```typescript
// src/lib/stock.ts
import { db, products, stockMovements } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import type { StockMovement, StockAdjustment } from '@/types/product';
import { getProductById } from '@/lib/products';

/**
 * Decrement stock (for sales)
 */
export async function decrementStock(
  productId: string,
  quantity: number,
  orderId: string
): Promise<void> {
  const product = await getProductById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  const newStock = Math.max(0, product.stockQuantity - quantity);

  // Update product stock
  await db
    .update(products)
    .set({ stockQuantity: newStock })
    .where(eq(products.id, productId));

  // Record movement
  await db.insert(stockMovements).values({
    productId,
    type: 'sale',
    quantity: -quantity,
    orderId,
    createdBy: 'system',
  });

  console.log(`[STOCK] Decremented: ${product.slug} -${quantity} (new: ${newStock})`);

  // Check stock alert
  if (newStock <= product.stockAlertThreshold && newStock > 0) {
    console.log(`[STOCK] Low stock alert: ${product.slug} (${newStock} left)`);
    // TODO: Send email alert (Task 11)
  }

  // Auto-disable if out of stock
  if (newStock === 0 && product.active) {
    await db
      .update(products)
      .set({ active: false })
      .where(eq(products.id, productId));

    console.log(`[STOCK] Out of stock: ${product.slug} - product disabled`);
    // TODO: Send email alert (Task 11)
  }
}

/**
 * Adjust stock manually (admin)
 */
export async function adjustStock(
  productId: string,
  adjustment: StockAdjustment,
  adminEmail: string
): Promise<void> {
  const product = await getProductById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  let newStock: number;
  let movementQuantity: number;
  let movementType: 'restock' | 'adjustment';

  switch (adjustment.type) {
    case 'add':
      newStock = product.stockQuantity + adjustment.quantity;
      movementQuantity = adjustment.quantity;
      movementType = 'restock';
      break;
    case 'remove':
      newStock = Math.max(0, product.stockQuantity - adjustment.quantity);
      movementQuantity = -adjustment.quantity;
      movementType = 'adjustment';
      break;
    case 'set':
      newStock = adjustment.quantity;
      movementQuantity = adjustment.quantity - product.stockQuantity;
      movementType = 'adjustment';
      break;
  }

  // Update product stock
  await db
    .update(products)
    .set({ stockQuantity: newStock })
    .where(eq(products.id, productId));

  // Record movement
  await db.insert(stockMovements).values({
    productId,
    type: movementType,
    quantity: movementQuantity,
    note: adjustment.note ?? null,
    createdBy: adminEmail,
  });

  console.log(`[STOCK] Adjusted: ${product.slug} ${product.stockQuantity} → ${newStock} by ${adminEmail}`);

  // Auto-reactivate if was inactive and now has stock
  if (!product.active && newStock > 0) {
    await db
      .update(products)
      .set({ active: true })
      .where(eq(products.id, productId));

    console.log(`[STOCK] Product reactivated: ${product.slug} (stock > 0)`);
  }
}

/**
 * Get stock movements for a product
 */
export async function getStockMovements(productId: string): Promise<StockMovement[]> {
  return await db
    .select()
    .from(stockMovements)
    .where(eq(stockMovements.productId, productId))
    .orderBy(desc(stockMovements.createdAt));
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/stock.ts
git commit -m "feat(lib): add stock management functions"
```

---

## Task 7: API Route - GET/POST Products (Admin)

**Files:**
- Create: `src/app/api/admin/products/route.ts`

- [ ] **Step 1: Create admin products route**

```typescript
// src/app/api/admin/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllProducts, createProduct } from '@/lib/products';
import { productSchema } from '@/lib/validations/product';

/**
 * GET /api/admin/products
 * Get all products (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Check auth
    const session = await getServerSession(authOptions);
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
    const session = await getServerSession(authOptions);
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
```

- [ ] **Step 2: Test GET products (empty)**

```bash
# In terminal
curl -X GET http://localhost:3000/api/admin/products \
  -H "Cookie: next-auth.session-token=..." \
  -H "Content-Type: application/json"
```

Expected: `{ "products": [] }`

- [ ] **Step 3: Test POST create product**

```bash
curl -X POST http://localhost:3000/api/admin/products \
  -H "Cookie: next-auth.session-token=..." \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "test-product",
    "name": "Test Product",
    "description": "Test description",
    "priceCents": 1000,
    "shippingCents": 500,
    "stockQuantity": 10
  }'
```

Expected: `{ "product": { "id": "...", "slug": "test-product", ... } }`

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/products/route.ts
git commit -m "feat(api): add GET/POST /api/admin/products"
```

---

## Task 8: API GET/PUT/DELETE Product by ID

**Files:**
- Create: `src/app/api/admin/products/[id]/route.ts`

- [ ] **Step 1: Create product by ID route**

```typescript
// src/app/api/admin/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getProductById, updateProduct, deleteProduct } from '@/lib/products';
import { updateProductSchema } from '@/lib/validations/product';
import { deleteProductImages } from '@/lib/supabase-storage';

/**
 * GET /api/admin/products/[id]
 * Get product by ID (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allowedEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    if (!allowedEmails.includes(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get product
    const product = await getProductById(params.id);

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
  { params }: { params: { id: string } }
) {
  try {
    // Check auth
    const session = await getServerSession(authOptions);
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
    const validation = updateProductSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Update product
    const product = await updateProduct(params.id, validation.data);

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
  { params }: { params: { id: string } }
) {
  try {
    // Check auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allowedEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    if (!allowedEmails.includes(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get product to get slug
    const product = await getProductById(params.id);
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
    await deleteProduct(params.id);

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
```

- [ ] **Step 2: Test GET product by ID**

```bash
curl -X GET http://localhost:3000/api/admin/products/[test-product-id] \
  -H "Cookie: next-auth.session-token=..." \
  -H "Content-Type: application/json"
```

Expected: `{ "product": { "id": "...", ... } }`

- [ ] **Step 3: Test PUT update product**

```bash
curl -X PUT http://localhost:3000/api/admin/products/[test-product-id] \
  -H "Cookie: next-auth.session-token=..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product Updated",
    "priceCents": 1500
  }'
```

Expected: `{ "product": { "name": "Test Product Updated", "priceCents": 1500, ... } }`

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/products/[id]/route.ts
git commit -m "feat(api): add GET/PUT/DELETE /api/admin/products/[id]"
```

---

## Task 9: API Upload Image

**Files:**
- Create: `src/app/api/admin/products/[id]/upload/route.ts`

- [ ] **Step 1: Create image upload route**

```typescript
// src/app/api/admin/products/[id]/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getProductById, addProductImages } from '@/lib/products';
import { uploadProductImage } from '@/lib/supabase-storage';
import { imageUploadSchema } from '@/lib/validations/product';

/**
 * POST /api/admin/products/[id]/upload
 * Upload product image (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allowedEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    if (!allowedEmails.includes(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get product
    const product = await getProductById(params.id);
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
    const updatedProduct = await addProductImages(params.id, [
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
```

- [ ] **Step 2: Test upload image**

```bash
curl -X POST http://localhost:3000/api/admin/products/[test-product-id]/upload \
  -H "Cookie: next-auth.session-token=..." \
  -F "file=@/path/to/test-image.jpg" \
  -F "isPrimary=true"
```

Expected: `{ "product": { "images": [{ "url": "...", "path": "...", "order": 0, "isPrimary": true }], ... } }`

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/products/[id]/upload/route.ts
git commit -m "feat(api): add POST /api/admin/products/[id]/upload"
```

---

## Task 10: API Adjust Stock

**Files:**
- Create: `src/app/api/admin/products/[id]/stock/route.ts`

- [ ] **Step 1: Create stock adjustment route**

```typescript
// src/app/api/admin/products/[id]/stock/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getProductById } from '@/lib/products';
import { adjustStock, getStockMovements } from '@/lib/stock';
import { stockAdjustmentSchema } from '@/lib/validations/product';

/**
 * GET /api/admin/products/[id]/stock
 * Get stock movements (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allowedEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    if (!allowedEmails.includes(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get movements
    const movements = await getStockMovements(params.id);

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
  { params }: { params: { id: string } }
) {
  try {
    // Check auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allowedEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    if (!allowedEmails.includes(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check product exists
    const product = await getProductById(params.id);
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
    await adjustStock(params.id, validation.data, session.user.email);

    // Get updated product
    const updatedProduct = await getProductById(params.id);

    return NextResponse.json({ product: updatedProduct });
  } catch (error: any) {
    console.error('POST /api/admin/products/[id]/stock error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to adjust stock' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Test GET stock movements**

```bash
curl -X GET http://localhost:3000/api/admin/products/[test-product-id]/stock \
  -H "Cookie: next-auth.session-token=..." \
  -H "Content-Type: application/json"
```

Expected: `{ "movements": [] }`

- [ ] **Step 3: Test POST adjust stock**

```bash
curl -X POST http://localhost:3000/api/admin/products/[test-product-id]/stock \
  -H "Cookie: next-auth.session-token=..." \
  -H "Content-Type: application/json" \
  -d '{
    "type": "add",
    "quantity": 50,
    "note": "Initial stock"
  }'
```

Expected: `{ "product": { "stockQuantity": 60, ... } }`

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/products/[id]/stock/route.ts
git commit -m "feat(api): add GET/POST /api/admin/products/[id]/stock"
```

---

## Task 11: Public API Routes

**Files:**
- Create: `src/app/api/products/route.ts`
- Create: `src/app/api/products/[slug]/route.ts`

- [ ] **Step 1: Create public products list route**

```typescript
// src/app/api/products/route.ts
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
```

- [ ] **Step 2: Create public product by slug route**

```typescript
// src/app/api/products/[slug]/route.ts
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
```

- [ ] **Step 3: Test public routes**

```bash
# Test list
curl http://localhost:3000/api/products

# Test by slug
curl http://localhost:3000/api/products/test-product
```

Expected: Products returned without auth

- [ ] **Step 4: Commit**

```bash
git add src/app/api/products/route.ts src/app/api/products/[slug]/route.ts
git commit -m "feat(api): add public product API routes"
```

---

## Task 12: Admin Products List Page

**Files:**
- Create: `src/app/admin/products/page.tsx`
- Create: `src/components/admin/product-list.tsx`

- [ ] **Step 1: Create products list component**

```typescript
// src/components/admin/product-list.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/types/product';

type ProductListProps = {
  initialProducts: Product[];
};

export function ProductList({ initialProducts }: ProductListProps) {
  const [products, setProducts] = useState(initialProducts);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(productId: string, productName: string) {
    if (!confirm(`Supprimer "${productName}" ?`)) return;

    setDeleting(productId);

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Delete failed');
      }

      // Remove from list
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (error: any) {
      alert(`Erreur: ${error.message}`);
    } finally {
      setDeleting(null);
    }
  }

  function formatPrice(cents: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-encre">Catalogue Produits</h1>
          <p className="text-pierre mt-1">{products.length} produit(s)</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="bg-terra hover:bg-terra/90">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Produit
          </Button>
        </Link>
      </div>

      {/* Empty state */}
      {products.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-ivoire-2 rounded-lg">
          <p className="text-pierre mb-4">Aucun produit au catalogue</p>
          <Link href="/admin/products/new">
            <Button>Créer le premier produit</Button>
          </Link>
        </div>
      )}

      {/* Table */}
      {products.length > 0 && (
        <div className="bg-ivoire border border-ivoire-2 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-ivoire-2">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-pierre uppercase">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pierre uppercase">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pierre uppercase">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pierre uppercase">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-pierre uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivoire-2">
              {products.map((product) => {
                const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
                const isLowStock = product.stockQuantity <= product.stockAlertThreshold && product.stockQuantity > 0;
                const isOutOfStock = product.stockQuantity === 0;

                return (
                  <tr key={product.id} className="hover:bg-ivoire-2/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {primaryImage ? (
                          <Image
                            src={primaryImage.url}
                            alt={product.name}
                            width={48}
                            height={60}
                            className="rounded object-cover"
                          />
                        ) : (
                          <div className="w-12 h-15 bg-ivoire-2 rounded flex items-center justify-center">
                            <span className="text-pierre text-xs">Aucune</span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-encre">{product.name}</p>
                          <p className="text-sm text-pierre">
                            {product.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-encre">
                      {formatPrice(product.priceCents)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={isOutOfStock ? 'text-red-600' : isLowStock ? 'text-orange-600' : 'text-encre'}>
                          {product.stockQuantity}
                        </span>
                        {isLowStock && (
                          <AlertCircle className="w-4 h-4 text-orange-600" />
                        )}
                        {isOutOfStock && (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={product.active ? 'default' : 'secondary'}
                        className={product.active ? 'bg-green-100 text-green-800' : ''}
                      >
                        {product.active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={deleting === product.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create products page**

```typescript
// src/app/admin/products/page.tsx
import { getAllProducts } from '@/lib/products';
import { ProductList } from '@/components/admin/product-list';

export const metadata = {
  title: 'Catalogue Produits - Admin',
};

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return <ProductList initialProducts={products} />;
}
```

- [ ] **Step 3: Test page**

Navigate to: `http://localhost:3000/admin/products`

Expected: Table with products, "Nouveau Produit" button

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/products/page.tsx src/components/admin/product-list.tsx
git commit -m "feat(admin): add products list page"
```

---

## Task 13: Product Form Component

**Files:**
- Create: `src/components/admin/product-form.tsx`
- Create: `src/app/admin/products/new/page.tsx`
- Create: `src/app/admin/products/[id]/edit/page.tsx`

- [ ] **Step 1: Create product form component**

```typescript
// src/components/admin/product-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { generateSlug } from '@/lib/validations/product';
import type { Product } from '@/types/product';

type ProductFormProps = {
  product?: Product;
  mode: 'create' | 'edit';
};

export function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    slug: product?.slug || '',
    name: product?.name || '',
    description: product?.description || '',
    priceCents: product ? product.priceCents / 100 : 0,
    shippingCents: product ? product.shippingCents / 100 : 0,
    stockQuantity: product?.stockQuantity || 0,
    stockAlertThreshold: product?.stockAlertThreshold || 5,
    weightGrams: product?.weightGrams || 0,
    tags: product?.tags?.join(', ') || '',
    payfipProductCode: product?.payfipProductCode || '11',
    editionNumber: product?.editionNumber || undefined,
    editionTotal: product?.editionTotal || undefined,
    active: product?.active ?? true,
  });

  function handleNameChange(name: string) {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: mode === 'create' ? generateSlug(name) : prev.slug,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        priceCents: Math.round(formData.priceCents * 100),
        shippingCents: Math.round(formData.shippingCents * 100),
        weightGrams: formData.weightGrams || undefined,
        editionNumber: formData.editionNumber || undefined,
        editionTotal: formData.editionTotal || undefined,
      };

      const url = mode === 'create'
        ? '/api/admin/products'
        : `/api/admin/products/${product!.id}`;

      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save product');
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-ivoire border border-ivoire-2 rounded-lg p-6">
        <h2 className="text-xl font-bold text-encre mb-4">Informations Générales</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nom du Produit *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              placeholder="Mug Ville Edition 2024"
            />
          </div>

          <div>
            <Label htmlFor="slug">Slug (URL) *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              required
              placeholder="mug-ville-2024"
              pattern="^[a-z0-9-]+$"
              title="Minuscules, chiffres et tirets uniquement"
            />
            <p className="text-sm text-pierre mt-1">
              Auto-généré depuis le nom (modifiable)
            </p>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              required
              rows={4}
              placeholder="Mug céramique blanc avec logo de la ville..."
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags (séparés par virgules)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
              placeholder="vaisselle, collection, édition limitée"
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-ivoire border border-ivoire-2 rounded-lg p-6">
        <h2 className="text-xl font-bold text-encre mb-4">Prix</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Prix TTC (€) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.priceCents}
              onChange={(e) => setFormData((prev) => ({ ...prev, priceCents: parseFloat(e.target.value) }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="shipping">Frais de Port (€) *</Label>
            <Input
              id="shipping"
              type="number"
              step="0.01"
              min="0"
              value={formData.shippingCents}
              onChange={(e) => setFormData((prev) => ({ ...prev, shippingCents: parseFloat(e.target.value) }))}
              required
            />
          </div>
        </div>
      </div>

      {/* Stock */}
      <div className="bg-ivoire border border-ivoire-2 rounded-lg p-6">
        <h2 className="text-xl font-bold text-encre mb-4">Stock</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="stock">Quantité en Stock *</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={formData.stockQuantity}
              onChange={(e) => setFormData((prev) => ({ ...prev, stockQuantity: parseInt(e.target.value) }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="threshold">Seuil d'Alerte</Label>
            <Input
              id="threshold"
              type="number"
              min="0"
              value={formData.stockAlertThreshold}
              onChange={(e) => setFormData((prev) => ({ ...prev, stockAlertThreshold: parseInt(e.target.value) }))}
            />
            <p className="text-sm text-pierre mt-1">
              Email envoyé si stock ≤ seuil
            </p>
          </div>
        </div>
      </div>

      {/* Additional */}
      <div className="bg-ivoire border border-ivoire-2 rounded-lg p-6">
        <h2 className="text-xl font-bold text-encre mb-4">Informations Complémentaires</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="weight">Poids (grammes)</Label>
            <Input
              id="weight"
              type="number"
              min="0"
              value={formData.weightGrams || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, weightGrams: parseInt(e.target.value) || 0 }))}
            />
          </div>

          <div>
            <Label htmlFor="payfip">Code Produit PayFiP</Label>
            <Input
              id="payfip"
              value={formData.payfipProductCode}
              onChange={(e) => setFormData((prev) => ({ ...prev, payfipProductCode: e.target.value }))}
              maxLength={10}
            />
          </div>

          <div>
            <Label htmlFor="editionNum">Numéro d'Édition</Label>
            <Input
              id="editionNum"
              type="number"
              min="1"
              value={formData.editionNumber || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, editionNumber: parseInt(e.target.value) || undefined }))}
              placeholder="Ex: 1"
            />
          </div>

          <div>
            <Label htmlFor="editionTotal">Total Édition</Label>
            <Input
              id="editionTotal"
              type="number"
              min="1"
              value={formData.editionTotal || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, editionTotal: parseInt(e.target.value) || undefined }))}
              placeholder="Ex: 100"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Switch
            id="active"
            checked={formData.active}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, active: checked }))}
          />
          <Label htmlFor="active" className="font-normal">
            Produit actif (visible sur le site)
          </Label>
        </div>
      </div>

      {/* Recommended Image Format */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Format d'image recommandé :</strong> 600×750px (ratio 4:5) pour une harmonie visuelle.
          Maximum 5 images par produit.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button
          type="submit"
          disabled={loading}
          className="bg-terra hover:bg-terra/90"
        >
          {loading ? 'Enregistrement...' : mode === 'create' ? 'Créer le Produit' : 'Mettre à Jour'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Create new product page**

```typescript
// src/app/admin/products/new/page.tsx
import { ProductForm } from '@/components/admin/product-form';

export const metadata = {
  title: 'Nouveau Produit - Admin',
};

export default function NewProductPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-encre mb-8">Nouveau Produit</h1>
      <ProductForm mode="create" />
    </div>
  );
}
```

- [ ] **Step 3: Create edit product page**

```typescript
// src/app/admin/products/[id]/edit/page.tsx
import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/products';
import { ProductForm } from '@/components/admin/product-form';

export const metadata = {
  title: 'Modifier Produit - Admin',
};

type EditProductPageProps = {
  params: { id: string };
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-encre mb-8">
        Modifier : {product.name}
      </h1>
      <ProductForm product={product} mode="edit" />
    </div>
  );
}
```

- [ ] **Step 4: Test form**

Navigate to: `http://localhost:3000/admin/products/new`

Expected: Form with all fields, can create product

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/product-form.tsx src/app/admin/products/new/page.tsx src/app/admin/products/[id]/edit/page.tsx
git commit -m "feat(admin): add product create/edit forms"
```

---

## Task 14: Image Upload Component

**Files:**
- Create: `src/components/admin/image-upload.tsx`
- Modify: `src/app/admin/products/[id]/edit/page.tsx`

- [ ] **Step 1: Create image upload component**

```typescript
// src/components/admin/image-upload.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Upload, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types/product';

type ImageUploadProps = {
  product: Product;
  onUpdate: () => void;
};

export function ImageUpload({ product, onUpdate }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check max images
    if (product.images.length >= 5) {
      alert('Maximum 5 images par produit');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('isPrimary', product.images.length === 0 ? 'true' : 'false');

      const res = await fetch(`/api/admin/products/${product.id}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      onUpdate();
    } catch (error: any) {
      alert(`Erreur upload: ${error.message}`);
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  }

  async function handleDelete(imagePath: string) {
    if (!confirm('Supprimer cette image ?')) return;

    setDeleting(imagePath);

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: product.images.filter((img) => img.path !== imagePath),
        }),
      });

      if (!res.ok) {
        throw new Error('Delete failed');
      }

      onUpdate();
    } catch (error: any) {
      alert(`Erreur: ${error.message}`);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="bg-ivoire border border-ivoire-2 rounded-lg p-6">
      <h2 className="text-xl font-bold text-encre mb-4">
        Galerie Photos ({product.images.length}/5)
      </h2>

      {/* Image Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {product.images
          .sort((a, b) => a.order - b.order)
          .map((image) => (
            <div key={image.path} className="relative group">
              <div className="aspect-[4/5] bg-ivoire-2 rounded-lg overflow-hidden relative">
                <Image
                  src={image.url}
                  alt=""
                  fill
                  className="object-cover"
                />
                {image.isPrimary && (
                  <div className="absolute top-2 left-2 bg-terra text-ivoire px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Principale
                  </div>
                )}
                {/* Delete button */}
                <button
                  onClick={() => handleDelete(image.path)}
                  disabled={deleting === image.path}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

        {/* Upload button */}
        {product.images.length < 5 && (
          <label className="aspect-[4/5] bg-ivoire-2 border-2 border-dashed border-pierre/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-terra hover:bg-terra/5 transition-colors">
            <Upload className="w-8 h-8 text-pierre mb-2" />
            <span className="text-sm text-pierre">Ajouter une image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Upload status */}
      {uploading && (
        <p className="text-sm text-pierre">Upload en cours...</p>
      )}

      {/* Recommended format */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
        <strong>Format recommandé :</strong> 600×750px (ratio 4:5) • Max 5MB par image
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add image upload to edit page**

Modify `src/app/admin/products/[id]/edit/page.tsx`:

```typescript
import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/products';
import { ProductForm } from '@/components/admin/product-form';
import { ImageUpload } from '@/components/admin/image-upload';

export const metadata = {
  title: 'Modifier Produit - Admin',
};

type EditProductPageProps = {
  params: { id: string };
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-encre">
        Modifier : {product.name}
      </h1>

      {/* Image Upload */}
      <ImageUpload
        product={product}
        onUpdate={() => window.location.reload()}
      />

      {/* Form */}
      <ProductForm product={product} mode="edit" />
    </div>
  );
}
```

- [ ] **Step 3: Test image upload**

Navigate to edit page, upload images

Expected: Images displayed, can delete, first image marked as primary

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/image-upload.tsx src/app/admin/products/[id]/edit/page.tsx
git commit -m "feat(admin): add image upload component"
```

---

## Task 15: Stock Adjuster Component

**Files:**
- Create: `src/components/admin/stock-adjuster.tsx`
- Modify: `src/app/admin/products/[id]/edit/page.tsx`

- [ ] **Step 1: Create stock adjuster component**

```typescript
// src/components/admin/stock-adjuster.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Minus, RefreshCw, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Product, StockMovement } from '@/types/product';

type StockAdjusterProps = {
  product: Product;
  onUpdate: () => void;
};

export function StockAdjuster({ product, onUpdate }: StockAdjusterProps) {
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove' | 'set'>('add');
  const [quantity, setQuantity] = useState(0);
  const [note, setNote] = useState('');

  async function loadMovements() {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}/stock`);
      if (!res.ok) throw new Error('Failed to load movements');
      const data = await res.json();
      setMovements(data.movements);
    } catch (error) {
      console.error('Load movements error:', error);
    } finally {
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    if (showHistory) {
      loadMovements();
    }
  }, [showHistory]);

  async function handleAdjust() {
    if (quantity <= 0 && adjustmentType !== 'set') {
      alert('Quantité doit être > 0');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/admin/products/${product.id}/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: adjustmentType,
          quantity,
          note: note || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Adjustment failed');
      }

      // Reset form
      setQuantity(0);
      setNote('');

      // Refresh
      onUpdate();

      // Reload movements if showing
      if (showHistory) {
        loadMovements();
      }
    } catch (error: any) {
      alert(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(date));
  }

  const isLowStock = product.stockQuantity <= product.stockAlertThreshold && product.stockQuantity > 0;
  const isOutOfStock = product.stockQuantity === 0;

  return (
    <div className="bg-ivoire border border-ivoire-2 rounded-lg p-6">
      <h2 className="text-xl font-bold text-encre mb-4">Gestion du Stock</h2>

      {/* Current Stock */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm text-pierre">Stock Actuel</p>
            <p className={`text-3xl font-bold ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-orange-600' : 'text-encre'}`}>
              {product.stockQuantity}
            </p>
          </div>
          {isLowStock && (
            <div className="bg-orange-50 border border-orange-200 text-orange-800 px-3 py-2 rounded text-sm">
              Stock faible (seuil: {product.stockAlertThreshold})
            </div>
          )}
          {isOutOfStock && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
              Rupture de stock
            </div>
          )}
        </div>
      </div>

      {/* Adjustment Form */}
      <div className="space-y-4">
        <div>
          <Label>Type d'Ajustement</Label>
          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              variant={adjustmentType === 'add' ? 'default' : 'outline'}
              onClick={() => setAdjustmentType('add')}
              className="flex-1"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
            <Button
              type="button"
              variant={adjustmentType === 'remove' ? 'default' : 'outline'}
              onClick={() => setAdjustmentType('remove')}
              className="flex-1"
            >
              <Minus className="w-4 h-4 mr-2" />
              Retirer
            </Button>
            <Button
              type="button"
              variant={adjustmentType === 'set' ? 'default' : 'outline'}
              onClick={() => setAdjustmentType('set')}
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Définir
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="quantity">Quantité</Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
          />
        </div>

        <div>
          <Label htmlFor="note">Note (optionnelle)</Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Ex: Réapprovisionnement fournisseur"
          />
        </div>

        <Button
          onClick={handleAdjust}
          disabled={loading}
          className="w-full bg-terra hover:bg-terra/90"
        >
          {loading ? 'Ajustement...' : 'Appliquer l\'Ajustement'}
        </Button>
      </div>

      {/* History Toggle */}
      <div className="mt-6 pt-6 border-t border-ivoire-2">
        <Button
          variant="outline"
          onClick={() => setShowHistory(!showHistory)}
          className="w-full"
        >
          <History className="w-4 h-4 mr-2" />
          {showHistory ? 'Masquer' : 'Voir'} l'Historique
        </Button>
      </div>

      {/* History */}
      {showHistory && (
        <div className="mt-4">
          {loadingHistory && <p className="text-sm text-pierre">Chargement...</p>}

          {!loadingHistory && movements.length === 0 && (
            <p className="text-sm text-pierre">Aucun mouvement de stock</p>
          )}

          {!loadingHistory && movements.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {movements.map((movement) => (
                <div
                  key={movement.id}
                  className="bg-ivoire-2/50 p-3 rounded text-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-encre">
                      {movement.type === 'sale' && 'Vente'}
                      {movement.type === 'restock' && 'Réapprovisionnement'}
                      {movement.type === 'adjustment' && 'Ajustement'}
                      {movement.type === 'return' && 'Retour'}
                    </span>
                    <span className={movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                      {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                    </span>
                  </div>
                  <div className="text-xs text-pierre">
                    {formatDate(movement.createdAt)}
                    {movement.createdBy && ` • ${movement.createdBy}`}
                  </div>
                  {movement.note && (
                    <div className="text-xs text-pierre mt-1 italic">
                      {movement.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add stock adjuster to edit page**

Modify `src/app/admin/products/[id]/edit/page.tsx`:

```typescript
import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/products';
import { ProductForm } from '@/components/admin/product-form';
import { ImageUpload } from '@/components/admin/image-upload';
import { StockAdjuster } from '@/components/admin/stock-adjuster';

export const metadata = {
  title: 'Modifier Produit - Admin',
};

type EditProductPageProps = {
  params: { id: string };
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-encre">
        Modifier : {product.name}
      </h1>

      {/* Image Upload */}
      <ImageUpload
        product={product}
        onUpdate={() => window.location.reload()}
      />

      {/* Stock Adjuster */}
      <StockAdjuster
        product={product}
        onUpdate={() => window.location.reload()}
      />

      {/* Form */}
      <ProductForm product={product} mode="edit" />
    </div>
  );
}
```

- [ ] **Step 3: Test stock adjuster**

Navigate to edit page, adjust stock

Expected: Stock changes, movements recorded, alerts show correctly

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/stock-adjuster.tsx src/app/admin/products/[id]/edit/page.tsx
git commit -m "feat(admin): add stock adjuster component"
```

---

## Task 16: Integrate Stock Decrement in PayFiP Webhook

**Files:**
- Modify: `src/app/api/payfip/notification/route.ts`

- [ ] **Step 1: Read current webhook**

```bash
cat src/app/api/payfip/notification/route.ts
```

- [ ] **Step 2: Add stock decrement after payment**

Add import at top:

```typescript
import { decrementStock } from '@/lib/stock';
import { getProductBySlug } from '@/lib/products';
```

Find the section after order is marked as paid, add stock decrement logic:

```typescript
// After setting order status to 'paid'

// Decrement stock for each item
for (const item of order.items) {
  try {
    const product = await getProductBySlug(item.product_id);
    if (product) {
      await decrementStock(product.id, item.qty, order.id);
      console.log(`[PAYFIP] Stock decremented: ${product.slug} -${item.qty}`);
    } else {
      console.warn(`[PAYFIP] Product not found for stock decrement: ${item.product_id}`);
    }
  } catch (stockError) {
    console.error(`[PAYFIP] Stock decrement error for ${item.product_id}:`, stockError);
    // Continue processing other items
  }
}
```

- [ ] **Step 3: Test payment flow**

Complete a test payment with PayFiP

Expected: Stock decremented, movement recorded, alerts sent if low stock

- [ ] **Step 4: Commit**

```bash
git add src/app/api/payfip/notification/route.ts
git commit -m "feat(payfip): integrate automatic stock decrement on payment"
```

---

## Task 17: Email Templates & Alerts

**Files:**
- Create: `src/emails/stock-alert.tsx`
- Create: `src/emails/out-of-stock.tsx`
- Create: `src/lib/email-alerts.ts`
- Modify: `src/lib/stock.ts`

- [ ] **Step 1: Create stock alert email template**

```typescript
// src/emails/stock-alert.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components';

type StockAlertEmailProps = {
  productName: string;
  productSlug: string;
  currentStock: number;
  threshold: number;
  adminUrl: string;
};

export function StockAlertEmail({
  productName,
  productSlug,
  currentStock,
  threshold,
  adminUrl,
}: StockAlertEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Stock faible : {productName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>⚠️ Alerte Stock Faible</Heading>

          <Text style={text}>
            Le produit <strong>{productName}</strong> a un stock faible.
          </Text>

          <Text style={text}>
            Stock actuel : <strong>{currentStock}</strong> (seuil : {threshold})
          </Text>

          <Text style={text}>
            <Link href={`${adminUrl}/admin/products`}>
              Gérer le stock dans l'admin
            </Link>
          </Text>

          <Text style={footer}>
            1885 Manufacture Alfortvillaise
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  textAlign: 'center' as const,
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '32px 0 0 0',
  textAlign: 'center' as const,
};
```

- [ ] **Step 2: Create out-of-stock email template**

```typescript
// src/emails/out-of-stock.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components';

type OutOfStockEmailProps = {
  productName: string;
  productSlug: string;
  adminUrl: string;
};

export function OutOfStockEmail({
  productName,
  productSlug,
  adminUrl,
}: OutOfStockEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Rupture de stock : {productName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🚨 Rupture de Stock</Heading>

          <Text style={text}>
            Le produit <strong>{productName}</strong> est en rupture de stock.
          </Text>

          <Text style={text}>
            Le produit a été automatiquement désactivé sur le site.
          </Text>

          <Text style={text}>
            <Link href={`${adminUrl}/admin/products`}>
              Réapprovisionner dans l'admin
            </Link>
          </Text>

          <Text style={footer}>
            1885 Manufacture Alfortvillaise
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  textAlign: 'center' as const,
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '32px 0 0 0',
  textAlign: 'center' as const,
};
```

- [ ] **Step 3: Create email alert helper**

```typescript
// src/lib/email-alerts.ts
import { Resend } from 'resend';
import { StockAlertEmail } from '@/emails/stock-alert';
import { OutOfStockEmail } from '@/emails/out-of-stock';
import type { Product } from '@/types/product';

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || [];
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Send low stock alert email
 */
export async function sendLowStockAlert(product: Product): Promise<void> {
  if (ADMIN_EMAILS.length === 0) {
    console.warn('[EMAIL] No admin emails configured for stock alerts');
    return;
  }

  try {
    await resend.emails.send({
      from: 'alerts@1885.fr',
      to: ADMIN_EMAILS,
      subject: `⚠️ Stock faible : ${product.name}`,
      react: StockAlertEmail({
        productName: product.name,
        productSlug: product.slug,
        currentStock: product.stockQuantity,
        threshold: product.stockAlertThreshold,
        adminUrl: APP_URL,
      }),
    });

    console.log(`[EMAIL] Low stock alert sent for ${product.slug}`);
  } catch (error) {
    console.error('[EMAIL] Failed to send low stock alert:', error);
  }
}

/**
 * Send out-of-stock alert email
 */
export async function sendOutOfStockAlert(product: Product): Promise<void> {
  if (ADMIN_EMAILS.length === 0) {
    console.warn('[EMAIL] No admin emails configured for stock alerts');
    return;
  }

  try {
    await resend.emails.send({
      from: 'alerts@1885.fr',
      to: ADMIN_EMAILS,
      subject: `🚨 Rupture de stock : ${product.name}`,
      react: OutOfStockEmail({
        productName: product.name,
        productSlug: product.slug,
        adminUrl: APP_URL,
      }),
    });

    console.log(`[EMAIL] Out-of-stock alert sent for ${product.slug}`);
  } catch (error) {
    console.error('[EMAIL] Failed to send out-of-stock alert:', error);
  }
}
```

- [ ] **Step 4: Integrate alerts into stock.ts**

Modify `src/lib/stock.ts` to import and call email functions:

```typescript
// Add import at top
import { sendLowStockAlert, sendOutOfStockAlert } from '@/lib/email-alerts';

// In decrementStock function, replace TODO comments:

// After low stock check
if (newStock <= product.stockAlertThreshold && newStock > 0) {
  console.log(`[STOCK] Low stock alert: ${product.slug} (${newStock} left)`);
  await sendLowStockAlert({ ...product, stockQuantity: newStock });
}

// After out of stock check
if (newStock === 0 && product.active) {
  await db
    .update(products)
    .set({ active: false })
    .where(eq(products.id, productId));

  console.log(`[STOCK] Out of stock: ${product.slug} - product disabled`);
  await sendOutOfStockAlert({ ...product, stockQuantity: 0, active: false });
}
```

- [ ] **Step 5: Test email alerts**

Manually decrement stock to trigger alerts

Expected: Emails sent to ADMIN_EMAILS when stock is low or zero

- [ ] **Step 6: Commit**

```bash
git add src/emails/stock-alert.tsx src/emails/out-of-stock.tsx src/lib/email-alerts.ts src/lib/stock.ts
git commit -m "feat(email): add stock alert emails"
```

---

## Task 18: Update Homepage to use API

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace catalogue.ts with API call**

Modify `src/app/page.tsx`:

Replace:
```typescript
import { catalogue } from '@/lib/catalogue';
```

With:
```typescript
import { getActiveProducts } from '@/lib/products';
```

Replace in component:
```typescript
const products = catalogue;
```

With:
```typescript
const products = await getActiveProducts();
```

- [ ] **Step 2: Test homepage**

Navigate to: `http://localhost:3000`

Expected: Products loaded from database instead of catalogue.ts

- [ ] **Step 3: Deprecate catalogue.ts**

Add warning comment to `src/lib/catalogue.ts`:

```typescript
/**
 * @deprecated This file is deprecated. Products are now managed via database.
 * Use getActiveProducts() from @/lib/products instead.
 * This file will be removed after migration is complete.
 */
```

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/lib/catalogue.ts
git commit -m "feat(homepage): use database products instead of catalogue.ts"
```

---

## Task 19: Tests

**Files:**
- Create: `src/__tests__/products.test.ts`
- Create: `src/__tests__/stock.test.ts`

- [ ] **Step 1: Create product CRUD tests**

```typescript
// src/__tests__/products.test.ts
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createProduct, getProductById, updateProduct, deleteProduct, slugExists } from '@/lib/products';
import { db, products } from '@/lib/db';
import { eq } from 'drizzle-orm';

describe('Product CRUD', () => {
  let testProductId: string;

  afterAll(async () => {
    // Cleanup
    if (testProductId) {
      await db.delete(products).where(eq(products.id, testProductId));
    }
  });

  it('should create a product', async () => {
    const product = await createProduct({
      slug: 'test-product-crud',
      name: 'Test Product',
      description: 'Test description',
      priceCents: 1000,
      shippingCents: 500,
      stockQuantity: 10,
    });

    expect(product).toBeDefined();
    expect(product.slug).toBe('test-product-crud');
    expect(product.stockQuantity).toBe(10);

    testProductId = product.id;
  });

  it('should get product by ID', async () => {
    const product = await getProductById(testProductId);

    expect(product).toBeDefined();
    expect(product?.id).toBe(testProductId);
  });

  it('should update product', async () => {
    const updated = await updateProduct(testProductId, {
      name: 'Updated Name',
      priceCents: 1500,
    });

    expect(updated.name).toBe('Updated Name');
    expect(updated.priceCents).toBe(1500);
  });

  it('should check slug exists', async () => {
    const exists = await slugExists('test-product-crud');
    expect(exists).toBe(true);

    const notExists = await slugExists('non-existent-slug');
    expect(notExists).toBe(false);
  });

  it('should prevent duplicate slugs', async () => {
    await expect(
      createProduct({
        slug: 'test-product-crud', // Same slug
        name: 'Duplicate',
        description: 'Test',
        priceCents: 1000,
        shippingCents: 500,
      })
    ).rejects.toThrow('Slug already exists');
  });

  it('should delete product', async () => {
    await deleteProduct(testProductId);

    const deleted = await getProductById(testProductId);
    expect(deleted).toBeNull();

    testProductId = ''; // Mark as cleaned up
  });
});
```

- [ ] **Step 2: Create stock management tests**

```typescript
// src/__tests__/stock.test.ts
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createProduct, getProductById, deleteProduct } from '@/lib/products';
import { decrementStock, adjustStock, getStockMovements } from '@/lib/stock';
import { db, products } from '@/lib/db';
import { eq } from 'drizzle-orm';

describe('Stock Management', () => {
  let testProductId: string;

  beforeAll(async () => {
    const product = await createProduct({
      slug: 'test-stock-product',
      name: 'Test Stock Product',
      description: 'Test',
      priceCents: 1000,
      shippingCents: 500,
      stockQuantity: 50,
      stockAlertThreshold: 5,
    });
    testProductId = product.id;
  });

  afterAll(async () => {
    await db.delete(products).where(eq(products.id, testProductId));
  });

  it('should decrement stock', async () => {
    await decrementStock(testProductId, 10, 'test-order-id');

    const product = await getProductById(testProductId);
    expect(product?.stockQuantity).toBe(40);
  });

  it('should record stock movement', async () => {
    const movements = await getStockMovements(testProductId);
    expect(movements.length).toBeGreaterThan(0);
    expect(movements[0].type).toBe('sale');
    expect(movements[0].quantity).toBe(-10);
  });

  it('should adjust stock (add)', async () => {
    await adjustStock(
      testProductId,
      { type: 'add', quantity: 20, note: 'Test restock' },
      'admin@test.com'
    );

    const product = await getProductById(testProductId);
    expect(product?.stockQuantity).toBe(60);
  });

  it('should adjust stock (remove)', async () => {
    await adjustStock(
      testProductId,
      { type: 'remove', quantity: 15 },
      'admin@test.com'
    );

    const product = await getProductById(testProductId);
    expect(product?.stockQuantity).toBe(45);
  });

  it('should adjust stock (set)', async () => {
    await adjustStock(
      testProductId,
      { type: 'set', quantity: 100 },
      'admin@test.com'
    );

    const product = await getProductById(testProductId);
    expect(product?.stockQuantity).toBe(100);
  });

  it('should not allow negative stock', async () => {
    await decrementStock(testProductId, 200, 'test-order-2');

    const product = await getProductById(testProductId);
    expect(product?.stockQuantity).toBe(0); // Should stop at 0
  });
});
```

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: All tests passing

- [ ] **Step 4: Commit**

```bash
git add src/__tests__/
git commit -m "test: add product and stock management tests"
```

---

## Task 20: Final Integration & Cleanup

**Files:**
- Update: `.env.example`
- Update: `README.md`
- Remove: `src/lib/catalogue.ts` (after confirming migration)

- [ ] **Step 1: Update .env.example**

Add Supabase Storage variables:

```bash
# Add to .env.example
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

- [ ] **Step 2: Update README.md**

Add section about product management:

```markdown
## Product Management

### Admin Interface

Access the admin product management at `/admin/products` (requires admin authentication).

**Features:**
- Create, edit, delete products
- Multi-image gallery (up to 5 images per product)
- Stock management with automatic alerts
- Stock movement history
- Automatic stock decrement on sale

**Recommended image format:** 600×750px (ratio 4:5)

### Environment Variables

Required for product catalog:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_EMAILS=admin@example.com,webmaster@example.com
```

### Database Schema

Products are stored in PostgreSQL with:
- `products` table - Product catalog with JSONB images
- `stock_movements` table - Stock history tracking

Run migrations:
```bash
npx drizzle-kit push
```

### Stock Alerts

Automatic email alerts sent to ADMIN_EMAILS when:
- Stock reaches alert threshold (low stock warning)
- Stock reaches zero (out of stock, product auto-disabled)
- Product reactivated when stock added

### Migration from catalogue.ts

Products previously in `src/lib/catalogue.ts` should be migrated to database via admin UI.
After migration, `catalogue.ts` can be safely removed.
```

- [ ] **Step 3: Verify complete workflow**

Full test of product lifecycle:

```bash
# 1. Create product in admin
# 2. Upload images
# 3. Adjust stock
# 4. Verify product visible on homepage
# 5. Complete test purchase (PayFiP sandbox)
# 6. Verify stock decremented
# 7. Check email alerts if stock low
```

Expected: Complete flow works end-to-end

- [ ] **Step 4: Remove catalogue.ts (if migration complete)**

```bash
# Only if all products migrated
git rm src/lib/catalogue.ts
```

- [ ] **Step 5: Final commit**

```bash
git add .env.example README.md
git commit -m "docs: update documentation for product catalog admin

- Add Supabase Storage env vars
- Document admin interface features
- Document stock alert system
- Add migration notes"
```

---

## Implementation Complete

All 20 tasks completed. The product catalog admin interface is now fully functional with:

✅ Database schema (products + stock_movements)
✅ Complete CRUD API (admin + public)
✅ Image upload to Supabase Storage (max 5 images)
✅ Stock management with automatic decrement
✅ Email alerts (low stock + out of stock)
✅ Admin UI (list, create, edit, delete)
✅ Integration with PayFiP webhook
✅ Tests
✅ Documentation

**Next steps:**
1. Manually create Supabase Storage bucket "products"
2. Add SUPABASE_SERVICE_ROLE_KEY to .env
3. Migrate existing products from catalogue.ts to database via admin UI
4. Test complete purchase flow
5. Monitor stock alerts
