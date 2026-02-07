'use client';

import { useState, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ShoppingCart, Package, MapPin, Truck, Sparkles, Check, Loader2, ChevronDown } from 'lucide-react';
import { getProductById, formatCurrency } from '@/lib/catalogue';
import { useCart } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

const accordionItems = [
  {
    id: 'delivery',
    icon: Truck,
    title: 'Livraison à domicile',
    content: [
      'Livraison par La Poste en Lettre Suivie',
      'Délai : 2-3 jours ouvrés après expédition',
      'Suivi en ligne disponible',
      'Frais calculés selon le produit',
    ],
  },
  {
    id: 'pickup',
    icon: MapPin,
    title: 'Retrait gratuit à La Fabrik',
    content: [
      'Adresse : La Fabrik, [Adresse complète]',
      'Horaires : Du lundi au vendredi, 9h-17h',
      'QR code envoyé par email',
      'Retrait sous 30 jours',
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

export default function ProductPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const product = getProductById(resolvedParams.id);

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('delivery');
  const addItem = useCart((state) => state.addItem);

  if (!product) {
    notFound();
  }

  const isOutOfStock = product.stockQuantity !== undefined && product.stockQuantity === 0;
  const isLowStock = product.stockQuantity !== undefined && product.stockQuantity < 10 && product.stockQuantity > 0;
  const isNew = product.tags?.includes('nouveau') || product.tags?.includes('new');

  const handleAddToCart = async () => {
    setIsAdding(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      addItem(product.id, quantity);

      toast.success('Ajouté au panier', {
        description: `${quantity} × ${product.name}`,
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
            <Button variant="ghost" size="sm" className="gap-2 focus-magenta">
              <ChevronLeft className="h-4 w-4" />
              <span>Retour à la boutique</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Product Content */}
      <div className="container py-8 md:py-12 px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 max-w-7xl mx-auto">

          {/* Left Column - Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-muted">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {isNew && (
                  <Badge className="bg-primary text-primary-foreground dark:magenta-glow-sm font-semibold gap-1">
                    <Sparkles className="w-3 h-3" />
                    Nouveau
                  </Badge>
                )}
                {isLowStock && (
                  <Badge className="bg-destructive text-destructive-foreground font-medium">
                    Plus que {product.stockQuantity}
                  </Badge>
                )}
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                  <Check className="h-5 w-5" />
                </div>
                <p className="text-xs text-muted-foreground">Qualité premium</p>
              </div>
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <p className="text-xs text-muted-foreground">Édition limitée</p>
              </div>
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                  <Package className="h-5 w-5" />
                </div>
                <p className="text-xs text-muted-foreground">Livraison soignée</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="space-y-8"
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
                    disabled={quantity >= 10 || (product.stockQuantity !== undefined && quantity >= product.stockQuantity)}
                    className="rounded-l-none"
                  >
                    +
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  (Max : {product.stockQuantity !== undefined ? product.stockQuantity : 10})
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleAddToCart}
                disabled={isAdding || isOutOfStock}
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

            {/* Accordions */}
            <div className="space-y-2 pt-4">
              {accordionItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeAccordion === item.id;

                return (
                  <div
                    key={item.id}
                    className="border border-border rounded-lg overflow-hidden transition-colors hover:border-primary/50"
                  >
                    <button
                      onClick={() => setActiveAccordion(isActive ? null : item.id)}
                      className="w-full flex items-center justify-between p-4 text-left focus-magenta"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <span className="font-medium text-foreground">{item.title}</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 text-muted-foreground transition-transform",
                          isActive && "rotate-180"
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
                          <div className="px-4 pb-4 pl-12 space-y-2">
                            {item.content.map((line, index) => (
                              <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>{line}</span>
                              </div>
                            ))}
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
