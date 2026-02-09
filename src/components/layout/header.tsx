'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { DrawerMenu } from './drawer-menu';
import { cn } from '@/lib/utils';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border glass dark:glass-dark">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Hamburger Menu - Left */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(true)}
            className="focus-magenta -ml-2 rounded-xl hover:bg-primary/10"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo/Brand - Center */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 focus-magenta rounded-xl px-4 py-2 hover:bg-primary/5 transition-colors"
          >
            <span className="font-display text-lg font-bold text-foreground">
              Boutique 1885
            </span>
          </Link>

          {/* Right spacer for balance */}
          <div className="w-10" />
        </div>

        {/* Active Section Indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-border">
          {isActive('/') && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-12 h-0.5 bg-primary" />
          )}
        </div>
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
