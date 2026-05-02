'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductImageCarousel } from '@/components/product/product-image-carousel';
import { formatCurrency } from '@/lib/catalogue';
import { useCart } from '@/store/cart';
import { ShoppingCart, Loader2 } from 'lucide-react';
import type { Product } from '@/types/product';

type ProductGridProps = {
  products: Product[];
};

/**
 * Simple product card for DB products
 */
function SimpleProductCard({ product }: { product: Product }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const addItem = useCart((state) => state.addItem);

  const isOutOfStock = product.stockQuantity === 0;

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      addItem(product.id, 1);
      toast.success('Ajouté au panier', {
        description: product.name,
        duration: 2500,
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div
      className="group relative bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Carousel */}
      <Link href={`/produit/${product.id}`} className="block relative aspect-[3/4] overflow-hidden bg-muted">
        <motion.div
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <ProductImageCarousel
            images={product.images}
            productName={product.name}
            variant="card"
            priority={false}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        </motion.div>
        {/* Badges */}
        {product.badges && product.badges.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.badges.slice(0, 2).map((badge, i) => (
              <Badge key={i} variant="secondary" className="bg-encre/90 text-ivoire border-none">
                {badge}
              </Badge>
            ))}
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-encre/60 flex items-center justify-center">
            <Badge variant="secondary" className="bg-red-600 text-white">
              Rupture de stock
            </Badge>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 space-y-3">
        <Link href={`/produit/${product.id}`} className="block">
          <h3 className="font-display font-semibold text-encre line-clamp-2 group-hover:text-terra transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline justify-between">
          <p className="text-xl font-semibold text-terra">
            {formatCurrency(product.priceCents)}
          </p>
          {product.shippingCents > 0 && (
            <p className="text-xs text-pierre">
              + {formatCurrency(product.shippingCents)} fdp
            </p>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={isAdding || isOutOfStock}
          className="w-full bg-encre hover:bg-encre-2 text-ivoire"
          size="sm"
        >
          {isAdding ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Ajout...
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Ajouter au panier
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

/**
 * Simple responsive product grid
 * Displays products in a 2-4 column grid with fade-in animation
 */
export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: index * 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <SimpleProductCard product={product} />
        </motion.div>
      ))}
    </div>
  );
}
