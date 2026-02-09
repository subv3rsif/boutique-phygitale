'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Fullscreen Overlay Background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-purple-950/95 dark:bg-purple-950/98 backdrop-blur-xl z-50"
            onClick={onClose}
          >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-purple-600/10" />

            {/* Decorative grid */}
            <div className="absolute inset-0 grid-lines opacity-5" />
          </motion.div>

          {/* Fullscreen Menu Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
          >
            {/* Close Button - Top Right */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="absolute top-8 right-8 pointer-events-auto"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className={cn(
                  "h-12 w-12 rounded-full glass-purple text-cloud-dancer",
                  "hover:bg-primary/20 hover:scale-110 transition-all duration-300"
                )}
                aria-label="Fermer le menu"
              >
                <X className="h-6 w-6" />
              </Button>
            </motion.div>

            {/* Menu Content - Centered */}
            <div className="w-full max-w-4xl px-8 pointer-events-auto">
              <div className="space-y-12">
                {/* Main Navigation - Large */}
                <nav className="space-y-3">
                  {/* Fast Lanes with icons */}
                  {menuSections.fastLanes.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.5,
                          delay: 0.2 + index * 0.08,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      >
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={cn(
                            "group relative block py-4 px-8 rounded-2xl transition-all duration-300",
                            "hover:bg-primary/10 hover:pl-12",
                            isActive && "bg-primary/15 pl-12"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <Icon className={cn(
                              "h-6 w-6 transition-colors",
                              isActive ? "text-primary" : "text-cloud-dancer/60 group-hover:text-primary"
                            )} />
                            <span className={cn(
                              "font-display text-4xl md:text-5xl font-light italic transition-colors",
                              isActive ? "text-cloud-dancer" : "text-cloud-dancer/80 group-hover:text-cloud-dancer"
                            )}>
                              {item.label}
                            </span>
                            {item.badge && (
                              <Badge className="ml-4 bg-primary text-primary-foreground rounded-full px-3">
                                {item.badge}
                              </Badge>
                            )}
                          </div>

                          {/* Active indicator line */}
                          {isActive && (
                            <motion.div
                              layoutId="activeMenuLine"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-primary rounded-r-full"
                              transition={{ duration: 0.3 }}
                            />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}

                  {/* Main items without icons */}
                  {menuSections.main.map((item, index) => {
                    const isActive = pathname === item.href;
                    const totalIndex = menuSections.fastLanes.length + index;

                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.5,
                          delay: 0.2 + totalIndex * 0.08,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      >
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={cn(
                            "group relative block py-4 px-8 rounded-2xl transition-all duration-300",
                            "hover:bg-primary/10 hover:pl-12",
                            isActive && "bg-primary/15 pl-12"
                          )}
                        >
                          <span className={cn(
                            "font-display text-4xl md:text-5xl font-light italic transition-colors",
                            isActive ? "text-cloud-dancer" : "text-cloud-dancer/80 group-hover:text-cloud-dancer"
                          )}>
                            {item.label}
                          </span>

                          {/* Active indicator line */}
                          {isActive && (
                            <motion.div
                              layoutId="activeMenuLine"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-primary rounded-r-full"
                              transition={{ duration: 0.3 }}
                            />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>

                {/* Cart CTA if items */}
                {totalItems > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <Link
                      href="/panier"
                      onClick={onClose}
                      className={cn(
                        "flex items-center justify-between p-6 rounded-2xl",
                        "glass-purple border-2 border-primary/30",
                        "hover:border-primary/60 hover:scale-[1.02] transition-all duration-300"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-display text-xl text-cloud-dancer">Mon panier</p>
                          <p className="text-sm text-cloud-dancer/60">{totalItems} article{totalItems > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <Badge className="bg-primary text-primary-foreground text-lg px-4 py-2 rounded-full">
                        {totalItems}
                      </Badge>
                    </Link>
                  </motion.div>
                )}

                {/* Bottom Row - Footer Links & Theme Toggle */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-cloud-dancer/10"
                >
                  {/* Footer Links */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    {menuSections.footer.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className="text-cloud-dancer/60 hover:text-cloud-dancer transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  {/* Theme Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onToggleTheme}
                    className={cn(
                      "rounded-full glass-purple border-cloud-dancer/20",
                      "hover:bg-cloud-dancer/10 text-cloud-dancer"
                    )}
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun className="h-4 w-4 mr-2" />
                        <span>Mode clair</span>
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4 mr-2" />
                        <span>Mode sombre</span>
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
