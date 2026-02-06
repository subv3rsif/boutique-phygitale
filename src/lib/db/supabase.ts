import { createClient } from '@supabase/supabase-js';

// Check required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

/**
 * Public Supabase client for client-side auth
 * Used for user authentication flows
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Admin Supabase client with service role key
 * Used for server-side operations that bypass RLS
 * NEVER expose this on the client side
 */
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false, // Don't persist sessions for admin client
        },
      }
    )
  : null;

// Warn if admin client is not configured
if (!supabaseAdmin && process.env.NODE_ENV !== 'development') {
  console.warn('SUPABASE_SERVICE_ROLE_KEY not set. Admin features will not work.');
}
