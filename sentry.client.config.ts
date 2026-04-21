// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

// Enable Sentry monitoring with proper tunnel configuration
const SENTRY_ENABLED = true;

if (SENTRY_ENABLED) {
  // Validate required configuration
  if (!SENTRY_DSN) {
    console.error('❌ SENTRY_DSN not configured - monitoring disabled');
  } else if (!APP_URL) {
    console.warn('⚠️ NEXT_PUBLIC_APP_URL not configured - Sentry tunnel disabled');
    console.warn('   Sentry will work but may be blocked by ad-blockers');

    // Initialize without tunnel
    Sentry.init({
      dsn: SENTRY_DSN,
      tracesSampleRate: 0.1,
      debug: false,
    });
  } else {
    // Full configuration with tunnel
    const tunnelUrl = `${APP_URL}/monitoring`;
    console.log('✅ Sentry initialized with tunnel:', tunnelUrl);

    Sentry.init({
      dsn: SENTRY_DSN,

      // Tunnel to bypass ad-blockers (must be full URL)
      tunnel: tunnelUrl,

      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: 0.1, // Reduced to 10% in production

      // Disable debug mode in production
      debug: false,

      // Disable replay for now
      // replaysOnErrorSampleRate: 1.0,
      // replaysSessionSampleRate: 0.1,
    });
  }
} else {
  console.log('ℹ️ Sentry monitoring disabled');
}
