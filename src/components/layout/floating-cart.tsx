'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/store/cart';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function FloatingCart() {
  const totalItems = useCart((state) => state.totalItems());

  return (
    <Link href="/panier">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.3
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "fixed bottom-8 right-8 z-40",
          "h-16 w-16 rounded-full",
          "glass-purple shadow-premium-purple",
          "flex items-center justify-center",
          "cursor-pointer group",
          "transition-all duration-300"
        )}
      >
        {/* Cart Icon */}
        <ShoppingCart className="h-7 w-7 text-primary group-hover:text-primary/80 transition-colors" />

        {/* Badge with count - Animated */}
        <AnimatePresence mode="wait">
          {totalItems > 0 && (
            <motion.div
              key={totalItems}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 25
              }}
              className="absolute -top-1 -right-1"
            >
              <Badge
                className={cn(
                  "h-7 w-7 flex items-center justify-center p-0 rounded-full",
                  "bg-primary text-primary-foreground",
                  "border-2 border-background",
                  "font-bold text-sm",
                  "shadow-premium"
                )}
              >
                {totalItems}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse effect when items added */}
        {totalItems > 0 && (
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </motion.div>
    </Link>
  );
}
