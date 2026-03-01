'use client';

import dynamic from 'next/dynamic';
import { WebVitalsTracker } from '@/components/analytics/web-vitals-tracker';

/**
 * Client-side Layout Components Wrapper
 *
 * This component lazy-loads heavy client components
 * to reduce initial bundle size and tracks Web Vitals
 *
 * Note: FloatingCart removed in favor of unified navigation:
 * - Desktop: Header with cart button
 * - Mobile: BottomNav pill with cart
 */

// BottomNav with Framer Motion
const BottomNavWrapper = dynamic(
  () => import('@/components/navigation/bottom-nav-wrapper').then(m => ({ default: m.BottomNavWrapper })),
  {
    ssr: false, // Navigation is client-only
  }
);

export function ClientLayoutWrapper() {
  return (
    <>
      <WebVitalsTracker />
      <BottomNavWrapper />
    </>
  );
}
