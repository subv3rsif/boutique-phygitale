import { resend, getSenderEmail } from './client';
import { getOrderById, getPickupTokenByHash } from '../db/helpers';
import { db, pickupTokens } from '../db';
import { eq } from 'drizzle-orm';
import { type EmailQueue } from '../db';
import { DeliveryConfirmationEmail } from './templates/delivery-confirmation';
import { PickupConfirmationEmail } from './templates/pickup-confirmation';
import { ShippedNotificationEmail } from './templates/shipped-notification';
import { render } from '@react-email/components';
import { generatePickupQRCode } from '../qr/generator';

/**
 * Email sender
 * Routes to appropriate template based on email type
 */

export async function sendEmail(job: EmailQueue): Promise<void> {
  // Get order details
  const order = await getOrderById(job.orderId);

  if (!order) {
    throw new Error(`Order not found: ${job.orderId}`);
  }

  // Route to appropriate email template
  switch (job.emailType) {
    case 'delivery_confirmation':
      await sendDeliveryConfirmation(order, job.recipientEmail);
      break;

    case 'pickup_confirmation':
      await sendPickupConfirmation(order, job.recipientEmail);
      break;

    case 'shipped_notification':
      await sendShippedNotification(order, job.recipientEmail);
      break;

    case 'pickup_reminder':
      // Optional feature
      throw new Error('Pickup reminder not yet implemented');

    default:
      throw new Error(`Unknown email type: ${job.emailType}`);
  }
}

/**
 * Send delivery confirmation email
 */
async function sendDeliveryConfirmation(
  order: any,
  recipientEmail: string
): Promise<void> {
  const html = await render(
    DeliveryConfirmationEmail({
      order,
    })
  );

  await resend.emails.send({
    from: getSenderEmail(),
    to: recipientEmail,
    subject: 'Votre commande est confirmée',
    html,
  });
}

/**
 * Send pickup confirmation email with QR code
 */
async function sendPickupConfirmation(
  order: any,
  recipientEmail: string
): Promise<void> {
  // Get pickup token from database
  const [pickupTokenRecord] = await db
    .select()
    .from(pickupTokens)
    .where(eq(pickupTokens.orderId, order.id))
    .limit(1);

  if (!pickupTokenRecord) {
    throw new Error(`Pickup token not found for order: ${order.id}`);
  }

  // Retrieve clear token from metadata
  // NOTE: In production, fetch from Redis cache instead
  const metadata = pickupTokenRecord.metadata as { clearToken?: string } | null;
  const clearToken = metadata?.clearToken;

  if (!clearToken) {
    throw new Error(`Clear token not found in metadata for order: ${order.id}`);
  }

  // Generate QR code
  const qrCodeDataURL = await generatePickupQRCode(clearToken);

  const html = await render(
    PickupConfirmationEmail({
      order,
      qrCodeDataURL,
      pickupToken: clearToken,
    })
  );

  await resend.emails.send({
    from: getSenderEmail(),
    to: recipientEmail,
    subject: 'Votre commande est prête à retirer',
    html,
  });
}

/**
 * Send shipped notification email with tracking info
 */
async function sendShippedNotification(
  order: any,
  recipientEmail: string
): Promise<void> {
  if (!order.trackingNumber) {
    throw new Error(`No tracking number for order: ${order.id}`);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const orderUrl = `${appUrl}/ma-commande/${order.id}`;

  const html = await render(
    ShippedNotificationEmail({
      orderNumber: order.id,
      customerEmail: order.customerEmail,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl || `https://www.laposte.fr/outils/suivre-vos-envois?code=${order.trackingNumber}`,
      orderUrl,
      items: order.items.map((item: any) => ({
        name: item.nameSnapshot,
        qty: item.qty,
        priceCents: item.unitPriceCents * item.qty,
      })),
      totalCents: order.grandTotalCents,
    })
  );

  await resend.emails.send({
    from: getSenderEmail(),
    to: recipientEmail,
    subject: 'Votre colis a été expédié',
    html,
  });
}
