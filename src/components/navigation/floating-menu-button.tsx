'use client';

import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Floating Menu Button (Mobile Only)
 *
 * Floating hamburger button in top-left corner for mobile
 * Replaces header hamburger to save vertical space
 */

type FloatingMenuButtonProps = {
  onClick: () => void;
  className?: string;
};

export function FloatingMenuButton({ onClick, className }: FloatingMenuButtonProps) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.1
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        // Mobile only
        "md:hidden",
        // Fixed positioning - top-left
        "fixed top-4 left-4 z-40",
        // Size
        "h-12 w-12",
        // Shape
        "rounded-full",
        // Glass effect
        "glass-purple",
        // Shadow
        "shadow-premium",
        // Flex
        "flex items-center justify-center",
        // Transitions
        "transition-all duration-300",
        // Focus
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      aria-label="Ouvrir le menu"
    >
      <Menu className="h-5 w-5 text-primary" />
    </motion.button>
  );
}
