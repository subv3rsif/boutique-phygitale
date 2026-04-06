/**
 * Category configuration for filtered product pages
 */
export type CategoryConfig = {
  slug: string;           // URL slug: 'collection', 'editions', etc.
  tag: string;            // Product tag to filter: 'collection', 'editions', etc.
  title: string;          // Display title: "La Collection"
  description: string;    // 1-2 sentence description
  metaTitle: string;      // SEO title
  metaDescription: string; // SEO description
};

/**
 * All category configurations
 */
export const categories: Record<string, CategoryConfig> = {
  collection: {
    slug: 'collection',
    tag: 'collection',
    title: 'La Collection',
    description: 'Des créations artisanales pensées pour incarner l\'esprit de notre manufacture. Chaque pièce allie savoir-faire traditionnel et design contemporain.',
    metaTitle: 'La Collection - 1885 Manufacture Alfortvillaise',
    metaDescription: 'Découvrez notre collection de produits artisanaux fabriqués à Alfortville.',
  },
  editions: {
    slug: 'editions',
    tag: 'editions',
    title: 'Éditions Limitées',
    description: 'Des pièces numérotées produites en série limitée. Des objets rares qui célèbrent l\'excellence artisanale et le patrimoine local.',
    metaTitle: 'Éditions Limitées - 1885 Manufacture',
    metaDescription: 'Pièces numérotées en série limitée, célébrant l\'excellence artisanale.',
  },
  artisans: {
    slug: 'artisans',
    tag: 'artisans',
    title: 'Nos Artisans',
    description: 'Découvrez les créations de nos artisans partenaires. Des savoir-faire d\'exception au service de pièces uniques et authentiques.',
    metaTitle: 'Nos Artisans - 1885 Manufacture',
    metaDescription: 'Créations artisanales de nos partenaires locaux, savoir-faire d\'exception.',
  },
  atelier: {
    slug: 'atelier',
    tag: 'atelier',
    title: 'L\'Atelier',
    description: 'Les créations nées au cœur de notre manufacture. Des pièces façonnées à la main dans nos ateliers d\'Alfortville.',
    metaTitle: 'L\'Atelier - 1885 Manufacture Alfortvillaise',
    metaDescription: 'Pièces façonnées à la main dans nos ateliers d\'Alfortville.',
  },
};

/**
 * Helper to get category config by slug
 */
export function getCategoryConfig(slug: string): CategoryConfig | undefined {
  return categories[slug];
}
