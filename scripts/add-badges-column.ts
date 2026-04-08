import postgres from 'postgres';
import * as fs from 'fs';
import * as path from 'path';

const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres.jghoiesnnhhiijtzzfvt:o2jK93fcnvYxULDN@aws-1-eu-central-2.pooler.supabase.com:5432/postgres?sslmode=require";

async function runMigration() {
  const client = postgres(DATABASE_URL);

  try {
    console.log('🔧 Adding badges column to products table...\n');

    // Read migration SQL
    const migrationPath = path.join(process.cwd(), 'migrations', 'add_badges_column.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    // Execute migration
    await client.unsafe(sql);

    console.log('✅ Migration completed successfully!\n');
    console.log('The "badges" column has been added to the products table.');

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
