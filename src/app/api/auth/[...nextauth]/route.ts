import { handlers } from "@/lib/auth/config"

/**
 * NextAuth API Route Handler
 *
 * Handles all NextAuth routes:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/callback/:provider
 * - /api/auth/session
 * - etc.
 */

// Force dynamic rendering (skip static generation at build time)
export const dynamic = 'force-dynamic'

export const { GET, POST } = handlers
