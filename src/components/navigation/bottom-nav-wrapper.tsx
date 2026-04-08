'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/store/cart';
import { BottomNav } from './bottom-nav';

/**
 * Client Component Wrapper for BottomNav
 *
 * Purpose:
 * - Connects to Zustand cart store (client-only)
 * - Keeps layout.tsx as Server Component
 * - Provides cart count to BottomNav
 * - Prevents hydration mismatch by waiting for client mount
 *
 * Usage in layout.tsx:
 * ```tsx
 * import { BottomNavWrapper } from '@/components/navigation/bottom-nav-wrapper';
 *
 * <BottomNavWrapper />
 * ```
 */
export function BottomNavWrapper() {
  // Fix hydration: wait for client mount before reading from Zustand (localStorage)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartStore = useCart();
  const cartCount = mounted ? cartStore.totalItems() : 0;

  return (
    <BottomNav
      cartCount={cartCount}
      onCartClick={() => {
        // Optional: Add custom behavior when cart is clicked
        // e.g., analytics tracking, haptic feedback, etc.
        console.log('Cart clicked, count:', cartCount);
      }}
    />
  );
}
