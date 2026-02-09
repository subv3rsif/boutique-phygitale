'use client';

import { motion } from 'framer-motion';
import { getAllActiveProducts } from '@/lib/catalogue';
import { ProductCardZaraZara } from '@/components/product/product-card-zara';
import { HeroZara } from '@/components/layout/hero-zara';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp } from 'lucide-react';

export default function HomePage() {
  const products = getAllActiveProducts();
  const newProducts = products.filter(p => p.tags?.includes('nouveau'));
  const bestSellers = products.filter(p => p.tags?.includes('best-seller'));

  return (
    <>
      {/* Hero Section - Zara Style */}
      <HeroZara />

      {/* Main Content */}
      <div className="container py-20 px-4 space-y-32" id="collection">

        {/* Nouveautés Section */}
        {newProducts.length > 0 && (
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="mb-10"
            >
              <div className="space-y-3">
                <h2 className="font-display text-4xl md:text-5xl font-light italic text-foreground">
                  Nouveautés
                </h2>
                <p className="text-muted-foreground text-base font-sans font-light max-w-xl">
                  Dernières créations de la collection municipale
                </p>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12">
              {newProducts.map((product, index) => (
                <ProductCardZaraZara key={product.id} product={product} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* Best Sellers Section */}
        {bestSellers.length > 0 && (
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="mb-10"
            >
              <div className="space-y-3">
                <h2 className="font-display text-4xl md:text-5xl font-light italic text-foreground">
                  Best-sellers
                </h2>
                <p className="text-muted-foreground text-base font-sans font-light max-w-xl">
                  Les favoris de la communauté
                </p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {bestSellers.map((product, index) => (
                <ProductCardZara key={product.id} product={product} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* All Products Section */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <div className="space-y-3">
              <h2 className="font-display text-4xl md:text-5xl font-light italic text-foreground">
                Toute la collection
              </h2>
              <div className="flex items-baseline gap-4 text-muted-foreground text-sm font-sans font-light">
                <span>{products.length} pièce{products.length > 1 ? 's' : ''}</span>
                <span className="text-xs tracking-wider uppercase">Édition limitée</span>
              </div>
            </div>
          </motion.div>

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
                Notre collection arrive très prochainement. Revenez bientôt pour découvrir nos créations.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <ProductCardZara key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </section>

        {/* Bottom CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-2xl bg-card border border-border p-12 text-center"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5OTk5OTkiPjxwYXRoIGQ9Ik0zNiAxOGMwLTMuMzE0LTIuNjg2LTYtNi02cy02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNiA2LTIuNjg2IDYtNnptMTggMGMwLTMuMzE0LTIuNjg2LTYtNi02cy02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNiA2LTIuNjg2IDYtNnpNMCAxOGMwLTMuMzE0LTIuNjg2LTYtNi02cy02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNiA2LTIuNjg2IDYtNnptMzYgMzZjMC0zLjMxNC0yLjY4Ni02LTYtNnMtNiAyLjY4Ni02IDYgMi42ODYgNiA2IDYgNi0yLjY4NiA2LTZ6bTE4IDBjMC0zLjMxNC0yLjY4Ni02LTYtNnMtNiAyLjY4Ni02IDYgMi42ODYgNiA2IDYgNi0yLjY4NiA2LTZ6TTAgNTRjMC0zLjMxNC0yLjY4Ni02LTYtNnMtNiAyLjY4Ni02IDYgMi42ODYgNiA2IDYgNi0yLjY4NiA2LTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] [background-size:30px_30px]" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h3 className="font-display text-3xl font-bold text-foreground">
              Une question sur nos produits ?
            </h3>
            <p className="text-muted-foreground text-lg">
              Notre équipe est disponible pour vous renseigner sur la collection et les modalités de retrait.
            </p>
            <a
              href="mailto:contact@ville.fr"
              className="inline-flex items-center gap-2 text-primary hover:underline font-medium text-lg transition-colors"
            >
              contact@ville.fr
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </motion.section>
      </div>
    </>
  );
}
