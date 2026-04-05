'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/store/cart';
import type { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface ProduitHeroProps {
  featuredProduct?: Product | null;
}

export function ProduitHero({ featuredProduct }: ProduitHeroProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const addItem = useCart((state) => state.addItem);

  if (!featuredProduct) return null;

  // Get primary image or first image
  const primaryImage = featuredProduct.images?.find((img) => img.isPrimary)?.url ||
    featuredProduct.images?.[0]?.url;

  if (!primaryImage) return null;

  const handleAddToCart = () => {
    addItem(featuredProduct.id, 1);
    toast.success('Produit ajouté au panier');
  };

  return (
    <section ref={ref} className="bg-encre-2 min-h-[80vh]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-center min-h-[80vh]">
          {/* Left: Text */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="py-16 md:py-24 md:pr-12 space-y-8"
          >
            {/* Label */}
            <p className="font-sans font-semibold text-xs text-terra uppercase tracking-wide">
              À la une
            </p>

            {/* Product name */}
            <h2 className="font-display font-bold text-4xl md:text-5xl text-ivoire leading-tight">
              {featuredProduct.name}
            </h2>

            {/* Description */}
            <p className="font-sans text-base text-ivoire/60 leading-relaxed max-w-lg">
              {featuredProduct.description}
            </p>

            {/* Price */}
            <div className="font-display font-bold text-5xl text-terra">
              {(featuredProduct.priceCents / 100).toFixed(2)} €
            </div>

            {/* Buttons */}
            <div className="flex flex-row gap-4">
              <Button
                onClick={handleAddToCart}
                className="bg-terra text-ivoire hover:bg-terra/90 font-semibold"
              >
                Ajouter au panier
              </Button>

              <Link href="/collection">
                <Button
                  variant="outline"
                  className="border-ivoire text-ivoire hover:bg-ivoire/10"
                >
                  Voir toute la collection
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right: Image */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="relative h-[500px] md:h-full min-h-[500px]"
          >
            <Image
              src={primaryImage}
              alt={featuredProduct.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
