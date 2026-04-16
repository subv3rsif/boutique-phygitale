import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { products, stockMovements } from './schema-products';

// Lazy database client to avoid build-time errors
let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!_db) {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      throw new Error(
        'DATABASE_URL is not set. Please add it to your .env.local file.'
      );
    }

    // Create postgres client
    const connectionString = process.env.DATABASE_URL;

    // Use DIRECT_URL if available (for Supabase connection pooling)
    const directUrl = process.env.DIRECT_URL || connectionString;

    // Create client with aggressive connection recycling for Supabase pooler
    const client = postgres(directUrl, {
      prepare: false, // Required for some serverless environments
      max: 1, // Limit to 1 connection per serverless function instance
      idle_timeout: 5, // Close idle connections after 5 seconds (aggressive)
      max_lifetime: 60 * 5, // Max connection lifetime: 5 minutes
      connect_timeout: 10, // Connection timeout: 10 seconds
      onnotice: () => {}, // Silence notices to reduce logging
    });

    // Create Drizzle instance with schema
    _db = drizzle(client, { schema });
  }

  return _db;
}

// Export db as a proxy to enable lazy initialization
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    return getDb()[prop as keyof ReturnType<typeof drizzle>];
  },
});

// Export direct DB instance for NextAuth DrizzleAdapter
export { getDb };

// Export schema for direct access
export * from './schema';

// Export product tables for convenience
export { products, stockMovements };
