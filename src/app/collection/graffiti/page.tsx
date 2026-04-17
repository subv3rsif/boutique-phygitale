import { getActiveProducts } from '@/lib/products';
import { CategoryHeader } from '@/components/category/category-header';
import { ProductGrid } from '@/components/product/product-grid';
import type { Metadata } from 'next';

// Force dynamic rendering (database required)
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Collection Graffiti - 1885 Boutique Alfortville',
  description: 'Découvrez tous les articles mettant en scène les œuvres de street art de la ville',
};

export default async function GraffitiCollectionPage() {
  // Fetch all active products with 'graffiti' tag
  const allProducts = await getActiveProducts();
  const graffitiProducts = allProducts.filter((p) =>
    p.tags?.includes('graffiti')
  );

  return (
    <div className="min-h-screen">
      <CategoryHeader
        title="Collection Graffiti"
        description="Mettant en scène les œuvres de la ville"
      />

      <div className="container mx-auto px-4 pb-16 md:pb-24">
        {graffitiProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
            <p className="text-muted-foreground text-lg max-w-md">
              Aucun produit dans cette collection pour le moment.
            </p>
          </div>
        ) : (
          <ProductGrid products={graffitiProducts} />
        )}
      </div>
    </div>
  );
}
