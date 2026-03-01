import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Resend from "next-auth/providers/resend"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { getDb } from "@/lib/db"
import { accounts, sessions, users, verificationTokens } from "@/lib/db/schema"

/**
 * NextAuth v5 Configuration
 *
 * - Google OAuth provider
 * - Drizzle adapter (PostgreSQL via Supabase)
 * - Session strategy: database
 * - Custom callbacks for user ID in session
 */

// Check if we can initialize the database adapter
// During build, DATABASE_URL might not be available
const canInitializeDb = Boolean(process.env.DATABASE_URL)

// Create adapter only if DATABASE_URL is available
const adapter = canInitializeDb
  ? DrizzleAdapter(getDb(), {
      usersTable: users,
      accountsTable: accounts,
      sessionsTable: sessions,
      verificationTokensTable: verificationTokens,
    })
  : undefined

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Only use adapter if available (runtime), not during build
  ...(adapter && { adapter }),

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy_client_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy_secret",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    Resend({
      apiKey: process.env.RESEND_API_KEY || "dummy_key",
      from: process.env.EMAIL_FROM || "noreply@example.com",
    }),
  ],

  callbacks: {
    session({ session, user }) {
      // Add user ID to session for easy access
      if (session.user && user) {
        session.user.id = user.id
      }
      return session
    },
  },

  pages: {
    signIn: '/connexion',
    signOut: '/logout',
    error: '/auth/error',
  },

  // Security
  session: {
    strategy: adapter ? "database" : "jwt", // Fallback to JWT if no DB
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  // Debug mode in development
  debug: process.env.NODE_ENV === "development",
})
