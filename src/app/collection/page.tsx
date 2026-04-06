import { getActiveProducts } from '@/lib/products';
import { getCategoryConfig } from '@/lib/categories';
import { CategoryPage } from '@/components/category/category-page';
import type { Metadata } from 'next';

// Force dynamic rendering (database required)
export const dynamic = 'force-dynamic';

const config = getCategoryConfig('collection')!;

export const metadata: Metadata = {
  title: config.metaTitle,
  description: config.metaDescription,
};

export default async function CollectionPage() {
  // Fetch all active products
  const allProducts = await getActiveProducts();

  // Filter by 'collection' tag
  const categoryProducts = allProducts.filter((p) =>
    p.tags?.includes('collection')
  );

  return <CategoryPage config={config} products={categoryProducts} />;
}
