import { pgTable, uuid, varchar, timestamp, boolean, index } from 'drizzle-orm/pg-core';

/**
 * Drop Newsletter Subscribers table
 * Stores email addresses for drop notifications (limited edition announcements)
 */
export const dropSubscribers = pgTable(
  'drop_subscribers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    confirmed: boolean('confirmed').default(false).notNull(),
    confirmationToken: varchar('confirmation_token', { length: 64 }),
    subscribedAt: timestamp('subscribed_at').defaultNow().notNull(),
    confirmedAt: timestamp('confirmed_at'),
    unsubscribedAt: timestamp('unsubscribed_at'),
    unsubscribeToken: varchar('unsubscribe_token', { length: 64 }).notNull(),
  },
  (table) => ({
    emailIdx: index('idx_drop_subscribers_email').on(table.email),
    confirmedIdx: index('idx_drop_subscribers_confirmed').on(table.confirmed),
  })
);

// Type exports
export type DropSubscriber = typeof dropSubscribers.$inferSelect;
export type NewDropSubscriber = typeof dropSubscribers.$inferInsert;
