import { describe, it, expect } from 'vitest';
import {
  getProductById,
  getAllActiveProducts,
  calculateCartTotals,
  formatCurrency,
  validateCartItems,
} from './catalogue';

describe('Catalogue', () => {
  describe('getProductById', () => {
    it('should return product when it exists and is active', () => {
      const product = getProductById('mug-ville-2024');
      expect(product).toBeDefined();
      expect(product?.name).toBe('Mug Ville Edition 2024');
      expect(product?.active).toBe(true);
    });

    it('should return undefined for non-existent product', () => {
      const product = getProductById('non-existent');
      expect(product).toBeUndefined();
    });
  });

  describe('getAllActiveProducts', () => {
    it('should return all active products', () => {
      const products = getAllActiveProducts();
      expect(products.length).toBeGreaterThan(0);
      expect(products.every((p) => p.active)).toBe(true);
    });
  });

  describe('calculateCartTotals', () => {
    it('should calculate delivery totals correctly', () => {
      const items = [
        { id: 'mug-ville-2024', qty: 2 },
        { id: 'stickers-pack', qty: 1 },
      ];

      const result = calculateCartTotals(items, 'delivery');

      if ('error' in result) {
        throw new Error(result.error);
      }

      // 2 mugs: 2 * 12.00€ = 24.00€
      // 1 stickers: 1 * 5.00€ = 5.00€
      // Items total: 29.00€ = 2900 cents
      expect(result.itemsTotal).toBe(2900);

      // Shipping: 2 * 4.50€ + 1 * 2.00€ = 11.00€ = 1100 cents
      expect(result.shippingTotal).toBe(1100);

      // Grand total: 29.00€ + 11.00€ = 40.00€ = 4000 cents
      expect(result.grandTotal).toBe(4000);
    });

    it('should calculate pickup totals with zero shipping', () => {
      const items = [{ id: 'mug-ville-2024', qty: 1 }];

      const result = calculateCartTotals(items, 'pickup');

      if ('error' in result) {
        throw new Error(result.error);
      }

      expect(result.itemsTotal).toBe(1200); // 12.00€
      expect(result.shippingTotal).toBe(0); // No shipping for pickup
      expect(result.grandTotal).toBe(1200);
    });

    it('should return error for invalid product', () => {
      const items = [{ id: 'invalid-product', qty: 1 }];

      const result = calculateCartTotals(items, 'delivery');

      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toContain('not found');
      }
    });

    it('should return error for invalid quantity', () => {
      const items = [{ id: 'mug-ville-2024', qty: 11 }]; // Max is 10

      const result = calculateCartTotals(items, 'delivery');

      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toContain('quantity');
      }
    });
  });

  describe('formatCurrency', () => {
    it('should format cents to euros correctly', () => {
      // Using non-breaking space (\u00A0) as used by Intl.NumberFormat
      expect(formatCurrency(1250)).toBe('12,50\u00A0€');
      expect(formatCurrency(1000)).toBe('10,00\u00A0€');
      expect(formatCurrency(99)).toBe('0,99\u00A0€');
      expect(formatCurrency(0)).toBe('0,00\u00A0€');
    });
  });

  describe('validateCartItems', () => {
    it('should validate correct cart items', () => {
      const items = [
        { id: 'mug-ville-2024', qty: 2 },
        { id: 'stickers-pack', qty: 5 },
      ];

      const result = validateCartItems(items);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty cart', () => {
      const result = validateCartItems([]);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Cart is empty');
    });

    it('should reject invalid product IDs', () => {
      const items = [{ id: 'invalid-product', qty: 1 }];

      const result = validateCartItems(items);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('not found'))).toBe(true);
    });

    it('should reject quantities above 10', () => {
      const items = [{ id: 'mug-ville-2024', qty: 11 }];

      const result = validateCartItems(items);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Maximum quantity'))).toBe(true);
    });

    it('should reject quantities below 1', () => {
      const items = [{ id: 'mug-ville-2024', qty: 0 }];

      const result = validateCartItems(items);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('at least 1'))).toBe(true);
    });
  });
});
