'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { type Product, formatCurrency } from '@/lib/catalogue';
import { useCart } from '@/store/cart';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ProductCardZaraProps = {
  product: Product;
  index?: number;
};

/**
 * Premium Glassmorphism ProductCard Component
 *
 * Aesthetic: Luxury minimal with liquid glass effects
 * - Images en ratio 3:4 (portrait mode)
 * - Premium shadows & glassmorphism
 * - Hover = subtle lift + glass glow
 * - Rounded corners with glass borders
 */
export function ProductCardZara({ product, index = 0 }: ProductCardZaraProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const addItem = useCart((state) => state.addItem);

  const isOutOfStock = product.stockQuantity !== undefined && product.stockQuantity === 0;
  const isNew = product.tags?.includes('nouveau') || product.tags?.includes('new');

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Don't navigate to product page
    e.stopPropagation();

    setIsAdding(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      addItem(product.id, 1);
      toast.success('Ajouté au panier', {
        description: product.name,
        duration: 2000,
      });
    } catch (error) {
      toast.error('Erreur');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative"
    >
      <Link href={`/produit/${product.id}`} className="block max-w-sm mx-auto w-full">
        {/* Image container - 4:5 ratio (plus large) with premium glass effect */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-stone-100 dark:bg-purple-900/30 glass-border shadow-premium group-hover:shadow-premium-purple transition-all duration-500">
          {/* Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-stone-300 dark:bg-purple-800/30" />
          )}

          {/* Image - subtle scale + lift on hover */}
          <motion.div
            animate={{
              scale: isHovered ? 1.08 : 1,
              y: isHovered ? -4 : 0,
            }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative w-full h-full"
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              className={cn(
                "object-cover transition-opacity duration-500",
                imageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onLoad={() => setImageLoaded(true)}
              priority={index < 4}
            />
          </motion.div>

          {/* Badge NEW - glassmorphism style */}
          {isNew && (
            <div className="absolute top-4 left-4 z-10">
              <span className="inline-block glass-purple text-primary px-4 py-1.5 rounded-full text-xs tracking-wider uppercase font-sans font-semibold shadow-premium-sm backdrop-blur-md">
                Nouveau
              </span>
            </div>
          )}

          {/* Out of stock overlay - glassmorphism */}
          {isOutOfStock && (
            <div className="absolute inset-0 glass dark:glass-dark flex items-center justify-center rounded-2xl">
              <span className="text-sm tracking-wider uppercase text-foreground/70 font-sans font-semibold px-6 py-2 rounded-full bg-background/50 backdrop-blur-sm">
                Rupture de stock
              </span>
            </div>
          )}

          {/* Hover CTA - glassmorphism slide from bottom */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{
              y: isHovered && !isOutOfStock ? '0%' : '100%',
              opacity: isHovered && !isOutOfStock ? 1 : 0,
            }}
            transition={{
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="absolute bottom-0 inset-x-0 p-5 glass dark:glass-dark rounded-b-2xl"
          >
            <Button
              onClick={handleAddToCart}
              disabled={isAdding || isOutOfStock}
              className={cn(
                "w-full h-12",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "rounded-xl shadow-premium-purple", // Premium rounded
                "font-sans font-semibold tracking-wide uppercase text-xs",
                "transition-luxury",
                "disabled:opacity-50",
                "hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Ajouter au panier'
              )}
            </Button>
          </motion.div>
        </div>

        {/* Product info - Minimal */}
        <div className="pt-4 space-y-2">
          {/* Name - single line, overflow hidden */}
          <h3 className="font-display text-lg font-normal text-foreground truncate group-hover:text-primary transition-colors duration-300">
            {product.name}
          </h3>

          {/* Price - bold, prominent */}
          <div className="flex items-baseline gap-2">
            <span className="font-sans text-base font-semibold text-foreground">
              {formatCurrency(product.priceCents)}
            </span>
            {product.shippingCents > 0 && (
              <span className="text-xs text-muted-foreground font-sans font-light">
                + {formatCurrency(product.shippingCents)} livraison
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
