import { getActiveProducts } from '@/lib/products';
import { getCategoryConfig } from '@/lib/categories';
import { CategoryPage } from '@/components/category/category-page';
import type { Metadata } from 'next';

const config = getCategoryConfig('editions')!;

export const metadata: Metadata = {
  title: config.metaTitle,
  description: config.metaDescription,
};

export default async function EditionsPage() {
  // Fetch all active products
  const allProducts = await getActiveProducts();

  // Filter by 'editions' tag
  const categoryProducts = allProducts.filter((p) =>
    p.tags?.includes('editions')
  );

  return <CategoryPage config={config} products={categoryProducts} />;
}
