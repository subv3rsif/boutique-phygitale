// src/lib/email-alerts.ts
import { Resend } from 'resend';
import StockAlertEmail from '@/emails/stock-alert';
import OutOfStockEmail from '@/emails/out-of-stock';
import type { Product } from '@/types/product';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Get admin email recipients
 */
function getAdminEmails(): string[] {
  const emails = process.env.ADMIN_EMAILS || '';
  return emails.split(',').map(email => email.trim()).filter(Boolean);
}

/**
 * Get app URL for email links
 */
function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

/**
 * Send low stock alert to admins
 */
export async function sendLowStockAlert(product: Product): Promise<void> {
  const adminEmails = getAdminEmails();

  if (adminEmails.length === 0) {
    console.warn('[EMAIL] No admin emails configured for stock alerts');
    return;
  }

  const appUrl = getAppUrl();

  try {
    await resend.emails.send({
      from: 'Boutique 1885 <noreply@1885.fr>',
      to: adminEmails,
      subject: `⚠️ Stock faible : ${product.name}`,
      react: StockAlertEmail({
        productName: product.name,
        productId: product.id,
        currentStock: product.stockQuantity,
        threshold: product.stockAlertThreshold,
        adminUrl: appUrl,
      }),
    });

    console.log(`[EMAIL] Low stock alert sent for ${product.slug} to ${adminEmails.join(', ')}`);
  } catch (error) {
    // Log error but don't throw - email failures shouldn't break stock operations
    console.error(`[EMAIL] Failed to send low stock alert for ${product.slug}:`, error);
  }
}

/**
 * Send out of stock alert to admins
 */
export async function sendOutOfStockAlert(product: Product): Promise<void> {
  const adminEmails = getAdminEmails();

  if (adminEmails.length === 0) {
    console.warn('[EMAIL] No admin emails configured for stock alerts');
    return;
  }

  const appUrl = getAppUrl();

  try {
    await resend.emails.send({
      from: 'Boutique 1885 <noreply@1885.fr>',
      to: adminEmails,
      subject: `🚨 Rupture de stock : ${product.name}`,
      react: OutOfStockEmail({
        productName: product.name,
        productId: product.id,
        adminUrl: appUrl,
      }),
    });

    console.log(`[EMAIL] Out of stock alert sent for ${product.slug} to ${adminEmails.join(', ')}`);
  } catch (error) {
    // Log error but don't throw - email failures shouldn't break stock operations
    console.error(`[EMAIL] Failed to send out of stock alert for ${product.slug}:`, error);
  }
}
