import { getActiveProducts } from '@/lib/products';
import { CategoryHeader } from '@/components/category/category-header';
import { ProductGrid } from '@/components/product/product-grid';
import type { Metadata } from 'next';

// Force dynamic rendering (database required)
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Collection Héritage - 1885 Boutique Alfortville',
  description: 'Découvrez tous les articles issus de l\'histoire d\'Alfortville',
};

export default async function HeritageCollectionPage() {
  // Fetch all active products with 'heritage' tag
  const allProducts = await getActiveProducts();
  const heritageProducts = allProducts.filter((p) =>
    p.tags?.includes('heritage')
  );

  return (
    <div className="min-h-screen">
      <CategoryHeader
        title="Collection Héritage"
        description="Articles issus de l'histoire d'Alfortville"
      />

      <div className="container mx-auto px-4 pb-16 md:pb-24">
        {heritageProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
            <p className="text-muted-foreground text-lg max-w-md">
              Aucun produit dans cette collection pour le moment.
            </p>
          </div>
        ) : (
          <ProductGrid products={heritageProducts} />
        )}
      </div>
    </div>
  );
}
