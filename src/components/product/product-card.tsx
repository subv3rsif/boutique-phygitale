'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Product, formatCurrency } from '@/lib/catalogue';
import { useCart } from '@/store/cart';
import { ShoppingCart, Loader2, Package } from 'lucide-react';

type ProductCardProps = {
  product: Product;
};

/**
 * Enhanced ProductCard Component
 *
 * Modern e-commerce card with:
 * - Smooth hover animations (image scale + shadow elevation)
 * - Shipping badge overlay on product image
 * - Skeleton loading state
 * - Click animation feedback
 * - Full accessibility support
 * - Responsive design (mobile-first)
 *
 * Usage:
 * <ProductCard product={productFromCatalogue} />
 */
export function ProductCard({ product }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const addItem = useCart((state) => state.addItem);

  const isOutOfStock = product.stockQuantity !== undefined && product.stockQuantity === 0;
  const isLowStock = product.stockQuantity !== undefined && product.stockQuantity < 10 && product.stockQuantity > 0;

  const handleAddToCart = async () => {
    setIsAdding(true);

    try {
      // Small delay for UX feedback
      await new Promise((resolve) => setTimeout(resolve, 300));

      addItem(product.id, 1);

      toast.success('Produit ajouté au panier', {
        description: product.name,
        duration: 3000,
      });
    } catch (error) {
      toast.error('Erreur lors de l\'ajout au panier');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card
      className="group flex flex-col h-full overflow-hidden border border-slate-200 transition-all duration-300 hover:shadow-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
      role="article"
      aria-label={`Produit: ${product.name}`}
    >
      {/* Product Image Section */}
      <CardHeader className="p-0">
        <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
          {/* Skeleton loader */}
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-slate-200" />
          )}

          {/* Product Image with hover scale animation */}
          <Image
            src={product.image}
            alt={`Photo du produit ${product.name}`}
            fill
            className={`object-cover transition-all duration-500 ease-out group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onLoad={() => setImageLoaded(true)}
            priority={false}
          />

          {/* Shipping Badge Overlay - Bottom Left */}
          {product.shippingCents > 0 && (
            <div className="absolute bottom-2 left-2">
              <Badge
                variant="secondary"
                className="bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-700 shadow-sm font-medium px-2.5 py-1"
              >
                <Package className="w-3 h-3 mr-1 inline" aria-hidden="true" />
                Livraison +{formatCurrency(product.shippingCents)}
              </Badge>
            </div>
          )}

          {/* Low Stock Badge - Top Right */}
          {isLowStock && (
            <div className="absolute top-2 right-2">
              <Badge
                variant="destructive"
                className="bg-red-600 text-white shadow-sm font-medium px-2.5 py-1"
              >
                Plus que {product.stockQuantity}
              </Badge>
            </div>
          )}

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
              <Badge
                variant="destructive"
                className="bg-slate-800 text-white text-lg px-4 py-2"
              >
                Rupture de stock
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      {/* Product Details Section */}
      <CardContent className="flex-1 p-4 sm:p-6">
        {/* Product Name - 2 lines max with ellipsis */}
        <CardTitle className="mb-2 text-lg sm:text-xl font-bold text-slate-900 line-clamp-2 leading-tight">
          {product.name}
        </CardTitle>

        {/* Product Description - 3 lines max */}
        <CardDescription className="mb-4 text-sm sm:text-base text-slate-600 line-clamp-3">
          {product.description}
        </CardDescription>

        {/* Price - Large and prominent */}
        <div className="flex items-baseline gap-2 mb-2">
          <span
            className="text-2xl sm:text-3xl font-bold text-blue-600"
            aria-label={`Prix: ${formatCurrency(product.priceCents)}`}
          >
            {formatCurrency(product.priceCents)}
          </span>
        </div>

        {/* Product Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3" aria-label="Catégories du produit">
            {product.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs text-slate-600 border-slate-300"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      {/* Add to Cart Button Section */}
      <CardFooter className="p-4 sm:p-6 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={isAdding || isOutOfStock}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          size="lg"
          aria-label={isOutOfStock ? 'Produit en rupture de stock' : `Ajouter ${product.name} au panier`}
        >
          {isAdding ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
              Ajout en cours...
            </>
          ) : isOutOfStock ? (
            <>Rupture de stock</>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-5 w-5" aria-hidden="true" />
              Ajouter au panier
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * Accessibility Checklist:
 * ✓ ARIA labels on card and interactive elements
 * ✓ Semantic HTML (article role for card)
 * ✓ Keyboard navigation support (focus-within ring)
 * ✓ Focus indicators (ring-2 ring-blue-500)
 * ✓ Descriptive alt text for images
 * ✓ Disabled state clearly communicated
 * ✓ Loading state with spinner icon
 *
 * Performance Optimizations:
 * ✓ Next.js Image component with optimized sizes
 * ✓ Skeleton loader during image load
 * ✓ CSS transitions (GPU-accelerated)
 * ✓ Priority false for below-fold images
 * ✓ Lazy loading by default
 *
 * Responsive Design:
 * ✓ Mobile-first approach
 * ✓ Touch-friendly targets (min 44px height on buttons)
 * ✓ Responsive spacing (p-4 sm:p-6)
 * ✓ Responsive text sizing (text-lg sm:text-xl)
 * ✓ aspect-square for consistent grid layout
 */
