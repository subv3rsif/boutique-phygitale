// src/app/admin/products/new/page.tsx
import { ProductForm } from '@/components/admin/product-form';

export const metadata = {
  title: 'Nouveau Produit - Admin',
};

/**
 * New Product Page
 * Create a new product in the catalog
 */
export default function NewProductPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-encre">
          Nouveau Produit
        </h1>
        <p className="text-pierre mt-2">
          Ajoutez un nouveau produit au catalogue de la boutique.
        </p>
      </div>

      {/* Product Form */}
      <ProductForm mode="create" />
    </div>
  );
}
