'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Sparkles, TrendingUp, ShoppingBag, Sun, Moon } from 'lucide-react';
import { useCart } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const menuSections = {
  fastLanes: [
    {
      href: '/nouveautes',
      label: 'Nouveautés',
      icon: Sparkles,
      badge: 'new',
    },
    {
      href: '/best-sellers',
      label: 'Best-sellers',
      icon: TrendingUp,
    },
  ],
  main: [
    {
      href: '/',
      label: 'Tous les produits',
    },
    {
      href: '/collections',
      label: 'Collections',
    },
    {
      href: '/a-propos',
      label: 'À propos',
    },
  ],
  footer: [
    {
      href: '/mentions-legales',
      label: 'Mentions légales',
    },
    {
      href: '/politique-confidentialite',
      label: 'Politique de confidentialité',
    },
    {
      href: '/cgv',
      label: 'CGV',
    },
  ],
};

export function DrawerMenu({ isOpen, onClose, theme, onToggleTheme }: DrawerMenuProps) {
  const pathname = usePathname();
  const totalItems = useCart((state) => state.totalItems());

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 left-0 h-full w-80 max-w-[85vw] z-50 transition-transform duration-300 ease-out',
          'bg-card border-r border-border shadow-2xl',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <span className="font-display text-xl font-bold text-foreground">Menu</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="focus-magenta"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Fermer le menu</span>
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Fast Lanes */}
            <div className="p-6 space-y-2 border-b border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Accès rapide
              </p>
              {menuSections.fastLanes.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'relative flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth',
                      'hover:bg-sidebar-accent focus-magenta',
                      isActive && 'bg-sidebar-accent active-indicator'
                    )}
                  >
                    <Icon className="h-5 w-5 text-primary" />
                    <span className={cn(
                      'font-medium',
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}

              {/* Cart Resume */}
              {totalItems > 0 && (
                <Link
                  href="/panier"
                  onClick={onClose}
                  className={cn(
                    'relative flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth',
                    'bg-primary/10 border border-primary/20 hover:bg-primary/15 focus-magenta'
                  )}
                >
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  <span className="font-medium text-foreground">
                    Reprendre mon panier
                  </span>
                  <Badge className="ml-auto bg-primary text-primary-foreground">
                    {totalItems}
                  </Badge>
                </Link>
              )}
            </div>

            {/* Main Navigation */}
            <nav className="p-6 space-y-1">
              {menuSections.main.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'relative block px-4 py-3 rounded-lg transition-smooth',
                      'hover:bg-sidebar-accent focus-magenta',
                      isActive && 'bg-sidebar-accent active-indicator'
                    )}
                  >
                    <span className={cn(
                      'font-medium',
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer Links */}
            <div className="p-6 pt-0 space-y-1 border-t border-border">
              {menuSections.footer.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-smooth focus-magenta rounded"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="p-6 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleTheme}
              className="w-full justify-start gap-3 focus-magenta"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4" />
                  <span>Mode clair</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  <span>Mode sombre</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
