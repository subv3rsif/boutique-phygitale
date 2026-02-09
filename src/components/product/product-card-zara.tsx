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
 * Zara-style ProductCard Component
 *
 * Aesthetic: Brutal minimal, photographique, hover states subtils
 * - Images en ratio 3:4 (portrait mode)
 * - Texte minimal (nom + prix)
 * - Hover = opacity + CTA slide-in from bottom
 * - Zero radius, zero glow
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
      <Link href={`/produit/${product.id}`} className="block">
        {/* Image container - 3:4 ratio (Zara standard) */}
        <div className="relative aspect-[3/4] overflow-hidden bg-stone-200 dark:bg-purple-900/20">
          {/* Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-stone-300 dark:bg-purple-800/30" />
          )}

          {/* Image - subtle scale on hover */}
          <motion.div
            animate={{
              scale: isHovered ? 1.05 : 1,
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

          {/* Badge NEW - top left, minimal */}
          {isNew && (
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-block bg-primary text-primary-foreground px-3 py-1 text-xs tracking-wider uppercase font-sans font-medium">
                Nouveau
              </span>
            </div>
          )}

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="text-sm tracking-wider uppercase text-foreground/60 font-sans">
                Rupture de stock
              </span>
            </div>
          )}

          {/* Hover CTA - slide from bottom (très Zara) */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{
              y: isHovered && !isOutOfStock ? '0%' : '100%',
              opacity: isHovered && !isOutOfStock ? 1 : 0,
            }}
            transition={{
              duration: 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="absolute bottom-0 inset-x-0 p-4 bg-background/95 backdrop-blur-sm"
          >
            <Button
              onClick={handleAddToCart}
              disabled={isAdding || isOutOfStock}
              className={cn(
                "w-full h-12",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "rounded-none", // Brutal
                "font-sans font-medium tracking-wide uppercase text-xs",
                "transition-brutal",
                "disabled:opacity-50"
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
