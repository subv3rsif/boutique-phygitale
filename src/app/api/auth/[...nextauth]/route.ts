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

export const { GET, POST } = handlers
