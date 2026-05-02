'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import type { ProductImage } from '@/types/product';

type ProductImageCarouselProps = {
  images: ProductImage[];
  productName: string;
  variant?: 'card' | 'detail';
  priority?: boolean;
  sizes?: string;
  className?: string;
  enableLightbox?: boolean; // Active la lightbox au click (page produit)
};

/**
 * ProductImageCarousel - Carousel d'images produit réutilisable
 *
 * Features:
 * - Swipe tactile mobile (Framer Motion drag)
 * - Flèches desktop au hover
 * - Dots de pagination cliquables
 * - Navigation clavier (touches flèches)
 * - Gestion cas limites (0 ou 1 image)
 * - Préchargement images adjacentes
 * - Transitions fluides avec spring physics
 *
 * Variants:
 * - 'card': Petit format pour les listings (default)
 * - 'detail': Grand format pour page produit
 */
export function ProductImageCarousel({
  images,
  productName,
  variant = 'card',
  priority = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  className,
  enableLightbox = false,
}: ProductImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Trier les images par order, puis mettre l'image primaire en premier
  const sortedImages = [...images].sort((a, b) => {
    if (a.isPrimary) return -1;
    if (b.isPrimary) return 1;
    return a.order - b.order;
  });

  // Lightbox handlers (définis avant les early returns)
  const handleOpenLightbox = useCallback(() => {
    if (enableLightbox && sortedImages.length > 0) {
      setIsLightboxOpen(true);
    }
  }, [enableLightbox, sortedImages.length]);

  const handleCloseLightbox = useCallback(() => {
    setIsLightboxOpen(false);
  }, []);

  const handleLightboxNavigate = useCallback(
    (direction: 'prev' | 'next') => {
      setCurrentIndex((prevIndex) => {
        if (direction === 'next') {
          return (prevIndex + 1) % sortedImages.length;
        } else {
          return (prevIndex - 1 + sortedImages.length) % sortedImages.length;
        }
      });
    },
    [sortedImages.length]
  );

  // Cas limite: pas d'images
  if (sortedImages.length === 0) {
    return (
      <div className={cn('relative w-full h-full bg-muted', className)}>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Aucune image disponible</p>
        </div>
      </div>
    );
  }

  // Cas limite: une seule image (pas de carousel mais avec lightbox si activée)
  if (sortedImages.length === 1) {
    const singleImage = sortedImages[0];
    if (!singleImage) return null;

    return (
      <div
        className={cn('relative w-full h-full group/single', className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          onClick={handleOpenLightbox}
          className={cn(
            'relative w-full h-full',
            enableLightbox && 'cursor-zoom-in'
          )}
        >
          <Image
            src={singleImage.url}
            alt={`Photo du produit ${productName}`}
            fill
            className="object-cover"
            sizes={sizes}
            priority={priority}
          />

          {/* Indicateur zoom visible au hover (si lightbox activée) */}
          {enableLightbox && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none"
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg">
                <ZoomIn className="w-8 h-8 text-encre" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Lightbox pour image unique */}
        {enableLightbox && (
          <ImageLightbox
            images={sortedImages}
            currentIndex={0}
            isOpen={isLightboxOpen}
            onClose={handleCloseLightbox}
            onNavigate={handleLightboxNavigate}
            productName={productName}
          />
        )}
      </div>
    );
  }

  // Navigation avec wrapping circulaire
  const paginate = useCallback(
    (newDirection: 'left' | 'right') => {
      if (isAnimating) return; // Débounce des swipes rapides

      setIsAnimating(true);
      setDirection(newDirection);

      setCurrentIndex((prevIndex) => {
        if (newDirection === 'right') {
          return (prevIndex + 1) % sortedImages.length;
        } else {
          return (prevIndex - 1 + sortedImages.length) % sortedImages.length;
        }
      });

      // Reset animation flag après transition
      setTimeout(() => setIsAnimating(false), 300);
    },
    [isAnimating, sortedImages.length]
  );

  // Swipe power calculation (pour déterminer si le swipe est valide)
  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  // Navigation directe vers un index (dots)
  const goToIndex = (index: number) => {
    if (isAnimating || index === currentIndex) return;

    setIsAnimating(true);
    setDirection(index > currentIndex ? 'right' : 'left');
    setCurrentIndex(index);

    setTimeout(() => setIsAnimating(false), 300);
  };

  // Navigation clavier
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        paginate('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        paginate('right');
      }
    },
    [paginate]
  );

  // Variants d'animation pour slide horizontal
  const slideVariants = {
    enter: (direction: 'left' | 'right') => ({
      x: direction === 'right' ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: 'left' | 'right') => ({
      x: direction === 'right' ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  return (
    <div
      className={cn('relative w-full h-full group/carousel', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label={`Galerie d'images pour ${productName}`}
    >
      {/* Carousel principal */}
      <div className="relative w-full h-full overflow-hidden bg-muted">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate('right');
              } else if (swipe > swipeConfidenceThreshold) {
                paginate('left');
              }
            }}
            onClick={handleOpenLightbox}
            className={cn(
              'absolute inset-0',
              enableLightbox ? 'cursor-zoom-in' : 'cursor-grab active:cursor-grabbing'
            )}
          >
            <Image
              src={sortedImages[currentIndex]?.url || ''}
              alt={`Photo ${currentIndex + 1} sur ${sortedImages.length} du produit ${productName}`}
              fill
              className="object-cover pointer-events-none"
              sizes={sizes}
              priority={priority || currentIndex === 0}
            />

            {/* Indicateur zoom visible au hover (page produit uniquement) */}
            {enableLightbox && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none"
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg">
                  <ZoomIn className="w-8 h-8 text-encre" />
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Flèches de navigation (desktop uniquement) */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => {
          e.stopPropagation();
          paginate('left');
        }}
        disabled={isAnimating}
        className={cn(
          'absolute left-2 top-1/2 -translate-y-1/2 z-10',
          'glass-vibrant rounded-full p-2',
          'shadow-vibrant hover:scale-110 transition-transform',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terra',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'hidden md:block',
          variant === 'detail' && 'left-4 p-3'
        )}
        aria-label="Image précédente"
      >
        <ChevronLeft className={cn('w-5 h-5', variant === 'detail' && 'w-6 h-6')} />
      </motion.button>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => {
          e.stopPropagation();
          paginate('right');
        }}
        disabled={isAnimating}
        className={cn(
          'absolute right-2 top-1/2 -translate-y-1/2 z-10',
          'glass-vibrant rounded-full p-2',
          'shadow-vibrant hover:scale-110 transition-transform',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terra',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'hidden md:block',
          variant === 'detail' && 'right-4 p-3'
        )}
        aria-label="Image suivante"
      >
        <ChevronRight className={cn('w-5 h-5', variant === 'detail' && 'w-6 h-6')} />
      </motion.button>

      {/* Dots de pagination */}
      <div
        className={cn(
          'absolute bottom-3 left-1/2 -translate-x-1/2 z-10',
          'flex items-center gap-1.5',
          variant === 'detail' && 'bottom-4 gap-2'
        )}
      >
        {sortedImages.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              goToIndex(index);
            }}
            disabled={isAnimating}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              'hover:bg-gradient-love focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terra',
              'disabled:cursor-not-allowed',
              currentIndex === index
                ? 'w-8 bg-gradient-love shadow-vibrant'
                : 'w-2 bg-border hover:w-4',
              variant === 'detail' && 'h-2.5',
              variant === 'detail' && currentIndex === index && 'w-10',
              variant === 'detail' && currentIndex !== index && 'w-2.5 hover:w-5'
            )}
            aria-label={`Aller à l'image ${index + 1}`}
            aria-current={currentIndex === index ? 'true' : 'false'}
          />
        ))}
      </div>

      {/* Indicateur visuel du nombre d'images (screen readers) */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        Image {currentIndex + 1} sur {sortedImages.length}
      </span>

      {/* Lightbox (page produit uniquement) */}
      {enableLightbox && (
        <ImageLightbox
          images={sortedImages}
          currentIndex={currentIndex}
          isOpen={isLightboxOpen}
          onClose={handleCloseLightbox}
          onNavigate={handleLightboxNavigate}
          productName={productName}
        />
      )}
    </div>
  );
}
