export async function register() {
  // Client-side instrumentation (browser)
  if (process.env.NEXT_RUNTIME === 'browser') {
    console.log('🔵 Loading Sentry client config...');
    await import('./sentry.client.config');
  }

  // Server-side instrumentation (Node.js)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🟢 Loading Sentry server config...');
    await import('./sentry.server.config');
  }

  // Edge runtime instrumentation
  if (process.env.NEXT_RUNTIME === 'edge') {
    console.log('🟣 Loading Sentry edge config...');
    await import('./sentry.edge.config');
  }
}

export const onRequestError = async (err: unknown, request: any, context: any) => {
  await import('@sentry/nextjs').then((Sentry) => {
    Sentry.captureException(err, {
      contexts: {
        request: {
          url: request.url,
          method: request.method,
          headers: Object.fromEntries(request.headers.entries()),
        },
      },
    });
  });
};
