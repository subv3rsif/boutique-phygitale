'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { getAllActiveProducts } from '@/lib/catalogue';
import { BentoProductGrid } from '@/components/product/bento-product-grid';
import { ProductCarousel } from '@/components/product/product-carousel';
import { HeroCinematic } from '@/components/layout/hero-cinematic';
import { BrandStory } from '@/components/sections/brand-story';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, ChevronDown } from 'lucide-react';

export default function HomePage() {
  const products = getAllActiveProducts();
  const newProducts = products.filter((p) => p.tags?.includes('nouveau'));
  const bestSellers = products.filter((p) => p.tags?.includes('best-seller'));

  const [showAllProducts, setShowAllProducts] = useState(false);
  const displayedProducts = showAllProducts ? products : products.slice(0, 7);

  return (
    <>
      {/* Hero Section — Cinematic split layout */}
      <HeroCinematic />

      {/* Brand Story Section */}
      <BrandStory />

      {/* Main Collection */}
      <div className="container max-w-7xl mx-auto py-20 px-4 space-y-32" id="collection">

        {/* ── Nouveautés ── */}
        {newProducts.length > 0 && (
          <section>
            <SectionHeading
              kicker="Dernières créations"
              title="Nouveautés"
              subtitle="Les pièces les plus récentes de la collection municipale"
              className="mb-12"
            />

            {/* Mobile: Carousel */}
            <div className="block lg:hidden">
              <ProductCarousel
                products={newProducts}
                viewAllHref="/#collection"
                viewAllLabel="Toutes les Nouveautés"
                viewAllIcon={Sparkles}
              />
            </div>

            {/* Desktop: Bento Grid */}
            <div className="hidden lg:block">
              <BentoProductGrid products={newProducts} />
            </div>
          </section>
        )}

        {/* ── Best Sellers ── */}
        {bestSellers.length > 0 && (
          <section>
            <SectionHeading
              kicker="Favoris de la communauté"
              title="Best-sellers"
              titleAccent="de la saison"
              className="mb-12"
            />

            {/* Mobile: Carousel */}
            <div className="block lg:hidden">
              <ProductCarousel
                products={bestSellers}
                viewAllHref="/#collection"
                viewAllLabel="Tous les Best-sellers"
                viewAllIcon={TrendingUp}
              />
            </div>

            {/* Desktop: Bento Grid */}
            <div className="hidden lg:block">
              <BentoProductGrid products={bestSellers} />
            </div>
          </section>
        )}

        {/* ── Toute la collection ── */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <SectionHeading
              kicker="Édition limitée"
              title="Toute la"
              titleAccent="Collection"
              align="left"
            />
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="shrink-0"
            >
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-purple text-muted-foreground text-sm font-sans font-medium">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                {products.length} pièce{products.length > 1 ? 's' : ''} disponible{products.length > 1 ? 's' : ''}
              </span>
            </motion.div>
          </div>

          {products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 space-y-4"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Sparkles className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground">
                Bientôt disponible
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Notre collection arrive très prochainement.
              </p>
            </motion.div>
          ) : (
            <>
              {/* Mobile: Carousel */}
              <div className="block lg:hidden">
                <ProductCarousel
                  products={products}
                  viewAllHref="/#collection"
                  viewAllLabel="Toute la Collection"
                  viewAllIcon={Sparkles}
                />
              </div>

              {/* Desktop: Bento Grid */}
              <div className="hidden lg:block">
                <BentoProductGrid products={displayedProducts} />

                {!showAllProducts && products.length > 7 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="flex justify-center mt-12"
                  >
                    <Button
                      onClick={() => setShowAllProducts(true)}
                      size="lg"
                      className="group relative px-8 py-6 rounded-2xl bg-gradient-love text-primary-foreground font-semibold text-lg hover-glow transition-vibrant shadow-vibrant"
                    >
                      <span className="flex items-center gap-3">
                        Charger la suite
                        <ChevronDown className="h-5 w-5 group-hover:translate-y-1 transition-transform" />
                      </span>
                    </Button>
                  </motion.div>
                )}
              </div>
            </>
          )}
        </section>

        {/* ── Bottom CTA ── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-3xl gradient-border-animated shadow-vibrant-lg p-12 text-center"
        >
          <div className="absolute inset-[2px] rounded-[22px] bg-gradient-love-cloud opacity-5 pointer-events-none" />
          <div className="absolute inset-0 grid-lines opacity-20 pointer-events-none rounded-3xl" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <span className="inline-block text-xs tracking-[0.3em] uppercase text-muted-foreground font-sans font-medium">
              Support & Contact
            </span>
            <h3 className="font-display text-3xl md:text-4xl font-light italic text-foreground">
              Une question sur <span className="font-semibold not-italic text-gradient-love">nos produits ?</span>
            </h3>
            <p className="text-muted-foreground text-lg">
              Notre équipe est disponible pour vous renseigner sur la collection et les modalités de retrait.
            </p>
            <a
              href="mailto:contact@ville.fr"
              className="inline-flex items-center gap-2 text-primary hover:underline font-medium text-lg transition-colors group"
            >
              contact@ville.fr
              <svg className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </motion.section>

      </div>
    </>
  );
}
