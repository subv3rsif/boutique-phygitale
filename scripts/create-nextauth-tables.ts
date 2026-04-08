import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres.jghoiesnnhhiijtzzfvt:o2jK93fcnvYxULDN@aws-1-eu-central-2.pooler.supabase.com:5432/postgres?sslmode=require";

async function createTables() {
  console.log('🔌 Connecting to database...');

  const client = postgres(DATABASE_URL);
  const db = drizzle(client);

  try {
    const sql = fs.readFileSync(path.join(__dirname, '../migrations/create_nextauth_tables.sql'), 'utf-8');

    console.log('📝 Creating NextAuth tables...');

    // Split SQL into individual statements and execute them
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await client.unsafe(statement);
    }

    console.log('✅ NextAuth tables created successfully!');
    console.log('\nCreated tables:');
    console.log('  - users');
    console.log('  - accounts');
    console.log('  - sessions');
    console.log('  - verification_tokens');
    console.log('\n🎉 You can now use Google OAuth authentication!');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createTables();
