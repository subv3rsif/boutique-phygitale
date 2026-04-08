// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

// Debug: Verify DSN is loaded
if (!SENTRY_DSN) {
  console.error('❌ SENTRY DSN NOT LOADED - Check NEXT_PUBLIC_SENTRY_DSN env var');
} else {
  console.log('✅ Sentry DSN loaded:', SENTRY_DSN.substring(0, 30) + '...');
}

Sentry.init({
  dsn: SENTRY_DSN,

  // Tunnel to bypass ad-blockers
  tunnel: '/monitoring',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: true, // Enable debug mode to troubleshoot

  // Disable replay for now - will enable once basic error tracking works
  // replaysOnErrorSampleRate: 1.0,
  // replaysSessionSampleRate: 0.1,
});
