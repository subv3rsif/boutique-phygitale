'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import type { Product } from '@/types/product';
import { useCart } from '@/store/cart';
import { toast } from 'sonner';

interface GrilleCollectionProps {
  products: Product[];
}

export function GrilleCollection({ products }: GrilleCollectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const addItem = useCart((state) => state.addItem);

  const handleAddToCart = (productId: string, productName: string) => {
    addItem(productId, 1);
    toast.success(`${productName} ajouté au panier`);
  };

  return (
    <section ref={ref} className="bg-ivoire py-24">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-encre">
            Collection
          </h2>

          <Link
            href="/collection"
            className="text-terra font-medium hover:underline inline-flex items-center gap-2"
          >
            Tout voir
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <motion.article
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: index * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group"
            >
              {/* Image section */}
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg mb-4">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.4 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || 'https://via.placeholder.com/400x500'}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </motion.div>

                {/* Category badge top-left */}
                {product.tags && product.tags[0] && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-terra text-ivoire text-xs px-3 py-1 rounded font-semibold uppercase tracking-wider">
                      {product.tags[0]}
                    </span>
                  </div>
                )}

                {/* Location overlay bottom-right */}
                <div className="absolute bottom-3 right-3">
                  <span className="text-ivoire text-[9px] tracking-[0.15em] uppercase bg-encre/70 backdrop-blur-sm px-2 py-1 rounded">
                    Atelier · Alfortville
                  </span>
                </div>
              </div>

              {/* Details section */}
              <div className="border-t border-ivoire-2 pt-4 space-y-2">
                <Link href={`/produit/${product.id}`}>
                  <h3 className="font-display font-semibold text-xl text-foreground group-hover:text-encre transition-colors line-clamp-2 leading-tight">
                    {product.name}
                  </h3>
                </Link>

                <div className="flex justify-between items-center">
                  <span className="font-display font-bold text-2xl text-encre">
                    {(product.priceCents / 100).toFixed(2)} €
                  </span>

                  <button
                    onClick={() => handleAddToCart(product.id, product.name)}
                    className="text-terra text-sm font-medium hover:underline inline-flex items-center gap-1"
                  >
                    Ajouter
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
