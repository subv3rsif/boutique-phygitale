'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { getAllActiveProducts } from '@/lib/catalogue';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { GoldDivider, GoldDividerText } from '@/components/ui/gold-divider';
import { ChampagneCTA } from '@/components/ui/champagne-cta';
import { Sparkles, TrendingUp, ChevronDown, Mail } from 'lucide-react';

// ──────────────────────────────────────────────────────────
// Dynamic Imports for Heavy Components
// ──────────────────────────────────────────────────────────

// Hero with animations (client-only, above the fold)
const HeroCinematic = dynamic(
  () => import('@/components/layout/hero-cinematic').then(m => ({ default: m.HeroCinematic })),
  {
    ssr: false, // Animations are client-only
    loading: () => (
      <div className="h-screen bg-gradient-to-br from-primary/10 to-background animate-pulse" />
    ),
  }
);

// Brand Story section
const BrandStory = dynamic(
  () => import('@/components/sections/brand-story').then(m => ({ default: m.BrandStory })),
  {
    loading: () => (
      <div className="h-96 bg-muted/30 animate-pulse rounded-3xl" />
    ),
  }
);

// Bento Product Grid (heavy with animated borders)
const BentoProductGrid = dynamic(
  () => import('@/components/product/bento-product-grid').then(m => ({ default: m.BentoProductGrid })),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[600px]">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-muted/30 animate-pulse rounded-xl" />
        ))}
      </div>
    ),
  }
);

// Product Carousel (heavy with Framer Motion)
const ProductCarousel = dynamic(
  () => import('@/components/product/product-carousel').then(m => ({ default: m.ProductCarousel })),
  {
    loading: () => (
      <div className="h-96 bg-muted/30 animate-pulse rounded-xl" />
    ),
  }
);

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

      {/* Champagne divider after hero */}
      <GoldDivider variant="diamond" spacing="xl" />

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

        {/* Divider between sections */}
        {newProducts.length > 0 && bestSellers.length > 0 && (
          <GoldDividerText text="Best-sellers" spacing="lg" />
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

        {/* Divider before bottom CTA */}
        <GoldDivider variant="diamond" spacing="xl" />

        {/* ── Bottom CTA — Premium Contact Section ── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-3xl champagne-border-animated shadow-champagne-lg p-12 text-center"
        >
          {/* Background orb */}
          <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-gradient-champagne opacity-5 blur-3xl" />
          <div className="absolute inset-[2px] rounded-[22px] bg-gradient-cloud-champagne opacity-30 pointer-events-none" />
          <div className="absolute inset-0 grid-lines opacity-20 pointer-events-none rounded-3xl" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="inline-block text-xs tracking-[0.3em] uppercase text-champagne-dark font-sans font-semibold">
              Support & Contact
            </span>
            <h3 className="font-display text-3xl md:text-4xl font-light italic text-foreground">
              Une question sur <span className="font-semibold not-italic text-gradient-love-champagne">nos produits ?</span>
            </h3>
            <p className="text-slate text-lg">
              Notre équipe est disponible pour vous renseigner sur la collection et les modalités de retrait.
            </p>

            {/* Champagne CTA */}
            <div className="pt-4">
              <ChampagneCTA
                size="lg"
                icon={<Mail className="h-5 w-5" />}
                iconPosition="left"
                onClick={() => window.location.href = 'mailto:contact@ville.fr'}
              >
                contact@ville.fr
              </ChampagneCTA>
            </div>
          </div>
        </motion.section>

      </div>
    </>
  );
}
