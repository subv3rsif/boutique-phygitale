import { Hero1885 } from '@/components/sections/hero-1885';
import { AccrocheTerritorial } from '@/components/sections/accroche-territorial';
import { ProduitHero } from '@/components/sections/produit-hero';
import { GrilleCollection } from '@/components/sections/grille-collection';
import { EditionsLimitees } from '@/components/sections/editions-limitees';
import { LesArtisans } from '@/components/sections/les-artisans';
import { Atelier } from '@/components/sections/atelier';

export default function HomePage() {
  return (
    <>
      <Hero1885 />
      <AccrocheTerritorial />
      <ProduitHero />
      <GrilleCollection />
      <EditionsLimitees />
      <LesArtisans />
      <Atelier />
    </>
  );
}
