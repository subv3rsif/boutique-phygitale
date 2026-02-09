'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCardZara } from './product-card-zara';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { type Product } from '@/lib/catalogue';
import { cn } from '@/lib/utils';

type ProductCarouselProps = {
  products: Product[];
  viewAllHref: string;
  viewAllLabel: string;
  viewAllIcon?: typeof Sparkles;
};

export function ProductCarousel({
  products,
  viewAllHref,
  viewAllLabel,
  viewAllIcon: Icon = Sparkles
}: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Limit to 3 products + "View All" card
  const displayProducts = products.slice(0, 3);
  const totalSlides = displayProducts.length + 1; // +1 for "View All" card

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    const newIndex = currentIndex + newDirection;
    if (newIndex >= 0 && newIndex < totalSlides) {
      setCurrentIndex(newIndex);
    }
  };

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div className="relative overflow-hidden">
        <motion.div
          className="flex"
          animate={{ x: `-${currentIndex * 100}%` }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
        >
          {/* Product Cards */}
          {displayProducts.map((product, index) => (
            <motion.div
              key={product.id}
              className="min-w-full px-2"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);

                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
            >
              <ProductCardZara product={product} index={index} />
            </motion.div>
          ))}

          {/* "View All" Card */}
          <motion.div
            className="min-w-full px-2"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
          >
            <Link href={viewAllHref}>
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden gradient-border-animated shadow-vibrant hover-glow transition-vibrant cursor-pointer max-w-sm mx-auto">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-love-vibrant animate-gradient" />

                {/* Content */}
                <div className="relative h-full flex flex-col items-center justify-center text-center p-8 glass-love">
                  <div className="mb-6">
                    <Icon className="h-16 w-16 text-cloud-dancer mx-auto mb-4" />
                  </div>

                  <h3 className="font-display text-3xl font-semibold text-cloud-dancer mb-2">
                    {viewAllLabel}
                  </h3>

                  <p className="text-cloud-dancer/80 text-sm mb-6">
                    Découvrir toute la sélection
                  </p>

                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cloud-dancer text-primary font-semibold shimmer">
                    <span>Voir tout</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>

                {/* Shimmer overlay */}
                <div className="absolute inset-0 shimmer-auto pointer-events-none" />
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              currentIndex === index
                ? "w-8 bg-gradient-love"
                : "w-2 bg-border hover:bg-primary/30"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Swipe Indicator */}
      <div className="text-center mt-4">
        <p className="text-xs text-muted-foreground">
          Swipez pour voir plus
        </p>
      </div>
    </div>
  );
}
