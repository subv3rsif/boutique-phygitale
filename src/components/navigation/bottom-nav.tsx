'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { NAV_ITEMS, shouldShowBottomNav } from './nav-items';

/**
 * Bottom Navigation Bar - Floating Pill Design
 * Inspired by Iconly – Shop Market
 *
 * Features:
 * - Glassmorphism with backdrop blur
 * - Elevated cart button in sub-pill
 * - Animated cart badge with "pop" effect
 * - iOS safe area support
 * - Mobile-first responsive design
 */

// ────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────

const NAV_HEIGHT = 'h-16'; // 64px
const DOCK_MAX_WIDTH = 'max-w-[560px]';
const CART_BUTTON_BG = 'bg-gradient-to-br from-primary to-primary/80'; // Love Symbol gradient
const ICON_STROKE_WIDTH = 1.5;

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

export type BottomNavProps = {
  /** Number of items in cart (for badge) */
  cartCount?: number;
  /** Callback when cart button is clicked */
  onCartClick?: () => void;
  /** Additional CSS classes */
  className?: string;
};

// ────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────

export function BottomNav({
  cartCount = 0,
  onCartClick,
  className,
}: BottomNavProps) {
  const pathname = usePathname();

  // Hide on excluded routes (checkout, login, admin, etc.)
  if (!shouldShowBottomNav(pathname)) {
    return null;
  }

  return (
    <nav
      className={cn(
        // Mobile only - hidden on desktop (md:hidden)
        'md:hidden',
        // Fixed positioning with iOS safe area support
        'fixed bottom-4 left-0 right-0 z-50',
        // Safe area padding for iOS devices
        'pb-[env(safe-area-inset-bottom)]',
        // Center the dock
        'flex justify-center px-4',
        className
      )}
      aria-label="Navigation principale"
    >
      {/* Floating Dock Container */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
          delay: 0.2,
        }}
        className={cn(
          // Size & shape
          NAV_HEIGHT,
          DOCK_MAX_WIDTH,
          'w-full rounded-full',
          // Glassmorphism effect
          'glass-vibrant',
          'backdrop-blur-md',
          // Shadows
          'shadow-premium-lg',
          // Border
          'border border-border/50'
        )}
      >
        <div className="flex items-center justify-around h-full px-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            // Special treatment for Cart button
            if (item.isCart) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    if (onCartClick) {
                      e.preventDefault();
                      onCartClick();
                    }
                  }}
                  aria-label={item.ariaLabel}
                  className="relative group"
                >
                  {/* Elevated Sub-Pill for Cart */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      // Size - slightly larger than other items
                      'h-14 w-14',
                      // Positioning - elevated above dock
                      'relative -top-2',
                      // Shape
                      'rounded-full',
                      // Magenta accent background
                      CART_BUTTON_BG,
                      // Shadow
                      'shadow-premium-purple',
                      // Flex
                      'flex items-center justify-center',
                      // Transitions
                      'transition-all duration-300'
                    )}
                  >
                    <Icon
                      strokeWidth={ICON_STROKE_WIDTH}
                      className="w-6 h-6 text-white"
                      aria-hidden="true"
                    />

                    {/* Cart Badge with Pop Animation */}
                    <AnimatePresence mode="wait">
                      {cartCount > 0 && (
                        <motion.div
                          key={cartCount}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 15,
                          }}
                          className={cn(
                            // Positioning - top right corner
                            'absolute -top-1 -right-1',
                            // Size
                            'min-w-[20px] h-5 px-1.5',
                            // Shape
                            'rounded-full',
                            // Colors
                            'bg-red-500 text-white',
                            // Typography
                            'text-xs font-semibold',
                            // Flex
                            'flex items-center justify-center',
                            // Border
                            'border-2 border-background'
                          )}
                        >
                          {cartCount > 99 ? '99+' : cartCount}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              );
            }

            // Regular nav items (Home, Explore, Saved, Profile)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.ariaLabel}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  // Size
                  'h-12 w-12',
                  // Shape
                  'rounded-xl',
                  // Flex
                  'flex items-center justify-center',
                  // Transitions
                  'transition-all duration-300',
                  // Focus visible
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  // Interactive states
                  'relative group'
                )}
              >
                {/* Active indicator - subtle background glow */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className={cn(
                      'absolute inset-0 rounded-xl',
                      'bg-gradient-love',
                      'opacity-10'
                    )}
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}

                {/* Icon */}
                <Icon
                  strokeWidth={isActive ? 2 : ICON_STROKE_WIDTH}
                  className={cn(
                    'w-6 h-6 relative z-10 transition-all duration-300',
                    isActive
                      ? 'text-primary scale-110'
                      : 'text-muted-foreground group-hover:text-foreground group-hover:scale-105'
                  )}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>
      </motion.div>
    </nav>
  );
}
