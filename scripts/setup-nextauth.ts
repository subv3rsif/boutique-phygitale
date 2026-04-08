import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres.jghoiesnnhhiijtzzfvt:o2jK93fcnvYxULDN@aws-1-eu-central-2.pooler.supabase.com:5432/postgres?sslmode=require";

async function setupNextAuth() {
  const client = postgres(DATABASE_URL);

  try {
    console.log('🔧 Setting up NextAuth with prefixed tables...\n');

    // Create tables directly
    await client`
      CREATE TABLE IF NOT EXISTS nextauth_users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(255),
        email varchar(255) UNIQUE NOT NULL,
        email_verified timestamp,
        image varchar(500),
        created_at timestamp DEFAULT now() NOT NULL
      )
    `;
    console.log('✓ nextauth_users created');

    await client`
      CREATE TABLE IF NOT EXISTS nextauth_accounts (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES nextauth_users(id) ON DELETE CASCADE,
        type varchar(255) NOT NULL,
        provider varchar(255) NOT NULL,
        provider_account_id varchar(255) NOT NULL,
        refresh_token text,
        access_token text,
        expires_at integer,
        token_type varchar(255),
        scope varchar(255),
        id_token text,
        session_state varchar(255),
        CONSTRAINT nextauth_accounts_provider_unique UNIQUE(provider, provider_account_id)
      )
    `;
    console.log('✓ nextauth_accounts created');

    await client`
      CREATE TABLE IF NOT EXISTS nextauth_sessions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        session_token varchar(255) UNIQUE NOT NULL,
        user_id uuid NOT NULL REFERENCES nextauth_users(id) ON DELETE CASCADE,
        expires timestamp NOT NULL
      )
    `;
    console.log('✓ nextauth_sessions created');

    await client`
      CREATE TABLE IF NOT EXISTS nextauth_verification_tokens (
        identifier varchar(255) NOT NULL,
        token varchar(255) UNIQUE NOT NULL,
        expires timestamp NOT NULL,
        PRIMARY KEY (identifier, token)
      )
    `;
    console.log('✓ nextauth_verification_tokens created');

    // Create indexes
    await client`CREATE INDEX IF NOT EXISTS idx_nextauth_user_id_accounts ON nextauth_accounts(user_id)`;
    await client`CREATE INDEX IF NOT EXISTS idx_nextauth_user_id_sessions ON nextauth_sessions(user_id)`;
    await client`CREATE INDEX IF NOT EXISTS idx_nextauth_session_token ON nextauth_sessions(session_token)`;
    console.log('✓ Indexes created');

    console.log('\n✅ NextAuth setup complete!\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupNextAuth();
