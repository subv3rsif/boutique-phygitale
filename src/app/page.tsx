import { Hero1885 } from '@/components/sections/hero-1885';
import { AccrocheTerritorial } from '@/components/sections/accroche-territorial';
import { ProduitHero } from '@/components/sections/produit-hero';
import { GrilleCollection } from '@/components/sections/grille-collection';
import { EditionsLimitees } from '@/components/sections/editions-limitees';
import { LesArtisans } from '@/components/sections/les-artisans';
import { Atelier } from '@/components/sections/atelier';
import { getActiveProducts } from '@/lib/products';

export default async function HomePage() {
  // Fetch products from database instead of static catalogue
  const allProducts = await getActiveProducts();

  // Get featured product (first active product)
  const featuredProduct = allProducts[0] ?? null;

  // Get collection products (max 6)
  const collectionProducts = allProducts.slice(0, 6);

  // Get limited edition products
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
