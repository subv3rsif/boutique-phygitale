import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/products';
import { ProductPageClient } from './product-page-client';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Generate dynamic metadata for SEO
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return {
      title: 'Produit introuvable',
      description: 'Ce produit n\'existe pas ou n\'est plus disponible.',
    };
  }

  const price = (product.priceCents / 100).toFixed(2);
  const imageUrl = product.images?.[0]?.url || '';

  return {
    title: `${product.name} - Boutique 1885`,
    description: product.description || `${product.name} - ${price}€ - Goodies officiels d'Alfortville`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: 'website',
      siteName: 'Boutique 1885',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

/**
 * Product page - Server Component wrapper
 * Fetches product data server-side and passes to client component
 */
export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return <ProductPageClient product={product} />;
}
