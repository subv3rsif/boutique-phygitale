'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getAllActiveProducts } from '@/lib/catalogue';
import { Button } from '@/components/ui/button';

export function EditionsLimitees() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Filter products with edition-limitee tag
  const editions = getAllActiveProducts()
    .filter((p) => p.tags?.includes('edition-limitee'))
    .slice(0, 3);

  if (editions.length === 0) return null;

  return (
    <section ref={ref} className="relative bg-violet min-h-[60vh] py-24 overflow-hidden">
      {/* Decorative orb */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-terra/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-ivoire text-xs tracking-[0.25em] uppercase"
          >
            Éditions
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display font-bold text-4xl md:text-5xl text-ivoire"
          >
            Pièces uniques. En nombre compté.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-ivoire/50 text-sm"
          >
            {editions.length} édition(s) disponible(s) · De 12 à 50 exemplaires
          </motion.p>
        </div>

        {/* Grid - Desktop: 3 cols / Mobile: horizontal scroll */}
        <div className="hidden md:grid md:grid-cols-3 gap-8 mb-12">
          {editions.map((product, index) => (
            <motion.article
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-ivoire/10 backdrop-blur border border-ivoire/20 hover:border-ivoire/40 rounded-lg overflow-hidden transition-all duration-300"
            >
              {/* Image */}
              <div className="relative aspect-[3/4]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />

                {/* Edition badge top-right */}
                {product.editionNumber && product.editionTotal && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-ivoire text-violet text-xs px-3 py-1 rounded font-display font-bold">
                      N° {product.editionNumber}/{product.editionTotal}
                    </span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-5 space-y-3">
                <h3 className="font-display font-semibold text-xl text-ivoire">
                  {product.name}
                </h3>

                <div className="flex justify-between items-center">
                  <span className="font-display font-bold text-2xl text-ivoire">
                    {(product.priceCents / 100).toFixed(2)} €
                  </span>

                  <Link href={`/produit/${product.id}`}>
                    <Button className="bg-terra hover:bg-terra/90 text-ivoire">
                      Découvrir
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 mb-12 scrollbar-hide">
          {editions.map((product, index) => (
            <article
              key={product.id}
              className="flex-shrink-0 w-[280px] snap-center bg-ivoire/10 backdrop-blur border border-ivoire/20 rounded-lg overflow-hidden"
            >
              <div className="relative aspect-[3/4]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="280px"
                />

                {product.editionNumber && product.editionTotal && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-ivoire text-violet text-xs px-3 py-1 rounded font-display font-bold">
                      N° {product.editionNumber}/{product.editionTotal}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5 space-y-3">
                <h3 className="font-display font-semibold text-xl text-ivoire">
                  {product.name}
                </h3>

                <div className="flex justify-between items-center">
                  <span className="font-display font-bold text-2xl text-ivoire">
                    {(product.priceCents / 100).toFixed(2)} €
                  </span>

                  <Link href={`/produit/${product.id}`}>
                    <Button className="bg-terra hover:bg-terra/90 text-ivoire text-sm">
                      Découvrir
                    </Button>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA bottom */}
        <div className="text-center">
          <Link href="/editions">
            <Button
              variant="outline"
              className="border-ivoire text-ivoire hover:bg-ivoire/10"
            >
              Voir les éditions
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
