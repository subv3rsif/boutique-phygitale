'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ShoppingCart, Package, MapPin, Truck, Sparkles, Check, Loader2, ChevronDown } from 'lucide-react';
import type { Product } from '@/types/product';
import { useCart } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PremiumBadge } from '@/components/ui/premium-badge';
import { GoldDivider } from '@/components/ui/gold-divider';
import { SocialShare } from '@/components/ui/social-share';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn, formatCurrency } from '@/lib/utils';

interface ProductPageClientProps {
  product: Product;
}

const accordionItems = [
  {
    id: 'shipping',
    icon: Truck,
    title: 'Livraison',
    content: [
      {
        subtitle: 'Livraison à domicile',
        icon: Truck,
        items: [
          'Livraison par La Poste en Lettre Suivie',
          'Délai : 2-3 jours ouvrés après expédition',
          'Suivi en ligne disponible',
          'Frais calculés selon le produit',
        ],
      },
      {
        subtitle: 'Retrait gratuit à La Fabrik',
        icon: MapPin,
        items: [
          'Adresse : La Fabrik, [Adresse complète]',
          'Horaires : Du lundi au vendredi, 9h-17h',
          'QR code envoyé par email',
          'Retrait sous 30 jours',
        ],
      },
    ],
  },
  {
    id: 'details',
    icon: Package,
    title: 'Détails du produit',
    content: [
      'Édition municipale officielle',
      'Qualité premium',
      'Fabriqué avec soin',
      'Édition limitée',
    ],
  },
];

/**
 * Product Page Client Component
 * Receives product data from Server Component parent
 */
