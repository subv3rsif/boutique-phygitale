import { getActiveProducts } from '@/lib/products';
import { CategoryHeader } from '@/components/category/category-header';
import { ProductGrid } from '@/components/product/product-grid';
import type { Metadata } from 'next';

// Force dynamic rendering (database required)
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Collection Supporter - 1885 Boutique Alfortville',
  description: 'Découvrez tous les accessoires et vêtements aux couleurs des clubs de la ville',
};

export default async function SupporterCollectionPage() {
  // Fetch all active products with 'supporter' tag
  const allProducts = await getActiveProducts();
  const supporterProducts = allProducts.filter((p) =>
    p.tags?.includes('supporter')
  );

  return (
    <div className="min-h-screen">
      <CategoryHeader
        title="Collection Supporter"
        description="Accessoires et vêtements aux couleurs des clubs de la ville"
      />

      <div className="container mx-auto px-4 pb-16 md:pb-24">
        {supporterProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
            <p className="text-muted-foreground text-lg max-w-md">
              Aucun produit dans cette collection pour le moment.
            </p>
          </div>
        ) : (
          <ProductGrid products={supporterProducts} />
        )}
      </div>
    </div>
  );
}
