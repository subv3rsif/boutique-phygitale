// src/components/category/collection-page-themed.tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CategoryHeader } from './category-header';
import { BentoProductGrid } from '@/components/product/bento-product-grid';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import type { CategoryConfig } from '@/lib/categories';
import type { Product } from '@/types/product';

type CollectionPageThemedProps = {
  config: CategoryConfig;
  heritageProducts: Product[];
  graffitiProducts: Product[];
  supporterProducts: Product[];
};

/**
 * Collection page with 3 themed sub-collections
 */
export function CollectionPageThemed({
  config,
  heritageProducts,
  graffitiProducts,
  supporterProducts,
}: CollectionPageThemedProps) {
  const hasAnyProducts =
    heritageProducts.length > 0 ||
    graffitiProducts.length > 0 ||
    supporterProducts.length > 0;

  return (
    <div className="min-h-screen">
      {/* Main header */}
      <CategoryHeader title={config.title} description={config.description} />

      <div className="container mx-auto px-4 pb-16 md:pb-24 space-y-24">
        {/* Empty state if no products at all */}
        {!hasAnyProducts && (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
            <p className="text-muted-foreground text-lg max-w-md">
              Nos collections thématiques arrivent bientôt. Revenez découvrir nos créations !
            </p>
          </div>
        )}

        {/* Collection Héritage */}
        {heritageProducts.length > 0 && (
          <section>
            <SectionHeading
              kicker="Patrimoine"
              title="Collection Héritage"
              subtitle="Articles issus de l'histoire d'Alfortville"
              className="mb-12"
            />
            <BentoProductGrid products={heritageProducts} />
            <div className="flex justify-center mt-8">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="group hover:bg-terra hover:text-ivoire hover:border-terra transition-all"
              >
                <Link href="/collection/heritage">
                  Voir toute la collection Héritage
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </section>
        )}

        {/* Collection Graffiti */}
        {graffitiProducts.length > 0 && (
          <section>
            <SectionHeading
              kicker="Street Art"
              title="Collection Graffiti"
              subtitle="Mettant en scène les œuvres de la ville"
              className="mb-12"
            />
            <BentoProductGrid products={graffitiProducts} />
            <div className="flex justify-center mt-8">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="group hover:bg-terra hover:text-ivoire hover:border-terra transition-all"
              >
                <Link href="/collection/graffiti">
                  Voir toute la collection Graffiti
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </section>
        )}

        {/* Collection Supporter */}
        {supporterProducts.length > 0 && (
          <section>
            <SectionHeading
              kicker="Sport"
              title="Collection Supporter"
              subtitle="Accessoires et vêtements aux couleurs des clubs de la ville"
              className="mb-12"
            />
            <BentoProductGrid products={supporterProducts} />
            <div className="flex justify-center mt-8">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="group hover:bg-terra hover:text-ivoire hover:border-terra transition-all"
              >
                <Link href="/collection/supporter">
                  Voir toute la collection Supporter
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
