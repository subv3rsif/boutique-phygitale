import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres.jghoiesnnhhiijtzzfvt:o2jK93fcnvYxULDN@aws-1-eu-central-2.pooler.supabase.com:5432/postgres?sslmode=require";

async function fixTables() {
  const client = postgres(DATABASE_URL);

  try {
    console.log('🔧 Fixing NextAuth tables (separating from Supabase Auth)...\n');

    const sql = fs.readFileSync(path.join(__dirname, '../migrations/create_nextauth_tables_public.sql'), 'utf-8');

    // Split and execute
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await client.unsafe(statement);
    }

    console.log('\n✅ NextAuth tables fixed successfully!');
    console.log('\nCreated in public schema:');
    console.log('  - public.users (NextAuth)');
    console.log('  - public.accounts (NextAuth)');
    console.log('  - public.sessions (NextAuth)');
    console.log('  - public.verification_tokens (NextAuth)');
    console.log('\nSupabase Auth tables (auth schema) remain untouched.');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixTables();
