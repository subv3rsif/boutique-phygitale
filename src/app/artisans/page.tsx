import { getActiveProducts } from '@/lib/products';
import { getCategoryConfig } from '@/lib/categories';
import { CategoryPage } from '@/components/category/category-page';
import type { Metadata } from 'next';

const config = getCategoryConfig('artisans')!;

export const metadata: Metadata = {
  title: config.metaTitle,
  description: config.metaDescription,
};

export default async function ArtisansPage() {
  // Fetch all active products
  const allProducts = await getActiveProducts();

  // Filter by 'artisans' tag
  const categoryProducts = allProducts.filter((p) =>
    p.tags?.includes('artisans')
  );

  return <CategoryPage config={config} products={categoryProducts} />;
}
