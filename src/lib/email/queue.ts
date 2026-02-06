import { db, emailQueue, type EmailQueue } from '../db';
import { eq, and, lte, lt } from 'drizzle-orm';

/**
 * Email queue management
 * Handles adding emails to queue and retry logic
 */

export type EmailType = 'pickup_confirmation' | 'delivery_confirmation' | 'shipped_notification' | 'pickup_reminder';

/**
 * Add email to queue
 */
export async function addToQueue(
  orderId: string,
  emailType: EmailType,
  recipientEmail: string
): Promise<string> {
  const [email] = await db
    .insert(emailQueue)
    .values({
      orderId,
      emailType,
      recipientEmail,
      status: 'pending',
      attempts: 0,
      nextRetryAt: new Date(), // Send immediately
    })
    .returning({ id: emailQueue.id });

  if (!email) {
    throw new Error('Failed to add email to queue');
  }

  return email.id;
}

/**
 * Calculate next retry time with exponential backoff
 * Delays: 5min, 15min, 1h, 4h, 24h
 */
export function calculateNextRetry(attempts: number): Date {
  const delaysMinutes = [5, 15, 60, 240, 1440];
  const delay = delaysMinutes[attempts] || 1440; // Default to 24h for attempts > 4

  return new Date(Date.now() + delay * 60 * 1000);
}

/**
 * Get emails ready to process
 */
export async function getEmailsToProcess(limit: number = 10): Promise<EmailQueue[]> {
  const now = new Date();

  return await db
    .select()
    .from(emailQueue)
    .where(
      and(
        eq(emailQueue.status, 'pending'),
        lte(emailQueue.nextRetryAt, now),
        lt(emailQueue.attempts, 5) // Max 5 attempts
      )
    )
    .limit(limit);
}

/**
 * Mark email as sent
 */
export async function markEmailSent(emailId: string): Promise<void> {
  await db
    .update(emailQueue)
    .set({
      status: 'sent',
      sentAt: new Date(),
    })
    .where(eq(emailQueue.id, emailId));
}

/**
 * Mark email as failed and schedule retry
 */
export async function markEmailFailed(
  emailId: string,
  error: string
): Promise<void> {
  // Get current attempt count
  const [email] = await db
    .select()
    .from(emailQueue)
    .where(eq(emailQueue.id, emailId))
    .limit(1);

  if (!email) {
    throw new Error('Email not found');
  }

  const newAttempts = email.attempts + 1;
  const nextRetry = calculateNextRetry(newAttempts);

  // If max attempts reached, mark as failed permanently
  const newStatus = newAttempts >= 5 ? 'failed' : 'pending';

  await db
    .update(emailQueue)
    .set({
      status: newStatus,
      attempts: newAttempts,
      lastError: error,
      nextRetryAt: nextRetry,
    })
    .where(eq(emailQueue.id, emailId));
}

/**
 * Reset email for resending (admin action)
 */
export async function resetEmailForResend(emailId: string): Promise<void> {
  await db
    .update(emailQueue)
    .set({
      status: 'pending',
      attempts: 0,
      lastError: null,
      nextRetryAt: new Date(),
    })
    .where(eq(emailQueue.id, emailId));
}
