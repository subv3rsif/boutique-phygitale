import { NextRequest } from 'next/server';

export const runtime = 'edge';

const SENTRY_HOST = 'o4511178706976768.ingest.de.sentry.io';
const SENTRY_PROJECT_ID = '4511178708877392';

export async function POST(req: NextRequest) {
  try {
    const envelope = await req.text();

    const pieces = envelope.split('\n');
    const headerLine = pieces[0];

    if (!headerLine) {
      throw new Error('Invalid envelope - no header');
    }

    const header = JSON.parse(headerLine);

    // Check if DSN matches
    const { host, project_id } = (header.dsn && typeof header.dsn === 'string')
      ? parseDsn(header.dsn)
      : { host: SENTRY_HOST, project_id: SENTRY_PROJECT_ID };

    if (host !== SENTRY_HOST) {
      throw new Error('Invalid Sentry host');
    }

    // Forward to Sentry
    const sentryUrl = `https://${SENTRY_HOST}/api/${project_id}/envelope/`;
    
    const response = await fetch(sentryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
      },
      body: envelope,
    });

    return new Response(null, { 
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error('Sentry tunnel error:', error);
    return new Response('Tunnel error', { status: 500 });
  }
}

function parseDsn(dsn: string) {
  const match = dsn.match(/https:\/\/(.+)@(.+)\/(.+)/);
  if (!match) throw new Error('Invalid DSN');
  return {
    host: match[2],
    project_id: match[3],
  };
}
