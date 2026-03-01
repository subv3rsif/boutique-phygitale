import { NextRequest, NextResponse } from 'next/server';

/**
 * Web Vitals Tracking API
 *
 * Receives Web Vitals metrics from the client and logs them.
 * In production, send to your analytics service (Vercel Analytics, Google Analytics, etc.)
 */

type WebVitalMetric = {
  id: string;
  name: 'FCP' | 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'INP';
  value: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  navigationType?: string;
};

export async function POST(req: NextRequest) {
  try {
    const metric: WebVitalMetric = await req.json();

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vital] ${metric.name}:`, {
        value: metric.value,
        rating: metric.rating,
        id: metric.id.slice(0, 8),
      });
    }

    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      // Option 1: Vercel Analytics (if @vercel/analytics installed)
      // Automatic, no code needed

      // Option 2: Google Analytics
      // await sendToGoogleAnalytics(metric);

      // Option 3: Custom analytics endpoint
      // await sendToCustomAnalytics(metric);

      // For now, just log to server console
      console.log(`[Production Web Vital] ${metric.name}: ${metric.value}ms`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Web Vitals] Error:', error);
    return NextResponse.json(
      { error: 'Failed to track web vital' },
      { status: 500 }
    );
  }
}

// Helper: Send to Google Analytics (uncomment if needed)
/*
async function sendToGoogleAnalytics(metric: WebVitalMetric) {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;
  if (!GA_MEASUREMENT_ID) return;

  const body = {
    client_id: metric.id,
    events: [
      {
        name: metric.name,
        params: {
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          metric_id: metric.id,
          metric_value: metric.value,
          metric_delta: metric.delta,
          metric_rating: metric.rating,
        },
      },
    ],
  };

  await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${process.env.GA_API_SECRET}`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );
}
*/
