import { z } from 'zod';

/**
 * Validation schemas for the application
 * All user inputs MUST be validated with these schemas
 */

/**
 * Cart item schema
 */
export const cartItemSchema = z.object({
  id: z.string().min(1, 'Product ID is required'),
  qty: z.number().int().min(1, 'Quantity must be at least 1').max(10, 'Maximum quantity is 10'),
});

/**
 * Checkout input schema
 * This is the payload sent to POST /api/checkout
 */
export const checkoutInputSchema = z.object({
  items: z.array(cartItemSchema).min(1, 'Cart cannot be empty'),
  fulfillmentMode: z.enum(['delivery', 'pickup'], {
    message: 'Invalid fulfillment mode',
  }),
  pickupLocationId: z.string().optional(),
  gdprConsent: z.boolean().refine((val) => val === true, {
    message: 'You must accept the privacy policy',
  }),
  customerPhone: z.string().optional(), // Optional but recommended for pickup
});

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;

/**
 * Mark shipped input schema
 */
export const markShippedInputSchema = z.object({
  trackingNumber: z.string().min(1, 'Tracking number is required'),
  trackingUrl: z.string().url('Invalid tracking URL').optional(),
});

export type MarkShippedInput = z.infer<typeof markShippedInputSchema>;

/**
 * Redeem pickup token schema
 */
export const redeemPickupTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export type RedeemPickupTokenInput = z.infer<typeof redeemPickupTokenSchema>;

/**
 * Email validation
 */
export const emailSchema = z.string().email('Invalid email address');

/**
 * Order filters schema (for admin order list)
 */
export const orderFiltersSchema = z.object({
  status: z.enum(['pending', 'paid', 'fulfilled', 'canceled', 'refunded']).optional(),
  fulfillmentMode: z.enum(['delivery', 'pickup']).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  limit: z.number().int().positive().max(100).default(50).optional(),
  offset: z.number().int().min(0).default(0).optional(),
});

export type OrderFilters = z.infer<typeof orderFiltersSchema>;
