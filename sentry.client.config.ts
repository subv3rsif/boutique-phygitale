// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

// Temporarily disable Sentry to fix site blocking issue
// TODO: Re-enable with proper tunnel configuration
const SENTRY_ENABLED = false;

if (SENTRY_ENABLED && SENTRY_DSN) {
  console.log('✅ Sentry DSN loaded:', SENTRY_DSN.substring(0, 30) + '...');

  Sentry.init({
    dsn: SENTRY_DSN,

    // Tunnel to bypass ad-blockers (must be full URL)
    tunnel: process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/monitoring`
      : undefined,

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 0.1, // Reduced to 10% in production

    // Disable debug mode in production
    debug: false,

    // Disable replay for now
    // replaysOnErrorSampleRate: 1.0,
    // replaysSessionSampleRate: 0.1,
  });
} else {
  console.log('ℹ️ Sentry monitoring temporarily disabled');
}
