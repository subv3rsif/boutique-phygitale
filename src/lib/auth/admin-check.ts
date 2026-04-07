// src/lib/auth/admin-check.ts
import { auth } from '@/lib/auth/config';

/**
 * Check if user is admin
 * Returns true in development mode for local testing
 * In production, checks actual authentication
 */
export async function isAdmin(): Promise<boolean> {
  // In development, bypass auth for local testing
  if (process.env.NODE_ENV === 'development') {
    console.log('[AUTH] Development mode - bypassing admin check');
    return true;
  }

  // In production, check real auth
  const session = await auth();
  if (!session?.user?.email) {
    return false;
  }

  const allowedEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  return allowedEmails.includes(session.user.email);
}

/**
 * Throw unauthorized error if not admin
 */
export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error('Unauthorized');
  }
}
