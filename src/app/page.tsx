import dynamic from 'next/dynamic';
import { Hero1885 } from '@/components/sections/hero-1885';
import { getActiveProducts, getFeaturedProducts } from '@/lib/products';
import { unstable_cache } from 'next/cache';
import type { Metadata } from 'next';

// Lazy load below-the-fold sections to reduce First Load JS
// These sections use Framer Motion (341KB), so deferring them improves TTI
const AccrocheTerritorial = dynamic(
  () => import('@/components/sections/accroche-territorial').then(mod => ({ default: mod.AccrocheTerritorial })),
  { ssr: true }
);

const ProduitHero = dynamic(
  () => import('@/components/sections/produit-hero').then(mod => ({ default: mod.ProduitHero })),
  { ssr: true }
);

const GrilleCollection = dynamic(
  () => import('@/components/sections/grille-collection').then(mod => ({ default: mod.GrilleCollection })),
  { ssr: true }
);

const EditionsLimitees = dynamic(
  () => import('@/components/sections/editions-limitees').then(mod => ({ default: mod.EditionsLimitees })),
  { ssr: true }
);

const LesArtisans = dynamic(
  () => import('@/components/sections/les-artisans').then(mod => ({ default: mod.LesArtisans })),
  { ssr: true }
);

const Atelier = dynamic(
  () => import('@/components/sections/atelier').then(mod => ({ default: mod.Atelier })),
  { ssr: true }
);

export const metadata: Metadata = {
  title: 'Boutique 1885 – Goodies officiels d\'Alfortville',
  description: 'Découvrez la collection officielle 1885 : goodies, éditions limitées et créations artisanales made in Alfortville. Sérigraphie locale et qualité premium.',
};

// Cache products for 5 minutes to reduce DB connections
const getCachedFeaturedProducts = unstable_cache(
  async () => getFeaturedProducts(),
  ['featured-products'],
  { revalidate: 300 }
);

const getCachedActiveProducts = unstable_cache(
  async () => getActiveProducts(),
  ['active-products'],
  { revalidate: 300 }
);

export default async function HomePage() {
  // Fetch featured products (marked as "à la une" in admin) - CACHED
  const featuredProducts = await getCachedFeaturedProducts();

  // Fallback to all active products if no featured products - CACHED
  const allProducts = featuredProducts.length > 0 ? featuredProducts : await getCachedActiveProducts();

  // Get featured product for hero section (first featured/active product)
  const featuredProduct = allProducts[0] ?? null;

  // Get collection products (max 6 featured/active products)
  const collectionProducts = allProducts.slice(0, 6);

  // Get limited edition products (featured/active + edition-limitee tag)
  const limitedEditions = allProducts
    .filter((p) => p.tags?.includes('edition-limitee'))
    .slice(0, 3);

  return (
    <>
      <Hero1885 />
      <AccrocheTerritorial />
      <ProduitHero featuredProduct={featuredProduct} />
      <GrilleCollection products={collectionProducts} />
      <EditionsLimitees editions={limitedEditions} />
      <LesArtisans />
      <Atelier />
    </>
  );
}
