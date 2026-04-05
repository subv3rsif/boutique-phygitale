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
    // TODO: Send email alert (Task 17)
  }

  // Auto-disable if out of stock
  if (newStock === 0 && product.active) {
    await db
      .update(products)
      .set({ active: false })
      .where(eq(products.id, productId));

    console.log(`[STOCK] Out of stock: ${product.slug} - product disabled`);
    // TODO: Send email alert (Task 17)
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
