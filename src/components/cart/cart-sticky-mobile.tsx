'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/store/cart';
import { formatCurrency, getProductById } from '@/lib/catalogue';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export function CartStickyMobile() {
  const [isVisible, setIsVisible] = useState(false);
  const { items, totalItems } = useCart();

  // Calculate total price
  const total = items.reduce((sum, item) => {
    const product = getProductById(item.id);
    if (!product) return sum;
    return sum + (product.priceCents * item.qty);
  }, 0);

  // Show sticky cart only when there are items and user scrolled down
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 400;
      setIsVisible(scrolled && totalItems() > 0);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, [totalItems]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50",
            "md:hidden", // Only show on mobile
            "p-4 pb-safe",
            "bg-surface/95 backdrop-blur-xl border-t border-border",
            "shadow-2xl"
          )}
        >
          <div className="container max-w-lg mx-auto">
            <Link href="/panier">
              <Button
                size="lg"
                className={cn(
                  "w-full relative overflow-hidden group",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  "dark:magenta-glow transition-all duration-300",
                  "font-semibold py-6 text-base h-auto"
                )}
              >
                {/* Content */}
                <span className="relative z-10 flex items-center justify-between w-full">
                  <span className="flex items-center gap-3">
                    <div className="relative">
                      <ShoppingBag className="h-5 w-5" />
                      <Badge
                        className={cn(
                          "absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0",
                          "bg-background text-primary border-2 border-primary",
                          "text-xs font-bold"
                        )}
                      >
                        {totalItems()}
                      </Badge>
                    </div>
                    <span>Voir mon panier</span>
                  </span>

                  <span className="flex items-center gap-2">
                    <span className="font-bold">
                      {formatCurrency(total)}
                    </span>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </span>

                {/* Shimmer effect */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
              </Button>
            </Link>

            {/* Quick item count indicator */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center text-xs text-muted-foreground mt-2"
            >
              {totalItems()} article{totalItems() > 1 ? 's' : ''} dans votre panier
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
