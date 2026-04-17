import { NextRequest, NextResponse } from 'next/server';
import { db, dropSubscribers } from '@/lib/db';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * POST /api/drop-newsletter/subscribe
 * Subscribe to drop newsletter (limited edition announcements)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if already subscribed
    const [existing] = await db
      .select()
      .from(dropSubscribers)
      .where(eq(dropSubscribers.email, normalizedEmail))
      .limit(1);

    if (existing) {
      // If previously unsubscribed, resubscribe
      if (existing.unsubscribedAt) {
        await db
          .update(dropSubscribers)
          .set({
            unsubscribedAt: null,
            subscribedAt: new Date(),
          })
          .where(eq(dropSubscribers.email, normalizedEmail));

        return NextResponse.json({
          success: true,
          message: 'Réinscription réussie',
        });
      }

      // Already subscribed
      return NextResponse.json({
        success: true,
        message: 'Déjà inscrit',
      });
    }

    // Generate unsubscribe token
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');

    // Create new subscriber
    await db.insert(dropSubscribers).values({
      email: normalizedEmail,
      confirmed: true, // Auto-confirm for simplicity (can add email confirmation later)
      confirmedAt: new Date(),
      unsubscribeToken,
    });

    // TODO: Send confirmation email via Resend
    // For now, auto-confirm

    return NextResponse.json({
      success: true,
      message: 'Inscription réussie',
    });
  } catch (error: any) {
    console.error('Drop newsletter subscribe error:', error);

    // Handle unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json({
        success: true,
        message: 'Déjà inscrit',
      });
    }

    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