export function ProductPageClient({ product }: ProductPageClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('shipping');
  const addItem = useCart((state) => state.addItem);

  // Check if product has sizes
  const hasSizes = (product.sizes?.length ?? 0) > 0;

  // Calculate available stock based on selected size or global stock
  const availableStock = hasSizes && selectedSize
    ? product.sizes?.find((s) => s.size === selectedSize)?.stock ?? 0
    : product.stockQuantity ?? 0;

  const isOutOfStock = availableStock === 0;
  const isLowStock = availableStock < 10 && availableStock > 0;
  const isNew = product.tags?.includes('nouveau') || product.tags?.includes('new');

  const handleAddToCart = async () => {
    // If product has sizes, ensure a size is selected
    if (hasSizes && !selectedSize) {
      toast.error('Veuillez sélectionner une taille');
      return;
    }

    setIsAdding(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      addItem(product.id, quantity, hasSizes ? selectedSize : undefined);

      const description = hasSizes && selectedSize
        ? `${quantity} × ${product.name} (${selectedSize})`
        : `${quantity} × ${product.name}`;

      toast.success('Ajouté au panier', {
        description,
        duration: 2500,
      });
    } catch (error) {
      toast.error('Erreur lors de l\'ajout');
    } finally {
      setIsAdding(false);
    }
  };

  const totalPrice = product.priceCents * quantity;
  const totalShipping = product.shippingCents * quantity;

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="border-b border-border">
        <div className="container py-4 px-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 focus-terra">
              <ChevronLeft className="h-4 w-4" />
              <span>Retour à la boutique</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Product Content */}
      <div className="w-full py-8 md:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Left Column - Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted shadow-premium-lg">
              <Image
                src={product.images?.[0]?.url || 'https://placehold.co/600x750/503B64/F3EFEA?text=No+Image'}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />

              {/* Premium Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {isNew && (
                  <PremiumBadge label="Nouveau" variant="solid" size="md" />
                )}
                {isLowStock && selectedSize && (
                  <Badge className="bg-destructive text-destructive-foreground font-medium">
                    Plus que {availableStock}
                  </Badge>
                )}
              </div>
            </div>

            {/* Trust Indicators with Champagne Gold */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-champagne-light border border-champagne/30">
                  <Check className="h-5 w-5 text-champagne" />
                </div>
                <p className="text-xs text-slate">Qualité premium</p>
              </div>
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-champagne-light border border-champagne/30">
                  <Sparkles className="h-5 w-5 text-champagne" />
                </div>
                <p className="text-xs text-slate">Édition limitée</p>
              </div>
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-champagne-light border border-champagne/30">
                  <Package className="h-5 w-5 text-champagne" />
                </div>
                <p className="text-xs text-slate">Livraison soignée</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Product Info (Sticky) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const, delay: 0.1 }}
            className="lg:sticky lg:top-24 lg:self-start space-y-8"
          >
            {/* Header */}
            <div className="space-y-4">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground leading-tight">
                {product.name}
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Social Share */}
              <SocialShare
                url={typeof window !== 'undefined' ? window.location.href : `https://boutique-phygitale.vercel.app/produit/${product.id}`}
                title={product.name}
                description={product.description}
                image={product.images?.[0]?.url}
              />
            </div>

            {/* Pricing */}
            <div className="space-y-3 pb-6 border-b border-border">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-5xl font-bold text-foreground">
                  {formatCurrency(totalPrice)}
                </span>
                {quantity > 1 && (
                  <span className="text-muted-foreground">
                    ({formatCurrency(product.priceCents)} × {quantity})
                  </span>
                )}
              </div>

              {product.shippingCents > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="w-4 h-4" />
                  <span>
                    + {formatCurrency(totalShipping)} livraison
                    {quantity > 1 && ` (${formatCurrency(product.shippingCents)} × ${quantity})`}
                  </span>
                </div>
              )}
            </div>

            {/* Size Selector (if product has sizes) */}
            {hasSizes && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Taille <span className="text-red-500">*</span>
                </label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choisir une taille" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.sizes!.map((sizeConfig) => {
                      const isAvailable = sizeConfig.stock > 0;
                      return (
                        <SelectItem
                          key={sizeConfig.size}
                          value={sizeConfig.size}
                          disabled={!isAvailable}
                        >
                          {sizeConfig.size}
                          {!isAvailable && ' (Rupture)'}
                          {isAvailable && sizeConfig.stock < 10 && ` (${sizeConfig.stock} restant${sizeConfig.stock > 1 ? 's' : ''})`}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {selectedSize && (
                  <p className="text-sm text-muted-foreground">
                    Stock disponible : {availableStock}
                  </p>
                )}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Quantité
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="rounded-r-none"
                  >
                    -
                  </Button>
                  <span className="px-6 py-2 font-medium min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    disabled={quantity >= 10 || quantity >= availableStock}
                    className="rounded-l-none"
                  >
                    +
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  (Max : {availableStock > 0 ? availableStock : 10})
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleAddToCart}
                disabled={isAdding || isOutOfStock || (hasSizes && !selectedSize)}
                size="lg"
                className={cn(
                  "w-full relative overflow-hidden group",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  "dark:magenta-glow hover:dark:magenta-glow",
                  "font-semibold py-6 text-lg",
                  "transition-all duration-300"
                )}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isAdding ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Ajout en cours...
                    </>
                  ) : isOutOfStock ? (
                    <>Rupture de stock</>
                  ) : hasSizes && !selectedSize ? (
                    <>Sélectionner une taille</>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      Ajouter au panier
                    </>
                  )}
                </span>

                {/* Shimmer */}
                {!isAdding && !isOutOfStock && (
                  <motion.div
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                )}
              </Button>
            </motion.div>

            {/* Gold Divider before details */}
            <GoldDivider variant="circle" spacing="md" />

            {/* Accordions */}
            <div className="space-y-2">
              {accordionItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeAccordion === item.id;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "border rounded-lg overflow-hidden transition-all duration-300",
                      isActive
                        ? "border-champagne/50 bg-champagne-lighter/30 shadow-champagne-sm"
                        : "border-border hover:border-champagne/30"
                    )}
                  >
                    <button
                      onClick={() => setActiveAccordion(isActive ? null : item.id)}
                      className="w-full flex items-center justify-between p-4 text-left focus:outline-none focus:ring-2 focus:ring-champagne/30"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn(
                          "h-5 w-5 transition-colors",
                          isActive ? "text-champagne" : "text-primary"
                        )} />
                        <span className="font-medium text-foreground">{item.title}</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 transition-all duration-300",
                          isActive ? "rotate-180 text-champagne" : "text-muted-foreground"
                        )}
                      />
                    </button>

                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-4">
                            {/* If content has subsections (shipping mode) */}
                            {Array.isArray(item.content) && typeof item.content[0] === 'object' && 'subtitle' in item.content[0] ? (
                              item.content.map((section: any, sectionIndex: number) => {
                                const SectionIcon = section.icon;
                                return (
                                  <div key={sectionIndex} className="space-y-2">
                                    {/* Subtitle with icon */}
                                    <div className="flex items-center gap-2 pl-8">
                                      <SectionIcon className="h-4 w-4 text-champagne" />
                                      <h4 className="font-semibold text-foreground text-sm">
                                        {section.subtitle}
                                      </h4>
                                    </div>
                                    {/* Items */}
                                    <div className="pl-14 space-y-2">
                                      {section.items.map((line: string, lineIndex: number) => (
                                        <div key={lineIndex} className="flex items-start gap-2 text-sm text-foreground">
                                          <Check className="h-4 w-4 text-champagne mt-0.5 flex-shrink-0" />
                                          <span>{line}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              /* Simple list (details mode) */
                              <div className="pl-8 space-y-2">
                                {(item.content as string[]).map((line, index) => (
                                  <div key={index} className="flex items-start gap-2 text-sm text-foreground">
                                    <Check className="h-4 w-4 text-champagne mt-0.5 flex-shrink-0" />
                                    <span>{line}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
