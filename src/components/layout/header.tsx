'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ShoppingCart } from 'lucide-react';
import { useCart } from '@/store/cart';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DrawerMenu } from './drawer-menu';
import { cn } from '@/lib/utils';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const totalItems = useCart((state) => state.totalItems());
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Hamburger Menu - Left */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(true)}
            className="focus-magenta -ml-2"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo/Brand - Center */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 focus-magenta rounded-md px-2 py-1"
          >
            <span className="font-display text-lg font-bold text-foreground">
              Boutique 1885
            </span>
          </Link>

          {/* Cart - Right */}
          <Link href="/panier">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'relative focus-magenta -mr-2',
                isActive('/panier') && 'text-primary'
              )}
              aria-label={`Panier (${totalItems} article${totalItems > 1 ? 's' : ''})`}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge
                  className={cn(
                    'absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs',
                    'bg-primary text-primary-foreground border-background border-2',
                    theme === 'dark' && 'magenta-glow-sm'
                  )}
                >
                  {totalItems}
                </Badge>
              )}
            </Button>
          </Link>
        </div>

        {/* Active Section Indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-border">
          {isActive('/') && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-12 h-0.5 bg-primary" />
          )}
          {isActive('/panier') && (
            <div className="absolute right-4 bottom-0 w-12 h-0.5 bg-primary" />
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
