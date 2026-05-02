'use client';

import type { Product } from '@/types/product';
import { ProductPageMobile } from '@/components/product/product-page-mobile';

interface ProductPageClientProps {
  product: Product;
}

/**
 * Product Page Client Component - Refonte mobile-first
 *
 * Nouvelle version inspirée Vinted :
 * - Image fullscreen carousel en haut avec lightbox
 * - Scroll vertical avec infos produit
 * - Social proof badges (stock bas, édition limitée, nouveauté)
 * - Specs en liste clean avec icônes et chevrons
 * - Sticky CTA au scroll avec bouton favoris
 * - Bouton favoris flottant sur l'image avec compteur social
 * - Partage natif (Web Share API)
 *
 * Design:
 * - Fond encre (#1A1613)
 * - Accents terra (#C56339)
 * - Texte ivoire (#F2EDE4)
 * - Typo: Cormorant Garamond (display) + Work Sans (sans)
 *
 * Fonctionne sur mobile ET desktop avec adaptations responsive
 */
export function ProductPageClient({ product }: ProductPageClientProps) {
  return <ProductPageMobile product={product} />;
}
