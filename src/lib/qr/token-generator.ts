import crypto from 'crypto';

/**
 * QR Code Token Generator
 * Generates secure tokens for pickup orders
 *
 * SECURITY:
 * - Tokens are 32 bytes (256 bits) of random data
 * - Stored as SHA-256 hash in database (never in clear text)
 * - Tokens are single-use and expire after 30 days
 */

/**
 * Generate a secure pickup token
 * Returns both the clear token (to send to customer) and its hash (to store in DB)
 */
export function generatePickupToken(): { token: string; tokenHash: string } {
  // Generate 32 bytes of cryptographically secure random data
  const token = crypto.randomBytes(32).toString('hex'); // 64 hex characters

  // Hash the token using SHA-256 for storage
  const tokenHash = hashToken(token);

  return { token, tokenHash };
}

/**
 * Hash a token using SHA-256
 * This is what gets stored in the database
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Verify if a token matches a hash
 * Used when validating pickup tokens
 */
export function verifyToken(token: string, hash: string): boolean {
  const tokenHash = hashToken(token);
  return tokenHash === hash;
}

/**
 * Generate expiration date for pickup token
 * Default: 30 days from now
 */
export function generateTokenExpiration(days: number = 30): Date {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + days);
  return expirationDate;
}

/**
 * Check if a token has expired
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}
