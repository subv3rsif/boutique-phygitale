import { getActiveProducts } from '@/lib/products';
import { getCategoryConfig } from '@/lib/categories';
import { CategoryPage } from '@/components/category/category-page';
import type { Metadata } from 'next';

// Force dynamic rendering (database required)
export const dynamic = 'force-dynamic';

const config = getCategoryConfig('atelier')!;

export const metadata: Metadata = {
  title: config.metaTitle,
  description: config.metaDescription,
};

export default async function AtelierPage() {
  // Fetch all active products
  const allProducts = await getActiveProducts();

  // Filter by 'atelier' tag
  const categoryProducts = allProducts.filter((p) =>
    p.tags?.includes('atelier')
  );

  return <CategoryPage config={config} products={categoryProducts} />;
}
