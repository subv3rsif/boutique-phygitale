/**
 * Admin Authentication System
 *
 * Simple credential-based auth for admin users.
 * Credentials stored in environment variables (ADMIN_EMAIL, ADMIN_PASSWORD).
 * Session managed via HTTP-only signed cookies (HMAC-SHA256).
 */

import { cookies } from 'next/headers'
import { createHmac, randomBytes } from 'crypto'

// Token expiration: 8 hours in milliseconds
const TOKEN_EXPIRATION_MS = 8 * 60 * 60 * 1000

/**
 * Verify admin credentials against environment variables
 * @param email - Email to verify
 * @param password - Password to verify
 * @returns true if credentials match, false otherwise
 */
export function verifyAdminCredentials(email: string, password: string): boolean {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('[AUTH] ADMIN_EMAIL or ADMIN_PASSWORD not set')
    return false
  }

  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD
}

/**
 * Create a signed admin token
 * Format: {timestamp}.{random}.{signature}
 *
 * @returns Signed token string
 * @throws Error if AUTH_SECRET is not set
 */
export function createAdminToken(): string {
  const SECRET = process.env.AUTH_SECRET

  if (!SECRET) {
    throw new Error('AUTH_SECRET environment variable is not set')
  }

  const timestamp = Date.now()
  const random = randomBytes(16).toString('hex')
  const payload = `${timestamp}.${random}`

  const signature = createHmac('sha256', SECRET)
    .update(payload)
    .digest('hex')

  return `${payload}.${signature}`
}

/**
 * Verify an admin token (signature + expiration)
 *
 * @param token - Token to verify
 * @returns Object with valid and expired flags
 */
export function verifyAdminToken(token: string): { valid: boolean; expired: boolean } {
  const SECRET = process.env.AUTH_SECRET

  if (!SECRET) {
    console.error('[AUTH] AUTH_SECRET not set')
    return { valid: false, expired: false }
  }

  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return { valid: false, expired: false }
    }

    const [timestampStr, random, signature] = parts

    // Verify signature
    const payload = `${timestampStr}.${random}`
    const expectedSig = createHmac('sha256', SECRET)
      .update(payload)
      .digest('hex')

    if (signature !== expectedSig) {
      return { valid: false, expired: false }
    }

    // Check expiration
    const timestamp = parseInt(timestampStr, 10)
    if (isNaN(timestamp)) {
      return { valid: false, expired: false }
    }

    const age = Date.now() - timestamp
    if (age > TOKEN_EXPIRATION_MS) {
      return { valid: false, expired: true }
    }

    return { valid: true, expired: false }
  } catch (error) {
    console.error('[AUTH] Token verification error:', error)
    return { valid: false, expired: false }
  }
}

/**
 * Require admin authentication (middleware)
 * Throws error if not authenticated - use in API routes and layouts
 *
 * @throws Error if no valid admin token
 */
export async function requireAdminAuth(): Promise<void> {
  const cookieStore = await cookies()
  const adminToken = cookieStore.get('admin-token')?.value

  if (!adminToken) {
    throw new Error('Unauthorized: No admin token')
  }

  const { valid, expired } = verifyAdminToken(adminToken)

  if (expired) {
    throw new Error('Unauthorized: Session expired')
  }

  if (!valid) {
    throw new Error('Unauthorized: Invalid token')
  }
}
