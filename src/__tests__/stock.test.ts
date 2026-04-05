import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  decrementStock,
  adjustStock,
  getStockMovements,
} from '@/lib/stock';
import {
  createProduct,
  getProductById,
  deleteProduct,
} from '@/lib/products';
import type { CreateProductInput } from '@/types/product';

describe('Stock Management', () => {
  // Store test product IDs for cleanup
  const testProductIds: string[] = [];
  const testSlug = `test-stock-product-${Date.now()}`;

  afterAll(async () => {
    // Cleanup: delete all test products (cascade deletes stock movements)
    for (const id of testProductIds) {
      try {
        await deleteProduct(id);
        console.log(`[TEST CLEANUP] Deleted product: ${id}`);
      } catch (error) {
        console.warn(`[TEST CLEANUP] Failed to delete product ${id}:`, error);
      }
    }
  });

  describe('decrementStock', () => {
    it('should decrement stock for a sale', async () => {
      const input: CreateProductInput = {
        slug: `${testSlug}-decrement`,
        name: 'Stock Decrement Test',
        description: 'Testing stock decrement',
        priceCents: 1500,
        shippingCents: 400,
        stockQuantity: 10,
        stockAlertThreshold: 3,
        active: true,
      };

      const product = await createProduct(input);
      testProductIds.push(product.id);

      await decrementStock(product.id, 3, 'test-order-123');

      const updated = await getProductById(product.id);
      expect(updated?.stockQuantity).toBe(7);

      // Verify stock movement was recorded
      const movements = await getStockMovements(product.id);
      expect(movements.length).toBeGreaterThan(0);
      const lastMovement = movements[0];
      expect(lastMovement?.type).toBe('sale');
      expect(lastMovement?.quantity).toBe(-3);
      expect(lastMovement?.orderId).toBe('test-order-123');
      expect(lastMovement?.createdBy).toBe('system');
    });

    it('should prevent negative stock (stop at 0)', async () => {
      const input: CreateProductInput = {
        slug: `${testSlug}-negative-test`,
        name: 'Negative Stock Test',
        description: 'Testing negative stock prevention',
        priceCents: 1000,
        shippingCents: 300,
        stockQuantity: 5,
        active: true,
      };

      const product = await createProduct(input);
      testProductIds.push(product.id);

      // Try to decrement more than available
      await decrementStock(product.id, 10, 'test-order-456');

      const updated = await getProductById(product.id);
      expect(updated?.stockQuantity).toBe(0); // Should stop at 0, not go negative
    });

    it('should auto-disable product when stock reaches 0', async () => {
      const input: CreateProductInput = {
        slug: `${testSlug}-auto-disable`,
        name: 'Auto Disable Test',
        description: 'Testing auto-disable on zero stock',
        priceCents: 1200,
        shippingCents: 350,
        stockQuantity: 3,
        active: true,
      };

      const product = await createProduct(input);
      testProductIds.push(product.id);

      // Decrement to exactly 0
      await decrementStock(product.id, 3, 'test-order-789');

      const updated = await getProductById(product.id);
      expect(updated?.stockQuantity).toBe(0);
      expect(updated?.active).toBe(false); // Should auto-disable
    });

    it('should not disable if already inactive', async () => {
      const input: CreateProductInput = {
        slug: `${testSlug}-already-inactive`,
        name: 'Already Inactive Test',
        description: 'Testing already inactive product',
        priceCents: 1000,
        shippingCents: 300,
        stockQuantity: 2,
        active: false, // Start inactive
      };

      const product = await createProduct(input);
      testProductIds.push(product.id);

      await decrementStock(product.id, 2, 'test-order-101');

      const updated = await getProductById(product.id);
      expect(updated?.stockQuantity).toBe(0);
      expect(updated?.active).toBe(false); // Should remain inactive
    });

    it('should throw error for non-existent product', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await expect(
        decrementStock(nonExistentId, 1, 'test-order-999')
      ).rejects.toThrow('Product not found');
    });
  });

  describe('adjustStock - add', () => {
    it('should add stock (restock)', async () => {
      const input: CreateProductInput = {
        slug: `${testSlug}-add-stock`,
        name: 'Add Stock Test',
        description: 'Testing stock addition',
        priceCents: 1500,
        shippingCents: 400,
        stockQuantity: 5,
        active: true,
      };

      const product = await createProduct(input);
      testProductIds.push(product.id);

      await adjustStock(
        product.id,
        { type: 'add', quantity: 10, note: 'Restocking from supplier' },
        'admin@test.com'
      );

      const updated = await getProductById(product.id);
      expect(updated?.stockQuantity).toBe(15);

      // Verify stock movement
      const movements = await getStockMovements(product.id);
      const lastMovement = movements[0];
      expect(lastMovement?.type).toBe('restock');
      expect(lastMovement?.quantity).toBe(10);
      expect(lastMovement?.note).toBe('Restocking from supplier');
      expect(lastMovement?.createdBy).toBe('admin@test.com');
    });

    it('should auto-reactivate inactive product when adding stock', async () => {
      const input: CreateProductInput = {
        slug: `${testSlug}-reactivate`,
        name: 'Reactivate Test',
        description: 'Testing auto-reactivation',
        priceCents: 1000,
        shippingCents: 300,
        stockQuantity: 0,
        active: false, // Start inactive
      };

      const product = await createProduct(input);
      testProductIds.push(product.id);

      await adjustStock(
        product.id,
        { type: 'add', quantity: 5 },
        'admin@test.com'
      );

      const updated = await getProductById(product.id);
      expect(updated?.stockQuantity).toBe(5);
      expect(updated?.active).toBe(true); // Should auto-reactivate
    });
  });

  describe('adjustStock - remove', () => {
    it('should remove stock (adjustment)', async () => {
      const input: CreateProductInput = {
        slug: `${testSlug}-remove-stock`,
        name: 'Remove Stock Test',
        description: 'Testing stock removal',
        priceCents: 1500,
        shippingCents: 400,
        stockQuantity: 20,
        active: true,
      };

      const product = await createProduct(input);
      testProductIds.push(product.id);

      await adjustStock(
        product.id,
        { type: 'remove', quantity: 7, note: 'Damaged items' },
        'admin@test.com'
      );

      const updated = await getProductById(product.id);
      expect(updated?.stockQuantity).toBe(13);

      // Verify stock movement
      const movements = await getStockMovements(product.id);
      const lastMovement = movements[0];
      expect(lastMovement?.type).toBe('adjustment');
      expect(lastMovement?.quantity).toBe(-7);
      expect(lastMovement?.note).toBe('Damaged items');
    });

    it('should prevent negative stock when removing (stop at 0)', async () => {
      const input: CreateProductInput = {
        slug: `${testSlug}-remove-negative`,
        name: 'Remove Negative Test',
        description: 'Testing negative prevention on remove',
        priceCents: 1200,
        shippingCents: 350,
        stockQuantity: 3,
        active: true,
      };

      const product = await createProduct(input);
      testProductIds.push(product.id);

      await adjustStock(
        product.id,
        { type: 'remove', quantity: 10 },
        'admin@test.com'
      );

      const updated = await getProductById(product.id);
      expect(updated?.stockQuantity).toBe(0); // Should stop at 0
    });
  });

  describe('adjustStock - set', () => {
    it('should set stock to absolute value', async () => {
      const input: CreateProductInput = {
        slug: `${testSlug}-set-stock`,
        name: 'Set Stock Test',
        description: 'Testing stock set operation',
        priceCents: 1500,
        shippingCents: 400,
        stockQuantity: 12,
        active: true,
      };

      const product = await createProduct(input);
      testProductIds.push(product.id);

      await adjustStock(
        product.id,
        { type: 'set', quantity: 25, note: 'Physical inventory count' },
        'admin@test.com'
      );

      const updated = await getProductById(product.id);
      expect(updated?.stockQuantity).toBe(25);

      // Verify stock movement (difference calculation)
      const movements = await getStockMovements(product.id);
      const lastMovement = movements[0];
      expect(lastMovement?.type).toBe('adjustment');
      expect(lastMovement?.quantity).toBe(13); // 25 - 12
      expect(lastMovement?.note).toBe('Physical inventory count');
    });

    it('should handle set to lower value', async () => {
      const input: CreateProductInput = {
        slug: `${testSlug}-set-lower`,
        name: 'Set Lower Test',
        description: 'Testing set to lower value',
        priceCents: 1000,
        shippingCents: 300,
        stockQuantity: 50,
        active: true,
      };

      const product = await createProduct(input);
      testProductIds.push(product.id);

      await adjustStock(
        product.id,
        { type: 'set', quantity: 20 },
        'admin@test.com'
      );

      const updated = await getProductById(product.id);
      expect(updated?.stockQuantity).toBe(20);

      // Movement should be negative
      const movements = await getStockMovements(product.id);
      const lastMovement = movements[0];
      expect(lastMovement?.quantity).toBe(-30); // 20 - 50
    });

    it('should allow set to 0', async () => {
      const input: CreateProductInput = {
        slug: `${testSlug}-set-zero`,
        name: 'Set Zero Test',
        description: 'Testing set to zero',
        priceCents: 1200,
        shippingCents: 350,
        stockQuantity: 15,
        active: true,
      };

      const product = await createProduct(input);
      testProductIds.push(product.id);

      await adjustStock(
        product.id,
        { type: 'set', quantity: 0 },
        'admin@test.com'
      );

      const updated = await getProductById(product.id);
      expect(updated?.stockQuantity).toBe(0);
      // Note: auto-disable only happens on decrementStock, not adjustStock
    });
  });

  describe('getStockMovements', () => {
    it('should retrieve stock movement history', async () => {
      const input: CreateProductInput = {
        slug: `${testSlug}-movements`,
        name: 'Movements Test',
        description: 'Testing stock movements history',
        priceCents: 1500,
        shippingCents: 400,
        stockQuantity: 10,
        active: true,
      };

      const product = await createProduct(input);
      testProductIds.push(product.id);

      // Create multiple movements
      await adjustStock(product.id, { type: 'add', quantity: 5 }, 'admin@test.com');
      await decrementStock(product.id, 3, 'order-001');
      await adjustStock(product.id, { type: 'remove', quantity: 2, note: 'Damaged' }, 'admin@test.com');

      const movements = await getStockMovements(product.id);

      expect(movements.length).toBe(3);
      expect(movements[0]?.type).toBe('adjustment'); // Most recent (remove)
      expect(movements[1]?.type).toBe('sale');
      expect(movements[2]?.type).toBe('restock'); // Oldest (add)
    });

    it('should return empty array for product with no movements', async () => {
      const input: CreateProductInput = {
        slug: `${testSlug}-no-movements`,
        name: 'No Movements Test',
        description: 'Product with no stock movements',
        priceCents: 1000,
        shippingCents: 300,
        stockQuantity: 5,
      };

      const product = await createProduct(input);
      testProductIds.push(product.id);

      const movements = await getStockMovements(product.id);
      expect(movements).toEqual([]);
    });
  });

  describe('adjustStock - error handling', () => {
    it('should throw error for non-existent product', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await expect(
        adjustStock(
          nonExistentId,
          { type: 'add', quantity: 5 },
          'admin@test.com'
        )
      ).rejects.toThrow('Product not found');
    });
  });
});
