// src/lib/stock.ts
import { db, products, stockMovements } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import type { StockMovement, StockAdjustment } from '@/types/product';
import { getProductById } from '@/lib/products';
import { sendLowStockAlert, sendOutOfStockAlert } from '@/lib/email-alerts';

/**
 * Decrement stock (for sales)
 * Supports both global stock and size-specific stock
 */
export async function decrementStock(
  productId: string,
  quantity: number,
  orderId: string,
  size?: string
): Promise<void> {
  const product = await getProductById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  if (size && product.sizes && product.sizes.length > 0) {
    // Decrement size-specific stock
    const sizeIndex = product.sizes.findIndex((s) => s.size === size);
    if (sizeIndex === -1) {
      throw new Error(`Size ${size} not found for product ${product.slug}`);
    }

    const updatedSizes = [...product.sizes];
    const currentStock = updatedSizes[sizeIndex].stock;
    const newStock = Math.max(0, currentStock - quantity);
    updatedSizes[sizeIndex] = { ...updatedSizes[sizeIndex], stock: newStock };

    // Update product with new sizes
    await db
      .update(products)
      .set({ sizes: updatedSizes })
      .where(eq(products.id, productId));

    // Record movement
    await db.insert(stockMovements).values({
      productId,
      type: 'sale',
      quantity: -quantity,
      orderId,
      note: `Size ${size}`,
      createdBy: 'system',
    });

    console.log(`[STOCK] Decremented: ${product.slug} (${size}) -${quantity} (new: ${newStock})`);

    // Check stock alert for this size
    if (newStock <= updatedSizes[sizeIndex].stockAlertThreshold && newStock > 0) {
      console.log(`[STOCK] Low stock alert: ${product.slug} (${size}) - ${newStock} left`);
    }

    // Check if all sizes are out of stock
    const allSizesOutOfStock = updatedSizes.every((s) => s.stock === 0);
    if (allSizesOutOfStock && product.active) {
      await db
        .update(products)
        .set({ active: false })
        .where(eq(products.id, productId));

      console.log(`[STOCK] All sizes out of stock: ${product.slug} - product disabled`);
    }
  } else {
    // Decrement global stock (legacy behavior)
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
      // Send email alert asynchronously (don't await to avoid blocking)
      const updatedProduct = { ...product, stockQuantity: newStock };
      sendLowStockAlert(updatedProduct).catch(err =>
        console.error('[STOCK] Email alert failed:', err)
      );
    }

    // Auto-disable if out of stock
    if (newStock === 0 && product.active) {
      await db
        .update(products)
        .set({ active: false })
        .where(eq(products.id, productId));

      console.log(`[STOCK] Out of stock: ${product.slug} - product disabled`);
      // Send email alert asynchronously (don't await to avoid blocking)
      const updatedProduct = { ...product, stockQuantity: newStock, active: false };
      sendOutOfStockAlert(updatedProduct).catch(err =>
        console.error('[STOCK] Email alert failed:', err)
      );
    }
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
