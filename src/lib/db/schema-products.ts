import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  text,
  boolean,
  index,
  json,
} from 'drizzle-orm/pg-core';

/**
 * Products table - Stores product catalog with multi-image gallery support
 */
export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: varchar('slug', { length: 100 }).unique().notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description').notNull(),
    priceCents: integer('price_cents').notNull(),
    shippingCents: integer('shipping_cents').notNull(),
    images: json('images')
      .$type<
        Array<{
          url: string;
          path: string;
          order: number;
          isPrimary: boolean;
        }>
      >()
      .default([])
      .notNull(),
    stockQuantity: integer('stock_quantity').default(0).notNull(),
    stockAlertThreshold: integer('stock_alert_threshold').default(5).notNull(),
    weightGrams: integer('weight_grams'),
    tags: text('tags').array(), // Category tags: héritage, graffiti, collection, artisan
    badges: text('badges').array(), // Display badges: pièce phare, nouveauté, etc.
    payfipProductCode: varchar('payfip_product_code', { length: 10 }).default(
      '11'
    ),
    editionNumber: integer('edition_number'),
    editionTotal: integer('edition_total'),
    favoriteCount: integer('favorite_count').default(0).notNull(),
    active: boolean('active').default(true).notNull(),
    featured: boolean('featured').default(false).notNull(),
    showInCollectionPage: boolean('show_in_collection_page')
      .default(false)
      .notNull(),
    sizes: json('sizes')
      .$type<
        Array<{
          size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
          stock: number;
          stockAlertThreshold: number;
        }>
      >()
      .default([]),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index('idx_products_slug').on(table.slug),
    activeIdx: index('idx_products_active').on(table.active),
    featuredIdx: index('idx_products_featured').on(table.featured),
    stockIdx: index('idx_products_stock').on(table.stockQuantity),
  })
);

/**
 * Stock Movements table - Tracks stock changes (sales, restocks, adjustments, returns)
 */
export const stockMovements = pgTable(
  'stock_movements',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 20 })
      .notNull()
      .$type<'sale' | 'restock' | 'adjustment' | 'return'>(),
    quantity: integer('quantity').notNull(),
    orderId: uuid('order_id'),
    note: text('note'),
    createdBy: varchar('created_by', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    productIdx: index('idx_stock_product').on(table.productId),
    orderIdx: index('idx_stock_order').on(table.orderId),
  })
);

// Type exports for use in application code
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type StockMovement = typeof stockMovements.$inferSelect;
export type NewStockMovement = typeof stockMovements.$inferInsert;
