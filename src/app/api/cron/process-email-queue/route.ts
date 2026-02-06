import { NextRequest, NextResponse } from 'next/server';
import { getEmailsToProcess, markEmailSent, markEmailFailed } from '@/lib/email/queue';
import { sendEmail } from '@/lib/email/sender';

/**
 * GET/POST /api/cron/process-email-queue
 * Processes pending emails in the queue with retry logic
 *
 * Called by:
 * - Vercel Cron (configured in vercel.json)
 * - Or external cron service (cron-job.org)
 *
 * Security: Protected by secret token
 */
export async function GET(request: NextRequest) {
  return handleEmailQueue(request);
}

export async function POST(request: NextRequest) {
  return handleEmailQueue(request);
}

async function handleEmailQueue(request: NextRequest) {
  try {
    // 1. Verify cron secret (security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('Invalid cron secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting email queue processing...');

    // 2. Get pending emails (max 10 at a time)
    const pendingEmails = await getEmailsToProcess(10);

    console.log(`Found ${pendingEmails.length} emails to process`);

    if (pendingEmails.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No emails to process',
      });
    }

    // 3. Process each email
    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const email of pendingEmails) {
      try {
        console.log(`Processing email ${email.id} (attempt ${email.attempts + 1})`);

        // Send email
        await sendEmail(email);

        // Mark as sent
        await markEmailSent(email.id);

        results.sent++;
        console.log(`Email ${email.id} sent successfully`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Failed to send email ${email.id}:`, errorMessage);

        // Mark as failed and schedule retry
        await markEmailFailed(email.id, errorMessage);

        results.failed++;
        results.errors.push(`Email ${email.id}: ${errorMessage}`);
      }
    }

    console.log(`Email queue processing complete: ${results.sent} sent, ${results.failed} failed`);

    return NextResponse.json({
      success: true,
      processed: pendingEmails.length,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors,
    });

  } catch (error) {
    console.error('Email queue processing error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process email queue',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
