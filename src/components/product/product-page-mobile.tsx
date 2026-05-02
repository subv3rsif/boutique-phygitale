'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ChevronLeft,
  Heart,
  Share2,
  ChevronRight,
  Package,
  Truck,
  MapPin,
  Sparkles,
  Info,
  Tag as TagIcon,
  Calendar,
  Loader2
} from 'lucide-react';
import type { Product } from '@/types/product';
import { ProductImageCarousel } from '@/components/product/product-image-carousel';
import { useCart } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

type ProductPageMobileProps = {
  product: Product;
};

/**
 * ProductPageMobile - Refonte mobile-first inspirée Vinted
 *
 * Structure:
 * - Image carousel fullscreen en haut
 * - Scroll vertical avec infos produit
 * - Specs en liste clean avec chevrons
 * - Social proof badges
 * - Sticky CTA en bas
 *
 * Design: Fond encre, accents terra, typo Cormorant + Work Sans
 */
export function ProductPageMobile({ product }: ProductPageMobileProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(product.favoriteCount);
  const [isAdding, setIsAdding] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const addItem = useCart((state) => state.addItem);

  // Détection scroll pour sticky CTA
  useEffect(() => {
    const handleScroll = () => {
      // Afficher CTA sticky après 300px de scroll
      setShowStickyCTA(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock = product.stockQuantity < 10 && product.stockQuantity > 0;
  const isLimitedEdition = product.editionNumber && product.editionTotal;
  const isNew = product.badges?.includes('nouveauté') || product.badges?.includes('nouveau');

  // Calculer date d'ajout réelle depuis createdAt
  const daysAgo = Math.floor((Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  const addedDate = daysAgo === 0
    ? "Aujourd'hui"
    : daysAgo === 1
    ? 'Il y a 1 jour'
    : daysAgo < 30
    ? `Il y a ${daysAgo} jours`
    : daysAgo < 60
    ? 'Il y a 1 mois'
    : `Il y a ${Math.floor(daysAgo / 30)} mois`;

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      addItem(product.id, 1);
      toast.success('Ajouté au panier', {
        description: product.name,
        duration: 2500,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    setFavoriteCount((prev) => (isFavorite ? prev - 1 : prev + 1));
    toast.success(isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris', {
      duration: 1500,
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      // Fallback: copier le lien
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié !', { duration: 1500 });
    }
  };

  // Construire meta info compact (style Vinted)
  const metaInfo = [
    product.editionNumber && product.editionTotal
      ? `${product.editionNumber}/${product.editionTotal}`
      : null,
    product.tags?.[0] || 'Collection',
    addedDate
  ].filter(Boolean).join(' · ');

  return (
    <div className="min-h-screen bg-encre text-ivoire">
      {/* Header fixe */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
        <Link
          href="/"
          className="p-2 rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50 transition-colors"
          aria-label="Retour"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </Link>

        <button
          onClick={handleShare}
          className="p-2 rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50 transition-colors"
          aria-label="Partager"
        >
          <Share2 className="w-5 h-5 text-white" />
        </button>
      </header>

      {/* Image carousel fullscreen */}
      <div className="relative h-[70vh] bg-muted">
        <ProductImageCarousel
          images={product.images}
          productName={product.name}
          variant="detail"
          priority={true}
          sizes="100vw"
          enableLightbox={true}
        />

        {/* Bouton favoris flottant */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleToggleFavorite}
          className={cn(
            "absolute bottom-4 right-4 z-10",
            "flex items-center gap-2 px-4 py-2 rounded-full",
            "backdrop-blur-md transition-all",
            isFavorite
              ? "bg-terra/90 text-white"
              : "bg-black/50 text-white hover:bg-black/70"
          )}
        >
          <Heart
            className={cn("w-5 h-5", isFavorite && "fill-current")}
          />
          <span className="text-sm font-semibold">{favoriteCount}</span>
        </motion.button>
      </div>

      {/* Contenu scrollable */}
      <div className="bg-encre rounded-t-3xl -mt-6 relative z-10">
        <div className="px-4 pt-6 pb-32 space-y-6">

          {/* Titre & Meta */}
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold text-ivoire leading-tight">
              {product.name}
            </h1>
            <p className="text-sm text-ivoire/60">
              {metaInfo}
            </p>
          </div>

          {/* Prix */}
          <div className="space-y-1">
            <div className="text-4xl font-bold text-ivoire">
              {formatCurrency(product.priceCents)}
            </div>
            {product.shippingCents > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-terra font-medium">
                  + {formatCurrency(product.shippingCents)}
                </span>
                <span className="text-ivoire/60">frais de livraison</span>
              </div>
            )}
          </div>

          {/* Social proof badges */}
          {(isLowStock || isLimitedEdition || isNew) && (
            <div className="space-y-2">
              {isLowStock && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-terra/10 border border-terra/20">
                  <Sparkles className="w-5 h-5 text-terra" />
                  <span className="text-sm font-medium text-ivoire">
                    En demande ! Plus que {product.stockQuantity} disponibles
                  </span>
                </div>
              )}

              {isLimitedEdition && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-violet/10 border border-violet/20">
                  <Info className="w-5 h-5 text-violet" />
                  <span className="text-sm font-medium text-ivoire">
                    Pièce {product.editionNumber}/{product.editionTotal} · Édition limitée
                  </span>
                </div>
              )}

              {isNew && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-terra/10 border border-terra/20">
                  <Sparkles className="w-5 h-5 text-terra" />
                  <span className="text-sm font-medium text-ivoire">
                    Nouveauté · Ajouté récemment
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-ivoire/10" />

          {/* Description */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-ivoire/60 uppercase tracking-wide">
              Description
            </h2>
            <p className="text-base text-ivoire/80 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-ivoire/10" />

          {/* Specs en liste (style Vinted) */}
          <div className="space-y-0 -mx-4">
            {/* Catégorie */}
            {product.tags && product.tags.length > 0 && (
              <SpecRow
                icon={TagIcon}
                label="Catégorie"
                value={product.tags[0] || 'Collection'}
              />
            )}

            {/* Tags additionnels */}
            {product.tags && product.tags.length > 1 && (
              <SpecRow
                icon={TagIcon}
                label="Tags"
                value={product.tags.slice(1, 3).join(', ')}
              />
            )}

            {/* Stock */}
            <SpecRow
              icon={Package}
              label="Disponibilité"
              value={isOutOfStock ? 'Rupture de stock' : `${product.stockQuantity} en stock`}
            />

            {/* Édition */}
            {isLimitedEdition && (
              <SpecRow
                icon={Sparkles}
                label="Édition"
                value={`Pièce ${product.editionNumber}/${product.editionTotal}`}
              />
            )}

            {/* Ajouté */}
            <SpecRow
              icon={Calendar}
              label="Ajouté"
              value={addedDate}
            />

            {/* Livraison */}
            <SpecRow
              icon={Truck}
              label="Livraison"
              value="La Poste Suivie"
              chevron
            />

            {/* Retrait */}
            <SpecRow
              icon={MapPin}
              label="Retrait gratuit"
              value="La Fabrik · Alfortville"
              chevron
            />
          </div>

        </div>
      </div>

      {/* Sticky CTA (apparaît au scroll) */}
      <AnimatePresence>
        {showStickyCTA && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-encre border-t border-ivoire/10 p-4 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleFavorite}
                className={cn(
                  "p-3 rounded-xl transition-colors",
                  isFavorite
                    ? "bg-terra text-white"
                    : "bg-ivoire/10 text-ivoire hover:bg-ivoire/20"
                )}
                aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
              </button>

              <Button
                onClick={handleAddToCart}
                disabled={isAdding || isOutOfStock}
                className="flex-1 h-12 bg-terra hover:bg-terra/90 text-white font-semibold rounded-xl"
                size="lg"
              >
                {isAdding ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Ajouter au panier'
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA fixe initial (avant scroll) */}
      {!showStickyCTA && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-encre border-t border-ivoire/10 p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleFavorite}
              className={cn(
                "p-3 rounded-xl transition-colors",
                isFavorite
                  ? "bg-terra text-white"
                  : "bg-ivoire/10 text-ivoire hover:bg-ivoire/20"
              )}
              aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
            </button>

            <Button
              onClick={handleAddToCart}
              disabled={isAdding || isOutOfStock}
              className="flex-1 h-12 bg-terra hover:bg-terra/90 text-white font-semibold rounded-xl"
              size="lg"
            >
              {isAdding ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Ajouter au panier'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * SpecRow - Ligne de spec style Vinted
 */
function SpecRow({
  icon: Icon,
  label,
  value,
  chevron = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  chevron?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-4 hover:bg-ivoire/5 transition-colors">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-ivoire/40" />
        <span className="text-sm font-medium text-ivoire/60">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-ivoire">{value}</span>
        {chevron && <ChevronRight className="w-4 h-4 text-ivoire/40" />}
      </div>
    </div>
  );
}
