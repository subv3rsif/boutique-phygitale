import { DefaultSession } from "next-auth"

/**
 * NextAuth Type Extensions
 *
 * Extends the default NextAuth types to include custom fields
 */

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      emailVerified?: Date | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    emailVerified?: Date | null
  }
}
