'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type Product, formatCurrency } from '@/lib/catalogue';
import { useCart } from '@/store/cart';
import { ShoppingCart, Loader2, Sparkles, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

type ProductCardProps = {
  product: Product;
  index?: number;
};

/**
 * Editorial ProductCard Component - Boutique 1885
 *
 * Aesthetic: Dark editorial gallery meets luxury boutique
 * - Framer Motion orchestrated animations
 * - Magenta accents for CTAs
 * - Large breathing space
 * - Hover micro-interactions
 */
export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const addItem = useCart((state) => state.addItem);

  const isOutOfStock = product.stockQuantity !== undefined && product.stockQuantity === 0;
  const isLowStock = product.stockQuantity !== undefined && product.stockQuantity < 10 && product.stockQuantity > 0;
  const isNew = product.tags?.includes('nouveau') || product.tags?.includes('new');

  const handleAddToCart = async () => {
    setIsAdding(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      addItem(product.id, 1);

      toast.success('Ajouté au panier', {
        description: product.name,
        duration: 2500,
      });
    } catch (error) {
      toast.error('Erreur lors de l\'ajout');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1] as const,
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "group relative flex flex-col h-full overflow-hidden rounded-lg",
        "bg-card border border-border",
        "transition-all duration-300",
        "hover:border-primary/50 hover:card-shadow-lg focus-within:ring-2 focus-within:ring-primary"
      )}
      role="article"
      aria-label={`Produit: ${product.name}`}
    >
      {/* Product Image Section */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
        {/* Skeleton loader */}
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-muted" />
        )}

        {/* Product Image with parallax hover */}
        <motion.div
          animate={{
            scale: isHovered ? 1.08 : 1,
          }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1] as const,
          }}
          className="relative w-full h-full"
        >
          <Image
            src={product.image}
            alt={`Photo du produit ${product.name}`}
            fill
            className={cn(
              "object-cover transition-opacity duration-500",
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onLoad={() => setImageLoaded(true)}
            priority={index < 3}
          />
        </motion.div>

        {/* Gradient Overlay on Hover */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
        />

        {/* New Badge - Top Left */}
        {isNew && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute top-3 left-3"
          >
            <Badge className={cn(
              "bg-primary text-primary-foreground",
              "dark:magenta-glow-sm",
              "font-semibold px-3 py-1 gap-1"
            )}>
              <Sparkles className="w-3 h-3" />
              Nouveau
            </Badge>
          </motion.div>
        )}

        {/* Low Stock Badge - Top Right */}
        {isLowStock && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-destructive text-destructive-foreground font-medium px-3 py-1">
              Plus que {product.stockQuantity}
            </Badge>
          </div>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center"
          >
            <Badge variant="outline" className="text-base px-4 py-2 border-2">
              Rupture de stock
            </Badge>
          </motion.div>
        )}
      </div>

      {/* Product Details Section */}
      <Link href={`/produit/${product.id}`} className="flex-1 p-5 space-y-4 block group-hover:bg-card/80 transition-colors">
        {/* Product Name */}
        <h3 className="font-display text-xl font-bold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Product Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Price & Shipping */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span
              className="font-display text-3xl font-bold text-foreground"
              aria-label={`Prix: ${formatCurrency(product.priceCents)}`}
            >
              {formatCurrency(product.priceCents)}
            </span>
          </div>

          {product.shippingCents > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Package className="w-3.5 h-3.5" />
              <span>+ {formatCurrency(product.shippingCents)} livraison</span>
            </div>
          )}
        </div>
      </Link>

      {/* Add to Cart Button Section */}
      <div className="p-5 pt-0">
        <motion.div
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.1 }}
        >
          <Button
            onClick={handleAddToCart}
            disabled={isAdding || isOutOfStock}
            className={cn(
              "w-full relative overflow-hidden",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "dark:magenta-glow-sm hover:dark:magenta-glow",
              "font-semibold transition-all duration-300",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "focus-magenta"
            )}
            size="lg"
            aria-label={isOutOfStock ? 'Produit en rupture de stock' : `Ajouter ${product.name} au panier`}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isAdding ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Ajout...
                </>
              ) : isOutOfStock ? (
                <>Rupture de stock</>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  Ajouter au panier
                </>
              )}
            </span>

            {/* Shimmer effect on hover */}
            {!isAdding && !isOutOfStock && (
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: isHovered ? '100%' : '-100%' }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
            )}
          </Button>
        </motion.div>
      </div>
    </motion.article>
  );
}

/**
 * Boutique 1885 - Editorial Product Card
 *
 * Aesthetic Features:
 * ✓ Framer Motion orchestrated animations (staggered entry)
 * ✓ Parallax image scale on hover
 * ✓ Magenta glow on CTA (dark mode)
 * ✓ Shimmer effect on button hover
 * ✓ Gradient overlay reveals
 * ✓ 4:5 aspect ratio (portrait, editorial)
 * ✓ Playfair Display for product names
 * ✓ Generous spacing (breathing room)
 *
 * Interactions:
 * ✓ Tap scale feedback
 * ✓ Hover state tracking
 * ✓ Border highlight on hover
 * ✓ Focus ring (magenta)
 * ✓ Loading states
 *
 * Accessibility:
 * ✓ ARIA labels
 * ✓ Semantic HTML
 * ✓ Keyboard navigation
 * ✓ Screen reader support
 */
