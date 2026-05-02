'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductImage } from '@/types/product';

type ImageLightboxProps = {
  images: ProductImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  productName: string;
};

/**
 * ImageLightbox - Lightbox plein écran pour visualiser les images produit
 *
 * Features:
 * - Plein écran avec backdrop blur
 * - Navigation clavier (Esc, flèches)
 * - Navigation avec boutons prev/next
 * - Fermeture sur click backdrop
 * - Animations fluides Framer Motion
 * - Compteur d'images
 * - Responsive mobile & desktop
 */
export function ImageLightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  productName,
}: ImageLightboxProps) {
  // Navigation clavier
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onNavigate('prev');
      } else if (e.key === 'ArrowRight') {
        onNavigate('next');
      }
    },
    [isOpen, onClose, onNavigate]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Bloquer le scroll du body quand la lightbox est ouverte
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

  if (images.length === 0) return null;

  const currentImage = images[currentIndex];
  if (!currentImage) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl"
          onClick={onClose}
        >
          {/* Bouton fermer */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.1 }}
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors"
            aria-label="Fermer la lightbox"
          >
            <X className="w-6 h-6" />
          </motion.button>

          {/* Compteur d'images */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.1 }}
            className="absolute top-4 left-4 z-10 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-medium"
          >
            {currentIndex + 1} / {images.length}
          </motion.div>

          {/* Container image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full h-full max-w-7xl max-h-[90vh] mx-4 flex items-center justify-center"
          >
            <div className="relative w-full h-full">
              <Image
                src={currentImage.url}
                alt={`${productName} - Image ${currentIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                quality={95}
                priority
              />
            </div>
          </motion.div>

          {/* Navigation - Previous */}
          {images.length > 1 && (
            <>
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: 0.15 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate('prev');
                }}
                className={cn(
                  'absolute left-4 top-1/2 -translate-y-1/2 z-10',
                  'p-4 rounded-full bg-white/10 backdrop-blur-md text-white',
                  'hover:bg-white/20 transition-all hover:scale-110',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
                )}
                aria-label="Image précédente"
              >
                <ChevronLeft className="w-8 h-8" />
              </motion.button>

              {/* Navigation - Next */}
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: 0.15 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate('next');
                }}
                className={cn(
                  'absolute right-4 top-1/2 -translate-y-1/2 z-10',
                  'p-4 rounded-full bg-white/10 backdrop-blur-md text-white',
                  'hover:bg-white/20 transition-all hover:scale-110',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
                )}
                aria-label="Image suivante"
              >
                <ChevronRight className="w-8 h-8" />
              </motion.button>
            </>
          )}

          {/* Nom du produit */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.2 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-medium max-w-md text-center truncate"
          >
            {productName}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
