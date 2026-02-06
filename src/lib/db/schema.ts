import { pgTable, uuid, varchar, integer, timestamp, text, boolean, index, json } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * Orders table - Stores all customer orders
 */
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  status: varchar('status', { length: 20 }).notNull().$type<'pending' | 'paid' | 'fulfilled' | 'canceled' | 'refunded'>(),
  fulfillmentMode: varchar('fulfillment_mode', { length: 10 }).notNull().$type<'delivery' | 'pickup'>(),
  pickupLocationId: varchar('pickup_location_id', { length: 50 }),
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),
  customerPhone: varchar('customer_phone', { length: 20 }),
  stripeSessionId: varchar('stripe_session_id', { length: 255 }).notNull().unique(),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  itemsTotalCents: integer('items_total_cents').notNull(),
  shippingTotalCents: integer('shipping_total_cents').notNull(),
  grandTotalCents: integer('grand_total_cents').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  paidAt: timestamp('paid_at'),
  fulfilledAt: timestamp('fulfilled_at'),
  canceledAt: timestamp('canceled_at'),
  trackingNumber: varchar('tracking_number', { length: 255 }),
  trackingUrl: text('tracking_url'),
}, (table) => ({
  sessionIdx: index('idx_session').on(table.stripeSessionId),
  emailIdx: index('idx_email').on(table.customerEmail),
  statusIdx: index('idx_status').on(table.status),
}));

/**
 * Order Items table - Stores line items for each order (snapshot of product data at time of purchase)
 */
export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: varchar('product_id', { length: 100 }).notNull(),
  qty: integer('qty').notNull(),
  unitPriceCents: integer('unit_price_cents').notNull(),
  shippingCentsPerUnit: integer('shipping_cents_per_unit').notNull(),
  nameSnapshot: varchar('name_snapshot', { length: 255 }).notNull(),
  imageSnapshot: varchar('image_snapshot', { length: 500 }),
}, (table) => ({
  orderIdx: index('idx_order').on(table.orderId),
}));

/**
 * Pickup Tokens table - Stores QR code tokens for pickup orders
 */
export const pickupTokens = pgTable('pickup_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().unique().references(() => orders.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  usedBy: varchar('used_by', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  // Temporary metadata for storing clear token (only for email sending)
  // In production, use Redis cache instead
  metadata: json('metadata').$type<{ clearToken?: string }>(),
}, (table) => ({
  hashIdx: index('idx_hash').on(table.tokenHash),
  orderIdx: index('idx_order_token').on(table.orderId),
}));

/**
 * Stripe Events table - Prevents duplicate processing of webhook events (idempotence)
 */
export const stripeEvents = pgTable('stripe_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: varchar('event_id', { length: 255 }).notNull().unique(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  processedAt: timestamp('processed_at').defaultNow().notNull(),
}, (table) => ({
  eventIdx: index('idx_event_id').on(table.eventId),
}));

/**
 * Email Queue table - Manages email sending with retry logic
 */
export const emailQueue = pgTable('email_queue', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  emailType: varchar('email_type', { length: 50 }).notNull().$type<'pickup_confirmation' | 'delivery_confirmation' | 'shipped_notification' | 'pickup_reminder'>(),
  recipientEmail: varchar('recipient_email', { length: 255 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending').$type<'pending' | 'sent' | 'failed'>(),
  attempts: integer('attempts').notNull().default(0),
  lastError: text('last_error'),
  nextRetryAt: timestamp('next_retry_at'),
  sentAt: timestamp('sent_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  statusRetryIdx: index('idx_status_retry').on(table.status, table.nextRetryAt),
  orderIdx: index('idx_order_email').on(table.orderId),
}));

/**
 * GDPR Consents table - Tracks user consent for data processing
 */
export const gdprConsents = pgTable('gdpr_consents', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  consentedAt: timestamp('consented_at').defaultNow().notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  privacyPolicyVersion: varchar('privacy_policy_version', { length: 10 }).default('1.0'),
});

/**
 * Product Stock table - Optional stock tracking
 */
export const productStock = pgTable('product_stock', {
  productId: varchar('product_id', { length: 100 }).primaryKey(),
  quantity: integer('quantity').notNull().default(0),
  reserved: integer('reserved').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Type exports for use in application code
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

export type PickupToken = typeof pickupTokens.$inferSelect;
export type NewPickupToken = typeof pickupTokens.$inferInsert;

export type StripeEvent = typeof stripeEvents.$inferSelect;
export type NewStripeEvent = typeof stripeEvents.$inferInsert;

export type EmailQueue = typeof emailQueue.$inferSelect;
export type NewEmailQueue = typeof emailQueue.$inferInsert;

export type GdprConsent = typeof gdprConsents.$inferSelect;
export type NewGdprConsent = typeof gdprConsents.$inferInsert;

export type ProductStock = typeof productStock.$inferSelect;
export type NewProductStock = typeof productStock.$inferInsert;
