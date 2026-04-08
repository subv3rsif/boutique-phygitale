#!/usr/bin/env node
import pg from 'pg';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Client } = pg;

const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres.jghoiesnnhhiijtzzfvt:o2jK93fcnvYxULDN@aws-1-eu-central-2.pooler.supabase.com:5432/postgres?sslmode=require";

async function createTables() {
  const client = new Client({ connectionString: DATABASE_URL });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!');

    const sql = fs.readFileSync(join(__dirname, '../migrations/create_nextauth_tables.sql'), 'utf-8');

    console.log('📝 Creating NextAuth tables...');
    await client.query(sql);

    console.log('✅ NextAuth tables created successfully!');
    console.log('\nCreated tables:');
    console.log('  - users');
    console.log('  - accounts');
    console.log('  - sessions');
    console.log('  - verification_tokens');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createTables();
