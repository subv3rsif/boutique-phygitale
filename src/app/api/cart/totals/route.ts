import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getProductById } from '@/lib/products';

/**
 * POST /api/cart/totals
 *
 * Calculate cart totals from database products (server-side validation)
 * Replaces deprecated catalogue.ts calculateCartTotals
 */

const cartItemSchema = z.object({
  id: z.string(),
  qty: z.number().int().min(1).max(10),
  size: z.string().optional(), // S, M, L, XL, XXL
});

const requestSchema = z.object({
  items: z.array(cartItemSchema),
  fulfillmentMode: z.enum(['delivery', 'pickup']),
});

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const result = requestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { items, fulfillmentMode } = result.data;

    let itemsTotal = 0;
    let shippingTotal = 0;
    const validatedItems = [];

    // Validate and calculate each item from DB
    for (const item of items) {
      // Get product from database (SERVER SOURCE OF TRUTH)
      const product = await getProductById(item.id);

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.id}` },
          { status: 404 }
        );
      }

      if (!product.active) {
        return NextResponse.json(
          { error: `Product is no longer available: ${product.name}` },
          { status: 400 }
        );
      }

      // Check stock (by size or global)
      if (item.size) {
        // Product has size variants - check size-specific stock
        const sizeConfig = product.sizes?.find((s) => s.size === item.size);

        if (!sizeConfig) {
          return NextResponse.json(
            { error: `Size ${item.size} not available for ${product.name}` },
            { status: 400 }
          );
        }

        if (sizeConfig.stock < item.qty) {
          return NextResponse.json(
            {
              error: `Insufficient stock for ${product.name} (${item.size}). Available: ${sizeConfig.stock}, Requested: ${item.qty}`,
            },
            { status: 400 }
          );
        }
      } else {
        // Global stock check
        if (
          product.stockQuantity !== null &&
          product.stockQuantity !== undefined &&
          product.stockQuantity < item.qty
        ) {
          return NextResponse.json(
            {
              error: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.qty}`,
            },
            { status: 400 }
          );
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
        id: product.id,
        name: product.name,
        qty: item.qty,
        unitPrice: product.priceCents,
        itemTotal,
        shippingTotal: itemShipping,
      });
    }

    const grandTotal = itemsTotal + shippingTotal;

    return NextResponse.json({
      itemsTotal,
      shippingTotal,
      grandTotal,
      validatedItems,
    });
  } catch (error) {
    console.error('[CART TOTALS] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
