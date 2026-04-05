// src/app/admin/products/page.tsx
import { getAllProducts } from '@/lib/products';
import { ProductList } from '@/components/admin/product-list';

export const metadata = {
  title: 'Catalogue Produits - Admin',
};

/**
 * Admin Products List Page (Server Component)
 * Fetches all products and passes to client component
 */
export default async function AdminProductsPage() {
  // Fetch all products (including inactive)
  const products = await getAllProducts();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-encre">
          Gestion des Produits
        </h1>
        <p className="text-pierre mt-2">
          Gérez votre catalogue de produits : créer, modifier, supprimer.
        </p>
      </div>

      {/* Product List Component */}
      <ProductList initialProducts={products} />
    </div>
  );
}
