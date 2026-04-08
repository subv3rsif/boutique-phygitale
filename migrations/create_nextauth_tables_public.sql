-- Drop existing conflicting tables if they exist in public schema
DROP TABLE IF EXISTS public.verification_tokens CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.accounts CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create NextAuth tables in public schema (separate from Supabase auth schema)
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255),
  email varchar(255) UNIQUE NOT NULL,
  email_verified timestamp,
  image varchar(500),
  created_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE public.accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
  CONSTRAINT accounts_provider_provider_account_id_unique UNIQUE(provider, provider_account_id)
);

CREATE TABLE public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token varchar(255) UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expires timestamp NOT NULL
);

CREATE TABLE public.verification_tokens (
  identifier varchar(255) NOT NULL,
  token varchar(255) UNIQUE NOT NULL,
  expires timestamp NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Indexes
CREATE INDEX idx_user_id_accounts ON public.accounts(user_id);
CREATE INDEX idx_user_id_sessions ON public.sessions(user_id);
CREATE INDEX idx_session_token ON public.sessions(session_token);

GRANT ALL ON public.users TO postgres;
GRANT ALL ON public.accounts TO postgres;
GRANT ALL ON public.sessions TO postgres;
GRANT ALL ON public.verification_tokens TO postgres;
