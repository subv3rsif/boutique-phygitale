// src/app/admin/products/[id]/edit/page.tsx
import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/products';
import { ProductForm } from '@/components/admin/product-form';

export const metadata = {
  title: 'Modifier Produit - Admin',
};

/**
 * Edit Product Page (Server Component)
 * Fetches product and renders edit form
 */
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await params (Next.js 15 requirement)
  const { id } = await params;

  // Fetch product
  const product = await getProductById(id);

  // Product not found
  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-encre">
          Modifier le Produit
        </h1>
        <p className="text-pierre mt-2">
          Modifiez les informations de <strong>{product.name}</strong>.
        </p>
      </div>

      {/* Product Form */}
      <ProductForm mode="edit" product={product} />
    </div>
  );
}
