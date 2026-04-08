-- NextAuth Tables avec préfixe pour éviter conflit avec Supabase Auth
-- Tables: nextauth_users, nextauth_accounts, nextauth_sessions, nextauth_verification_tokens

CREATE TABLE IF NOT EXISTS nextauth_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255),
  email varchar(255) UNIQUE NOT NULL,
  email_verified timestamp,
  image varchar(500),
  created_at timestamp DEFAULT now() NOT NULL
);

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
);

CREATE TABLE IF NOT EXISTS nextauth_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token varchar(255) UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES nextauth_users(id) ON DELETE CASCADE,
  expires timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS nextauth_verification_tokens (
  identifier varchar(255) NOT NULL,
  token varchar(255) UNIQUE NOT NULL,
  expires timestamp NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_nextauth_user_id_accounts ON nextauth_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_nextauth_user_id_sessions ON nextauth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_nextauth_session_token ON nextauth_sessions(session_token);

-- Permissions (if needed for RLS)
-- GRANT ALL ON nextauth_users TO postgres, anon, authenticated;
-- GRANT ALL ON nextauth_accounts TO postgres, anon, authenticated;
-- GRANT ALL ON nextauth_sessions TO postgres, anon, authenticated;
-- GRANT ALL ON nextauth_verification_tokens TO postgres, anon, authenticated;
