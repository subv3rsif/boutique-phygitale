'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { DrawerMenu } from './drawer-menu';
import { cn } from '@/lib/utils';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

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
            isScrolled ? "h-16" : "h-24 md:h-28"
          )}
        >
          {/* Hamburger Menu - Left */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(true)}
            className={cn(
              "focus-magenta rounded-xl hover:bg-primary/10 transition-all duration-300 shimmer",
              isScrolled ? "h-10 w-10" : "h-12 w-12 md:h-14 md:w-14"
            )}
            aria-label="Ouvrir le menu"
          >
            <Menu className={cn(
              "transition-all duration-300",
              isScrolled ? "h-5 w-5" : "h-6 w-6"
            )} />
          </Button>

          {/* Logo/Brand - Center */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 focus-magenta rounded-2xl px-6 py-3 hover:bg-primary/5 transition-all duration-300 group"
          >
            <span className={cn(
              "font-display font-bold text-foreground transition-all duration-500 inline-block",
              "group-hover:text-gradient-love",
              isScrolled ? "text-xl" : "text-2xl md:text-3xl"
            )}>
              Boutique 1885
            </span>
          </Link>

          {/* Right spacer for balance */}
          <div className={cn(
            "transition-all duration-300",
            isScrolled ? "w-10" : "w-12 md:w-14"
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
