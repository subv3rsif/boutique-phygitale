import { getProductById } from '@/lib/products';
import type { Product } from '@/types/product';

/**
 * Cart Validation and Total Calculation
 * Validates cart items against database products (with size support)
 * Replaces legacy calculateCartTotals from catalogue.ts
 */

export type CartItem = {
  id: string;
  qty: number;
  size?: string;
};

export type ValidatedCartItem = {
  product: Product;
  qty: number;
  size?: string;
  itemTotal: number;
  shippingTotal: number;
};

export type CartCalculation = {
  itemsTotal: number;
  shippingTotal: number;
  grandTotal: number;
  validatedItems: ValidatedCartItem[];
};

export type CartError = {
  error: string;
};

/**
 * Validate cart items and calculate totals from database
 * @param items - Cart items with product ID, quantity, and optional size
 * @param fulfillmentMode - 'delivery' or 'pickup'
 * @returns Calculation result or error
 */
export async function validateCartAndCalculateTotals(
  items: CartItem[],
  fulfillmentMode: 'delivery' | 'pickup'
): Promise<CartCalculation | CartError> {
  let itemsTotal = 0;
  let shippingTotal = 0;
  const validatedItems: ValidatedCartItem[] = [];

  for (const item of items) {
    // Get product from database (SERVER SOURCE OF TRUTH)
    const product = await getProductById(item.id);

    if (!product) {
      return { error: `Product not found: ${item.id}` };
    }

    if (!product.active) {
      return { error: `Product is no longer available: ${product.name}` };
    }

    // Check stock (by size or global)
    if (item.size) {
      // Product has size variants - check size-specific stock
      const sizeConfig = product.sizes?.find((s) => s.size === item.size);

      if (!sizeConfig) {
        return { error: `Size ${item.size} not available for ${product.name}` };
      }

      if (sizeConfig.stock < item.qty) {
        return {
          error: `Insufficient stock for ${product.name} (${item.size}). Available: ${sizeConfig.stock}, Requested: ${item.qty}`,
        };
      }
    } else {
      // Global stock check
      if (
        product.stockQuantity !== null &&
        product.stockQuantity !== undefined &&
        product.stockQuantity < item.qty
      ) {
        return {
          error: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.qty}`,
        };
      }
    }

    // Calculate item total
    const itemTotal = product.priceCents * item.qty;
    itemsTotal += itemTotal;

    // Calculate shipping
    const itemShipping =
      fulfillmentMode === 'delivery' ? product.shippingCents * item.qty : 0;
    shippingTotal += itemShipping;

    validatedItems.push({
      product,
      qty: item.qty,
      size: item.size,
      itemTotal,
      shippingTotal: itemShipping,
    });
  }

  const grandTotal = itemsTotal + shippingTotal;

  return {
    itemsTotal,
    shippingTotal,
    grandTotal,
    validatedItems,
  };
}
