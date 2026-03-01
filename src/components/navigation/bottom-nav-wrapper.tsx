'use client';

import { useCart } from '@/store/cart';
import { BottomNav } from './bottom-nav';

/**
 * Client Component Wrapper for BottomNav
 *
 * Purpose:
 * - Connects to Zustand cart store (client-only)
 * - Keeps layout.tsx as Server Component
 * - Provides cart count to BottomNav
 *
 * Usage in layout.tsx:
 * ```tsx
 * import { BottomNavWrapper } from '@/components/navigation/bottom-nav-wrapper';
 *
 * <BottomNavWrapper />
 * ```
 */
export function BottomNavWrapper() {
  const cartStore = useCart();
  const cartCount = cartStore.totalItems();

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
