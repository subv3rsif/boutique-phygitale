import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres.jghoiesnnhhiijtzzfvt:o2jK93fcnvYxULDN@aws-1-eu-central-2.pooler.supabase.com:5432/postgres?sslmode=require";

async function verifyTables() {
  const client = postgres(DATABASE_URL);

  try {
    console.log('🔍 Checking if NextAuth tables exist...\n');

    const tables = await client`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name LIKE 'nextauth_%'
      ORDER BY table_name
    `;

    if (tables.length === 0) {
      console.log('❌ NO NextAuth tables found!\n');
      console.log('Tables need to be created. Run:');
      console.log('  npx tsx scripts/setup-nextauth.ts\n');
      return false;
    }

    console.log(`✅ Found ${tables.length} NextAuth tables:\n`);
    tables.forEach(t => console.log(`   ✓ ${t.table_name}`));

    // Check structure of nextauth_sessions
    const sessionCols = await client`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'nextauth_sessions'
      ORDER BY ordinal_position
    `;

    console.log('\n📋 nextauth_sessions structure:');
    sessionCols.forEach(col => console.log(`   - ${col.column_name}: ${col.data_type}`));

    // Try a test query
    console.log('\n🧪 Testing query...');
    await client`SELECT COUNT(*) as count FROM nextauth_sessions`;
    console.log('✅ Query works!\n');

    return true;

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    return false;
  } finally {
    await client.end();
  }
}

verifyTables();
