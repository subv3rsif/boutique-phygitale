import { Resend } from 'resend';

/**
 * Resend email client
 * Used for sending transactional emails
 */

// Lazy initialization for build compatibility
let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY || 'dummy-key-for-build';
    _resend = new Resend(apiKey);

    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY is not set. Emails will not be sent.');
    }
  }
  return _resend;
}

export const resend = new Proxy({} as Resend, {
  get(_, prop) {
    return getResend()[prop as keyof Resend];
  },
});

/**
 * Get sender email address
 * Default to noreply@domain.com or configured sender
 */
export function getSenderEmail(): string {
  return process.env.EMAIL_FROM || 'noreply@ville.fr';
}

/**
 * Get support email address
 */
export function getSupportEmail(): string {
  return process.env.SUPPORT_EMAIL || 'support@ville.fr';
}
