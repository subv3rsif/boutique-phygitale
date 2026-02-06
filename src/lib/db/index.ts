import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

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

    // Create client with appropriate settings
    const client = postgres(directUrl, {
      prepare: false, // Required for some serverless environments
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

// Export schema for direct access
export * from './schema';
