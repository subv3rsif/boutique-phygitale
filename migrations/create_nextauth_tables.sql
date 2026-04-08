-- NextAuth Tables Migration
-- Creates users, accounts, sessions, and verification_tokens tables
-- Required for Google OAuth authentication

-- Users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(255),
  "email" varchar(255) UNIQUE NOT NULL,
  "email_verified" timestamp,
  "image" varchar(500),
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Accounts table (OAuth providers)
CREATE TABLE IF NOT EXISTS "accounts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" varchar(255) NOT NULL,
  "provider" varchar(255) NOT NULL,
  "provider_account_id" varchar(255) NOT NULL,
  "refresh_token" text,
  "access_token" text,
  "expires_at" integer,
  "token_type" varchar(255),
  "scope" varchar(255),
  "id_token" text,
  "session_state" varchar(255),
  CONSTRAINT "accounts_provider_provider_account_id_unique" UNIQUE("provider", "provider_account_id")
);

-- Sessions table
CREATE TABLE IF NOT EXISTS "sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "session_token" varchar(255) UNIQUE NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "expires" timestamp NOT NULL
);

-- Verification tokens table (for email verification)
CREATE TABLE IF NOT EXISTS "verification_tokens" (
  "identifier" varchar(255) NOT NULL,
  "token" varchar(255) UNIQUE NOT NULL,
  "expires" timestamp NOT NULL,
  PRIMARY KEY ("identifier", "token")
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "idx_user_id_accounts" ON "accounts"("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_id_sessions" ON "sessions"("user_id");
CREATE INDEX IF NOT EXISTS "idx_session_token" ON "sessions"("session_token");
