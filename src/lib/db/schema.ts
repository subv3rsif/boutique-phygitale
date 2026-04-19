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

  // PayFiP fields (replace Stripe fields)
  refdet: varchar('refdet', { length: 30 }).notNull().unique(),
  idop: varchar('idop', { length: 255 }),
  payfipResultTrans: varchar('payfip_result_trans', { length: 1 }),
  payfipNumAuto: varchar('payfip_num_auto', { length: 16 }),
  payfipDateTrans: varchar('payfip_date_trans', { length: 8 }),
  payfipHeureTrans: varchar('payfip_heure_trans', { length: 4 }),

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
  refdetIdx: index('idx_refdet').on(table.refdet),
  idopIdx: index('idx_idop_order').on(table.idop),
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
  sizeSelected: varchar('size_selected', { length: 10 }), // Selected size (S, M, L, XL, XXL) - NULL if no sizes
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
 * Invoice Sequences - Sequential REFDET generation
 */
export const invoiceSequences = pgTable('invoice_sequences', {
  year: integer('year').primaryKey(),
  currentNumber: integer('current_number').notNull().default(0),
  lastUpdated: timestamp('last_updated').defaultNow(),
});

/**
 * PayFiP Operations - Tracks idop lifecycle and payment results
 */
export const payfipOperations = pgTable('payfip_operations', {
  id: uuid('id').primaryKey().defaultRandom(),
  idop: varchar('idop', { length: 255 }).notNull().unique(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  refdet: varchar('refdet', { length: 30 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  consumedAt: timestamp('consumed_at'),
  resultTrans: varchar('result_trans', { length: 1 }).$type<'P' | 'V' | 'A' | 'R' | 'Z'>(),
  numAuto: varchar('num_auto', { length: 16 }),
  dateTrans: varchar('date_trans', { length: 8 }),
  heureTrans: varchar('heure_trans', { length: 4 }),
  notificationReceivedAt: timestamp('notification_received_at'),
  rawNotification: text('raw_notification'),
}, (table) => ({
  idopIdx: index('idx_idop').on(table.idop),
  orderIdx: index('idx_order_payfip').on(table.orderId),
  refdetIdx: index('idx_refdet_payfip').on(table.refdet),
  expiresIdx: index('idx_expires').on(table.expiresAt),
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

// ============================================================================
// NextAuth Tables (Auth.js v5 with Drizzle Adapter)
// ============================================================================

/**
 * Users table - NextAuth users
 */
export const users = pgTable('nextauth_users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Accounts table - NextAuth provider accounts (Google, GitHub, etc.)
 */
export const accounts = pgTable('nextauth_accounts', {
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull().$type<'oauth' | 'oidc' | 'email'>(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (table) => ({
  compoundKey: index('accounts_compound_key').on(table.provider, table.providerAccountId),
}));

/**
 * Sessions table - NextAuth sessions
 */
export const sessions = pgTable('nextauth_sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

/**
 * Verification Tokens table - NextAuth email verification
 */
export const verificationTokens = pgTable('nextauth_verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (table) => ({
  compoundKey: index('verification_tokens_compound_key').on(table.identifier, table.token),
}));

// Type exports for use in application code
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

export type PickupToken = typeof pickupTokens.$inferSelect;
export type NewPickupToken = typeof pickupTokens.$inferInsert;

export type InvoiceSequence = typeof invoiceSequences.$inferSelect;
export type NewInvoiceSequence = typeof invoiceSequences.$inferInsert;

export type PayfipOperation = typeof payfipOperations.$inferSelect;
export type NewPayfipOperation = typeof payfipOperations.$inferInsert;

export type EmailQueue = typeof emailQueue.$inferSelect;
export type NewEmailQueue = typeof emailQueue.$inferInsert;

export type GdprConsent = typeof gdprConsents.$inferSelect;
export type NewGdprConsent = typeof gdprConsents.$inferInsert;

export type ProductStock = typeof productStock.$inferSelect;
export type NewProductStock = typeof productStock.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;

// Re-export products schema
export * from './schema-products';
