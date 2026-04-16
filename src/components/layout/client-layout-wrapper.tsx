'use client';

import { WebVitalsTracker } from '@/components/analytics/web-vitals-tracker';

/**
 * Client-side Layout Components Wrapper
 *
 * This component lazy-loads heavy client components
 * to reduce initial bundle size and tracks Web Vitals
 *
 * Note: Bottom navigation removed for better UX
 * Cart accessible via header on all screen sizes
 */

export function ClientLayoutWrapper() {
  return (
    <>
      <WebVitalsTracker />
    </>
  );
}
