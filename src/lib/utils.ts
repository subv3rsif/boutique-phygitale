import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get client IP address from request headers
 * Handles various proxy headers (Vercel, Cloudflare, etc.)
 */
export function getClientIP(request: Request): string {
  const headers = request.headers;

  // Try various headers in order of preference
  const ip =
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    'unknown';

  return ip;
}

/**
 * Get user agent from request headers
 */
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Format email to show partially hidden (e.g., m***@example.com)
 */
export function partiallyHideEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;

  const visibleChars = Math.min(1, localPart.length);
  const hidden = '*'.repeat(Math.max(0, localPart.length - visibleChars));

  return `${localPart.substring(0, visibleChars)}${hidden}@${domain}`;
}

/**
 * Sleep utility for retry logic
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format cents to currency string (e.g., 1250 -> "12,50 €")
 */
export function formatCurrency(cents: number): string {
  const euros = (cents / 100).toFixed(2);
  return `${euros.replace('.', ',')} €`;
}
