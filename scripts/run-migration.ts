/**
 * Script to run SQL migration manually
 * Usage: tsx scripts/run-migration.ts drizzle/0002_add_featured_column.sql
 */

import { readFileSync } from 'fs';
import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL!, {
  max: 1,
});

async function runMigration(filePath: string) {
  console.log(`\n📦 Running migration: ${filePath}\n`);

  try {
    // Read migration file
    const migrationSQL = readFileSync(filePath, 'utf-8');

    // Execute migration
    await sql.unsafe(migrationSQL);

    console.log('✅ Migration completed successfully!\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Get file path from command line args
const filePath = process.argv[2];

if (!filePath) {
  console.error('Usage: tsx scripts/run-migration.ts <migration-file.sql>');
  process.exit(1);
}

runMigration(filePath);
