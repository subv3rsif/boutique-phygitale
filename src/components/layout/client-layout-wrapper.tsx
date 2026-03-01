'use client';

import dynamic from 'next/dynamic';
import { WebVitalsTracker } from '@/components/analytics/web-vitals-tracker';

/**
 * Client-side Layout Components Wrapper
 *
 * This component lazy-loads heavy client components
 * to reduce initial bundle size and tracks Web Vitals
 */

// FloatingCart with animations
const FloatingCart = dynamic(
  () => import('@/components/layout/floating-cart').then(m => ({ default: m.FloatingCart })),
  {
    ssr: false, // Cart is client-only
  }
);

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
      <FloatingCart />
      <BottomNavWrapper />
    </>
  );
}
