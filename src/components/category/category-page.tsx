'use client';

import { CategoryHeader } from './category-header';
import { CategoryEmpty } from './category-empty';
import { BentoProductGrid } from '@/components/product/bento-product-grid';
import type { CategoryConfig } from '@/lib/categories';
import type { Product } from '@/lib/catalogue';

type CategoryPageProps = {
  config: CategoryConfig;
  products: Product[];
};

export function CategoryPage({ config, products }: CategoryPageProps) {
  return (
    <div className="min-h-screen">
      {/* Header with title and description */}
      <CategoryHeader title={config.title} description={config.description} />

      {/* Products or empty state */}
      <div className="container mx-auto px-4 pb-16 md:pb-24">
        {products.length === 0 ? (
          <CategoryEmpty categoryName={config.title} />
        ) : (
          <BentoProductGrid products={products} />
        )}
      </div>
    </div>
  );
}
