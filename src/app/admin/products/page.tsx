// src/app/admin/products/page.tsx
import { getAllProducts } from '@/lib/products';
import { ProductList } from '@/components/admin/product-list';

export const metadata = {
  title: 'Catalogue Produits - Admin',
};

// Force dynamic rendering (no pre-render at build time)
// This prevents build errors when DATABASE_URL is not available during build
export const dynamic = 'force-dynamic';

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
