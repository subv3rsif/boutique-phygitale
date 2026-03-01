'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ShoppingBag, Search, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/theme-provider';
import { useCart } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DrawerMenu } from './drawer-menu';
import { cn } from '@/lib/utils';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const totalItems = useCart((state) => state.totalItems());

  const isActive = (path: string) => pathname === path;

  // Detect scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-500 ease-out",
          "border-b border-border/50",
          isScrolled
            ? "glass-vibrant shadow-vibrant backdrop-blur-2xl"
            : "glass-love backdrop-blur-xl shadow-vibrant-lg"
        )}
      >
        <div
          className={cn(
            "container flex items-center justify-between px-4 md:px-6 transition-all duration-500",
            isScrolled ? "h-16" : "h-24 md:h-20"
          )}
        >
          {/* Hamburger Menu - Left */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(true)}
            className={cn(
              "focus-magenta rounded-xl hover:bg-primary/10 transition-all duration-300 shimmer",
              isScrolled ? "h-10 w-10" : "h-12 w-12 md:h-12 md:w-12"
            )}
            aria-label="Ouvrir le menu"
          >
            <Menu className={cn(
              "transition-all duration-300",
              isScrolled ? "h-5 w-5" : "h-6 w-6 md:h-5 md:w-5"
            )} />
          </Button>

          {/* Logo/Brand - Center on mobile, left on desktop */}
          <Link
            href="/"
            className={cn(
              "focus-magenta rounded-2xl px-6 py-3 hover:bg-primary/5 transition-all duration-300 group",
              "absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0"
            )}
          >
            <span className={cn(
              "font-display font-bold text-foreground transition-all duration-500 inline-block",
              "group-hover:text-gradient-love",
              isScrolled ? "text-xl" : "text-2xl md:text-2xl"
            )}>
              Boutique 1885
            </span>
          </Link>

          {/* Desktop Actions - Right (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-2">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-11 w-11 rounded-xl",
                "hover:bg-primary/10 hover:scale-105",
                "transition-all duration-300",
                "focus-magenta"
              )}
              aria-label="Rechercher"
            >
              <Search className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </Button>

            {/* Cart Button - Desktop Only */}
            <Link href="/panier">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "relative h-11 px-4 rounded-xl",
                  "glass-purple border border-primary/20",
                  "flex items-center gap-2",
                  "hover:border-primary/40 hover:shadow-premium",
                  "transition-all duration-300",
                  "focus-magenta"
                )}
              >
                <ShoppingBag className="h-5 w-5 text-primary" />

                {/* Cart Count - Always visible on desktop for clarity */}
                <AnimatePresence mode="wait">
                  {totalItems > 0 ? (
                    <motion.span
                      key={totalItems}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 25
                      }}
                      className="font-semibold text-primary text-sm min-w-[20px] text-center"
                    >
                      {totalItems > 99 ? '99+' : totalItems}
                    </motion.span>
                  ) : (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-muted-foreground text-sm"
                    >
                      0
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Animated Badge - Top Right Corner */}
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.div
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
                          "h-5 w-5 flex items-center justify-center p-0 rounded-full",
                          "bg-primary text-primary-foreground",
                          "border-2 border-background",
                          "font-bold text-xs",
                          "shadow-premium"
                        )}
                      >
                        {totalItems > 9 ? '9+' : totalItems}
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>

            {/* Profile Button */}
            <Link href="/profil">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-11 w-11 rounded-xl",
                  "hover:bg-primary/10 hover:scale-105",
                  "transition-all duration-300",
                  "focus-magenta"
                )}
                aria-label="Profil"
              >
                <User className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              </Button>
            </Link>
          </div>

          {/* Mobile: Spacer for visual balance */}
          <div className={cn(
            "md:hidden transition-all duration-300",
            isScrolled ? "w-10" : "w-12"
          )} />
        </div>

        {/* Active Section Indicator - Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent">
          {isActive('/') && (
            <div className={cn(
              "absolute left-1/2 -translate-x-1/2 bottom-0 h-0.5 bg-gradient-love transition-all duration-500",
              isScrolled ? "w-12" : "w-16"
            )} />
          )}
        </div>

        {/* Shimmer effect on scroll */}
        {!isScrolled && (
          <div className="absolute inset-0 shimmer-auto pointer-events-none opacity-30" />
        )}
      </header>

      {/* Drawer Menu */}
      <DrawerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    </>
  );
}
