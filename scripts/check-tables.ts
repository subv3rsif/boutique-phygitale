import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres.jghoiesnnhhiijtzzfvt:o2jK93fcnvYxULDN@aws-1-eu-central-2.pooler.supabase.com:5432/postgres?sslmode=require";

async function checkTables() {
  const client = postgres(DATABASE_URL);

  try {
    console.log('📊 Checking NextAuth tables structure...\n');

    // Check users table
    const users = await client`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;
    console.log('✅ users table:', users.length, 'columns');
    users.forEach(col => console.log(`   - ${col.column_name}: ${col.data_type}`));

    // Check sessions table
    const sessions = await client`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'sessions'
      ORDER BY ordinal_position
    `;
    console.log('\n✅ sessions table:', sessions.length, 'columns');
    sessions.forEach(col => console.log(`   - ${col.column_name}: ${col.data_type}`));

    // Try a simple query
    console.log('\n🧪 Testing query...');
    const testQuery = await client`
      SELECT session_token, user_id, expires
      FROM sessions
      LIMIT 1
    `;
    console.log('✅ Query works! Rows:', testQuery.length);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Details:', error);
  } finally {
    await client.end();
  }
}

checkTables();
