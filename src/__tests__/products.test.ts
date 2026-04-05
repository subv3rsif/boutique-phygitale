import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  createProduct,
  getProductById,
  updateProduct,
  slugExists,
  deleteProduct,
} from '@/lib/products';
import type { CreateProductInput } from '@/types/product';

describe('Product CRUD Operations', () => {
  // Store test product IDs for cleanup
  const testProductIds: string[] = [];
  const testSlug = `test-product-${Date.now()}`;

  afterAll(async () => {
    // Cleanup: delete all test products
    for (const id of testProductIds) {
      try {
        await deleteProduct(id);
        console.log(`[TEST CLEANUP] Deleted product: ${id}`);
      } catch (error) {
        console.warn(`[TEST CLEANUP] Failed to delete product ${id}:`, error);
      }
    }
  });

  describe('createProduct', () => {
    it('should create a product with all fields', async () => {
      const input: CreateProductInput = {
        slug: testSlug,
        name: 'Test Product',
        description: 'A test product for unit testing',
        priceCents: 1500,
        shippingCents: 500,
        stockQuantity: 10,
        stockAlertThreshold: 3,
        weightGrams: 200,
        tags: 'test,unit,vitest',
        payfipProductCode: '11',
        editionNumber: 1,
        editionTotal: 100,
        active: true,
      };

      const product = await createProduct(input);
      testProductIds.push(product.id);

      expect(product).toBeDefined();
      expect(product.id).toBeTruthy();
      expect(product.slug).toBe(testSlug);
      expect(product.name).toBe(input.name);
      expect(product.description).toBe(input.description);
      expect(product.priceCents).toBe(input.priceCents);
      expect(product.shippingCents).toBe(input.shippingCents);
      expect(product.stockQuantity).toBe(input.stockQuantity);
      expect(product.stockAlertThreshold).toBe(input.stockAlertThreshold);
      expect(product.weightGrams).toBe(input.weightGrams);
      expect(product.tags).toEqual(['test', 'unit', 'vitest']);
      expect(product.payfipProductCode).toBe(input.payfipProductCode);
      expect(product.editionNumber).toBe(input.editionNumber);
      expect(product.editionTotal).toBe(input.editionTotal);
      expect(product.active).toBe(true);
      expect(product.images).toEqual([]);
      expect(product.createdAt).toBeInstanceOf(Date);
      expect(product.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a product with minimal fields', async () => {
      const input: CreateProductInput = {
        slug: `${testSlug}-minimal`,
        name: 'Minimal Test Product',
        description: 'Minimal product',
        priceCents: 1000,
        shippingCents: 300,
      };

      const product = await createProduct(input);
      testProductIds.push(product.id);

      expect(product).toBeDefined();
      expect(product.slug).toBe(input.slug);
      expect(product.stockQuantity).toBe(0); // default
      expect(product.stockAlertThreshold).toBe(5); // default
      expect(product.weightGrams).toBeNull();
      expect(product.tags).toBeNull();
      expect(product.active).toBe(true); // default
    });

    it('should prevent duplicate slugs', async () => {
      const input: CreateProductInput = {
        slug: testSlug, // duplicate slug
        name: 'Duplicate Slug Product',
        description: 'Should fail',
        priceCents: 1000,
        shippingCents: 300,
      };

      await expect(createProduct(input)).rejects.toThrow('Slug already exists');
    });
  });

  describe('getProductById', () => {
    it('should retrieve a product by ID', async () => {
      const input: CreateProductInput = {
        slug: `${testSlug}-get-test`,
        name: 'Get Test Product',
        description: 'For testing getProductById',
        priceCents: 2000,
        shippingCents: 400,
      };

      const created = await createProduct(input);
      testProductIds.push(created.id);

      const retrieved = await getProductById(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.slug).toBe(created.slug);
      expect(retrieved?.name).toBe(created.name);
    });

    it('should return null for non-existent ID', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const product = await getProductById(nonExistentId);

      expect(product).toBeNull();
    });
  });

  describe('slugExists', () => {
    it('should return true for existing slug', async () => {
      const exists = await slugExists(testSlug);
      expect(exists).toBe(true);
    });

    it('should return false for non-existent slug', async () => {
      const exists = await slugExists('non-existent-slug-99999');
      expect(exists).toBe(false);
    });

    it('should exclude ID when checking slug existence', async () => {
      const input: CreateProductInput = {
        slug: `${testSlug}-exclude-test`,
        name: 'Exclude Test Product',
        description: 'For testing slug exclusion',
        priceCents: 1500,
        shippingCents: 350,
      };

      const product = await createProduct(input);
      testProductIds.push(product.id);

      // Should return false when excluding this product's ID
      const exists = await slugExists(product.slug, product.id);
      expect(exists).toBe(false);

      // Should return true when checking another ID
      const existsForOther = await slugExists(product.slug, '00000000-0000-0000-0000-000000000000');
      expect(existsForOther).toBe(true);
    });
  });

  describe('updateProduct', () => {
    it('should update product fields', async () => {
      const input: CreateProductInput = {
        slug: `${testSlug}-update-test`,
        name: 'Update Test Product',
        description: 'Original description',
        priceCents: 1500,
        shippingCents: 400,
        stockQuantity: 5,
        active: true,
      };

      const created = await createProduct(input);
      testProductIds.push(created.id);

      const updated = await updateProduct(created.id, {
        name: 'Updated Name',
        description: 'Updated description',
        priceCents: 2000,
        active: false,
      });

      expect(updated.id).toBe(created.id);
      expect(updated.name).toBe('Updated Name');
      expect(updated.description).toBe('Updated description');
      expect(updated.priceCents).toBe(2000);
      expect(updated.active).toBe(false);
      // Fields not updated should remain the same
      expect(updated.slug).toBe(created.slug);
      expect(updated.shippingCents).toBe(created.shippingCents);
      expect(updated.stockQuantity).toBe(created.stockQuantity);
    });

    it('should update slug if unique', async () => {
      const input: CreateProductInput = {
        slug: `${testSlug}-slug-update`,
        name: 'Slug Update Test',
        description: 'Testing slug update',
        priceCents: 1200,
        shippingCents: 300,
      };

      const created = await createProduct(input);
      testProductIds.push(created.id);

      const newSlug = `${testSlug}-slug-updated`;
      const updated = await updateProduct(created.id, { slug: newSlug });

      expect(updated.slug).toBe(newSlug);
    });

    it('should prevent duplicate slug on update', async () => {
      const product1Input: CreateProductInput = {
        slug: `${testSlug}-dup1`,
        name: 'Product 1',
        description: 'First product',
        priceCents: 1000,
        shippingCents: 300,
      };

      const product2Input: CreateProductInput = {
        slug: `${testSlug}-dup2`,
        name: 'Product 2',
        description: 'Second product',
        priceCents: 1000,
        shippingCents: 300,
      };

      const product1 = await createProduct(product1Input);
      const product2 = await createProduct(product2Input);
      testProductIds.push(product1.id, product2.id);

      // Try to update product2's slug to match product1's slug
      await expect(
        updateProduct(product2.id, { slug: product1.slug })
      ).rejects.toThrow('Slug already exists');
    });

    it('should throw error for non-existent product', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await expect(
        updateProduct(nonExistentId, { name: 'Updated Name' })
      ).rejects.toThrow('Product not found');
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product', async () => {
      const input: CreateProductInput = {
        slug: `${testSlug}-delete-test`,
        name: 'Delete Test Product',
        description: 'Will be deleted',
        priceCents: 1000,
        shippingCents: 300,
      };

      const created = await createProduct(input);
      // Don't add to testProductIds since we're deleting it in the test

      await deleteProduct(created.id);

      // Verify it's deleted
      const retrieved = await getProductById(created.id);
      expect(retrieved).toBeNull();
    });

    it('should throw error when deleting non-existent product', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await expect(deleteProduct(nonExistentId)).rejects.toThrow('Product not found');
    });
  });
});
