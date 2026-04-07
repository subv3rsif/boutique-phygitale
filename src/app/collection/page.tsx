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

  // Filter by 'collection' tag to get all collection products
  const collectionProducts = allProducts.filter((p) =>
    p.tags?.includes('collection')
  );

  // Group by themed sub-collections
  const heritageProducts = collectionProducts.filter((p) =>
    p.tags?.includes('heritage')
  );
  const graffitiProducts = collectionProducts.filter((p) =>
    p.tags?.includes('graffiti')
  );
  const supporterProducts = collectionProducts.filter((p) =>
    p.tags?.includes('supporter')
  );

  return (
    <CollectionPageThemed
      config={config}
      heritageProducts={heritageProducts}
      graffitiProducts={graffitiProducts}
      supporterProducts={supporterProducts}
    />
  );
}
