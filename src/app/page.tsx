import { Hero1885 } from '@/components/sections/hero-1885';
import { AccrocheTerritorial } from '@/components/sections/accroche-territorial';
import { ProduitHero } from '@/components/sections/produit-hero';
import { GrilleCollection } from '@/components/sections/grille-collection';
import { EditionsLimitees } from '@/components/sections/editions-limitees';
import { LesArtisans } from '@/components/sections/les-artisans';
import { Atelier } from '@/components/sections/atelier';
import { getActiveProducts, getFeaturedProducts } from '@/lib/products';
import { unstable_cache } from 'next/cache';

// Cache products for 5 minutes to reduce DB connections
const getCachedFeaturedProducts = unstable_cache(
  async () => getFeaturedProducts(),
  ['featured-products'],
  { revalidate: 300, tags: ['products'] }
);

const getCachedActiveProducts = unstable_cache(
  async () => getActiveProducts(),
  ['active-products'],
  { revalidate: 300, tags: ['products'] }
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
