'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DrawerMenu } from './drawer-menu';
import { cn } from '@/lib/utils';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const totalItems = useCart((state) => state.totalItems());

  // Detect scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 border-b",
          isScrolled
            ? "glass-1885 shadow-terra h-16 md:h-20"
            : "bg-ivoire border-ivoire-2 h-16 md:h-24"
        )}
      >
        <div className="w-full max-w-7xl mx-auto h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Left: Hamburger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(true)}
            className={cn(
              "text-pierre hover:text-encre transition-colors focus-terra",
              isScrolled ? "h-10 w-10" : "h-12 w-12"
            )}
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* Center: Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 focus-terra">
            {/* Desktop: Full logo */}
            <div className="hidden md:block text-center">
              <div className="flex items-center gap-3 justify-center mb-1">
                <span className={cn(
                  "font-display font-bold text-encre transition-all",
                  isScrolled ? "text-3xl" : "text-5xl"
                )}>
                  18
                </span>
                <div className={cn(
                  "h-px bg-ivoire-2 transition-all",
                  isScrolled ? "w-8" : "w-12"
                )} />
                <span className={cn(
                  "font-display font-bold text-encre transition-all",
                  isScrolled ? "text-3xl" : "text-5xl"
                )}>
                  85
                </span>
              </div>
              {!isScrolled && (
                <p className="text-[10px] tracking-[0.3em] uppercase text-pierre">
                  Manufacture Alfortvillaise
                </p>
              )}
            </div>

            {/* Mobile: Compact logo */}
            <div className="md:hidden font-display font-bold text-3xl text-encre">
              1885
            </div>
          </Link>

          {/* Right: Cart */}
          <Link href="/panier" className="relative focus-terra">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "text-pierre hover:text-encre transition-colors relative",
                isScrolled ? "h-10 w-10" : "h-12 w-12"
              )}
              aria-label="Panier"
            >
              <ShoppingBag className="h-6 w-6" />

              {/* Badge count */}
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Badge className="h-5 w-5 flex items-center justify-center p-0 rounded-full bg-terra text-ivoire border-2 border-background font-bold text-xs">
                      {totalItems > 9 ? '9+' : totalItems}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </Link>
        </div>
      </header>

      {/* Drawer Menu */}
      <DrawerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </>
  );
}
