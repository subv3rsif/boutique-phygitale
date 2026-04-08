import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics = {
    dsn_exists: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
    dsn_preview: process.env.NEXT_PUBLIC_SENTRY_DSN?.substring(0, 30) + '...',
    auth_token_exists: !!process.env.SENTRY_AUTH_TOKEN,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    node_env: process.env.NODE_ENV,
  };

  return NextResponse.json(diagnostics, { status: 200 });
}
