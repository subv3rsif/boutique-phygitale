import { getActiveProducts } from '@/lib/products';
import { getCategoryConfig } from '@/lib/categories';
import { CollectionPageThemed } from '@/components/category/collection-page-themed';
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

  // Filter by 'collection' tag AND showInCollectionPage flag
  const collectionProducts = allProducts.filter(
    (p) => p.tags?.includes('collection') && p.showInCollectionPage
  );

  // Group by themed sub-collections and limit to 3 most recent per category
  const heritageProducts = collectionProducts
    .filter((p) => p.tags?.includes('heritage'))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const graffitiProducts = collectionProducts
    .filter((p) => p.tags?.includes('graffiti'))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const supporterProducts = collectionProducts
    .filter((p) => p.tags?.includes('supporter'))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <CollectionPageThemed
      config={config}
      heritageProducts={heritageProducts}
      graffitiProducts={graffitiProducts}
      supporterProducts={supporterProducts}
    />
  );
}
