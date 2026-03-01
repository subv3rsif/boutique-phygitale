'use client';

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';

/**
 * Web Vitals Tracker Component
 *
 * Tracks Core Web Vitals and sends them to /api/analytics/web-vitals
 * Mount this component in your layout to enable tracking
 */
export function WebVitalsTracker() {
  useReportWebVitals((metric) => {
    // Send to API route
    if (typeof window !== 'undefined') {
      fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
        keepalive: true, // Ensure request completes even if page unloads
      }).catch((error) => {
        // Silently fail in production to avoid console spam
        if (process.env.NODE_ENV === 'development') {
          console.error('[Web Vitals] Failed to send metric:', error);
        }
      });
    }
  });

  return null; // This component doesn't render anything
}
