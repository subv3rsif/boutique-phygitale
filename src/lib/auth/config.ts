import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
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

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(getDb(), {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  callbacks: {
    session({ session, user }) {
      // Add user ID to session for easy access
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
  },

  // Security
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  // Debug mode in development
  debug: process.env.NODE_ENV === "development",
})
