'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DrawerMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function DrawerMenu({ isOpen, onClose }: DrawerMenuProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/collection', label: 'Collection' },
    { href: '/editions', label: 'Éditions' },
    { href: '/artisans', label: 'Artisans' },
    { href: '/atelier', label: "L'Atelier" },
  ];

  const footerLinks = [
    { href: '/a-propos', label: 'À propos' },
    { href: '/mentions-legales', label: 'Mentions légales' },
    { href: '/cgv', label: 'CGV' },
    { href: '/politique-confidentialite', label: 'Politique de confidentialité' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay (desktop only) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="hidden md:block fixed inset-0 bg-encre/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "fixed inset-y-0 left-0 z-50 bg-encre overflow-y-auto",
              "w-full md:w-96"
            )}
          >
            <div className="h-full p-8 md:p-12 flex flex-col">

              {/* Logo grand format */}
              <div className="mb-16 flex items-center justify-center">
                <Image
                  src="/logo.svg"
                  alt="1885 Manufacture Alfortvillaise"
                  width={180}
                  height={285}
                  className="w-auto h-48 md:h-64"
                  style={{ filter: 'invert(1)' }}
                />
              </div>

              {/* Navigation principale */}
              <nav className="space-y-6 flex-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className={cn(
                      "block font-display text-4xl md:text-5xl font-bold transition-colors",
                      pathname === link.href
                        ? "text-terra"
                        : "text-ivoire hover:text-terra"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Divider */}
              <div className="h-px bg-ivoire-2 my-12" />

              {/* Links secondaires */}
              <nav className="space-y-3">
                {footerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className="block text-sm text-pierre hover:text-ivoire transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Bouton fermeture */}
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="absolute top-6 right-6 text-ivoire hover:text-terra h-12 w-12"
                aria-label="Fermer le menu"
              >
                <X className="w-8 h-8" />
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
