// src/app/admin/products/[id]/edit/page.tsx
import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/products';
import { ProductForm } from '@/components/admin/product-form';
import { ImageUpload } from '@/components/admin/image-upload';

export const metadata = {
  title: 'Modifier Produit - Admin',
};

/**
 * Edit Product Page (Server Component)
 * Fetches product and renders image upload + edit form
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

      {/* Image Upload Gallery */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-encre mb-4">
          Images du Produit
        </h2>
        <ImageUpload product={product} />
      </div>

      {/* Product Form (includes stock management) */}
      <ProductForm mode="edit" product={product} />
    </div>
  );
}
