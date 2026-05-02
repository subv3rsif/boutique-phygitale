'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, ArrowUpRight, Crown } from 'lucide-react';
import type { Product } from '@/types/product';
import { formatCurrency } from '@/lib/catalogue';
import { useCart } from '@/store/cart';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PremiumBadge, PremiumBadgeIcon } from '@/components/ui/premium-badge';
import { ProductImageCarousel } from '@/components/product/product-image-carousel';

// ─── Animated Border Card ─────────────────────────────────────────────────────
// Technique "conic-gradient spotlight" : le liseret suit le curseur via JS
function AnimatedBorderCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const { left, top } = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={onMouseMove}
      className={cn('group/card relative rounded-3xl p-[2px]', className)}
      style={{ '--mouse-x': mouseX, '--mouse-y': mouseY } as React.CSSProperties}
    >
      {/* Animated conic border — visible on hover via opacity */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([x, y]) =>
              `radial-gradient(400px circle at ${x}px ${y}px, rgba(130,110,150,0.6), rgba(80,59,100,0.3) 40%, transparent 70%)`
          ),
        }}
      />
      {/* Static rotating border underneath */}
      <div className="absolute inset-0 rounded-3xl animated-conic-border opacity-0 group-hover/card:opacity-100 transition-opacity duration-700" />
      {/* Inner content */}
      <div className="relative h-full rounded-[22px] overflow-hidden">
        {children}
      </div>
    </div>
  );
}

// ─── Bento Card — Hero (large) ────────────────────────────────────────────────
function BentoCardHero({ product }: { product: Product }) {
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);

  const isOutOfStock = product.stockQuantity === 0;
  const isNew = product.badges?.includes('nouveauté') || product.badges?.includes('nouveau');

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    setIsAdding(true);
    await new Promise((r) => setTimeout(r, 300));
    addItem(product.id, 1);
    toast.success('Ajouté au panier', { description: product.name, duration: 2000 });
    setIsAdding(false);
  };

  const handleImageClick = () => {
    router.push(`/produit/${product.id}`);
  };

  return (
    <AnimatedBorderCard className="h-full">
      <div className="group/hero relative block h-full min-h-[600px] bg-muted">
        {/* Product Image Carousel */}
        <ProductImageCarousel
          images={product.images}
          productName={product.name}
          variant="card"
          priority={true}
          sizes="(max-width: 768px) 100vw, 66vw"
          className="absolute inset-0"
          onImageClick={handleImageClick}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Premium Badges */}
        <div className="absolute top-5 left-5 flex gap-2 z-10">
          {isNew && (
            <PremiumBadge label="Nouveau" variant="solid" size="sm" />
          )}
          <PremiumBadgeIcon
            label="Pièce phare"
            icon={<Crown className="h-3.5 w-3.5 text-champagne" />}
            variant="glass"
            size="sm"
          />
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 inset-x-0 p-6 flex items-end justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-display text-2xl md:text-3xl font-semibold text-white leading-tight">
              {product.name}
            </h3>
            <p className="text-white/70 text-sm font-sans font-light line-clamp-1">
              {product.description}
            </p>
            <p className="font-sans font-bold text-white text-xl mt-2">
              {formatCurrency(product.priceCents)}
            </p>
          </div>

          {/* Add to cart CTA */}
          <div className="flex gap-2 shrink-0">
            <Button
              onClick={handleAdd}
              disabled={isAdding || isOutOfStock}
              className="h-11 px-5 bg-white/10 backdrop-blur-md text-white border border-white/30 hover:bg-white hover:text-foreground rounded-xl font-sans text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ajouter'}
            </Button>
            <Link
              href={`/produit/${product.id}`}
              className="inline-flex items-center justify-center h-11 w-11 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl hover:bg-white hover:text-foreground transition-all duration-300 hover:scale-105"
              onClick={(e) => e.stopPropagation()}
            >
              <ArrowUpRight className="h-4 w-4 text-white group-hover/hero:text-foreground" />
            </Link>
          </div>
        </div>
      </div>
    </AnimatedBorderCard>
  );
}

// ─── Bento Card — Small ────────────────────────────────────────────────────────
function BentoCardSmall({ product, index }: { product: Product; index: number }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);

  const isOutOfStock = product.stockQuantity === 0;
  const isNew = product.badges?.includes('nouveauté') || product.badges?.includes('nouveau');

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    setIsAdding(true);
    await new Promise((r) => setTimeout(r, 300));
    addItem(product.id, 1);
    toast.success('Ajouté au panier', { description: product.name, duration: 2000 });
    setIsAdding(false);
  };

  const handleImageClick = () => {
    router.push(`/produit/${product.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="h-full"
    >
      <AnimatedBorderCard className="h-full">
        <div className="group/small relative block h-full min-h-[400px] bg-muted">
          {/* Product Image Carousel with scale animation */}
          <motion.div
            animate={{ scale: isHovered ? 1.07 : 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <ProductImageCarousel
              images={product.images}
              productName={product.name}
              variant="card"
              priority={false}
              sizes="(max-width: 768px) 50vw, 25vw"
              className="absolute inset-0"
              onImageClick={handleImageClick}
            />
          </motion.div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Premium Badge */}
          {isNew && (
            <div className="absolute top-3 left-3 z-10">
              <PremiumBadge label="Nouveau" variant="solid" size="sm" />
            </div>
          )}

          {/* Bottom content - Always visible */}
          <div className="absolute bottom-0 inset-x-0 p-4 flex flex-col gap-3">
            {/* Product info */}
            <div className="space-y-1">
              <h3 className="font-display text-lg font-semibold text-white leading-tight line-clamp-2">
                {product.name}
              </h3>
              <p className="font-sans font-bold text-white text-base">
                {formatCurrency(product.priceCents)}
              </p>
            </div>

            {/* Add to cart button - Show on hover */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isHovered && !isOutOfStock ? 1 : 0, y: isHovered ? 0 : 10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <Button
                onClick={handleAdd}
                disabled={isAdding || isOutOfStock}
                size="sm"
                className="w-full bg-white/10 backdrop-blur-md text-white border border-white/30 hover:bg-white hover:text-foreground rounded-xl font-sans text-xs font-semibold uppercase tracking-wide h-10 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {isAdding ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Ajouter au panier'}
              </Button>
            </motion.div>
          </div>
        </div>
      </AnimatedBorderCard>
    </motion.div>
  );
}

// ─── Main Bento Grid ────────────────────────────────────────────────────────────
type BentoProductGridProps = {
  products: Product[];
};

export function BentoProductGrid({ products }: BentoProductGridProps) {
  if (products.length === 0) return null;

  const [heroProduct, ...restProducts] = products;
  if (!heroProduct) return null;

  // Bento layout: hero (2×2) + small cards
  const smallProducts = restProducts.slice(0, 4);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
      {/* Row 1: Hero (2×2) + 2 small cards on right */}
      <div className="md:col-span-2 md:row-span-2">
        <BentoCardHero product={heroProduct} />
      </div>

      {/* Small cards — fill the right column */}
      {smallProducts.slice(0, 2).map((p, i) => (
        <div key={p.id} className="md:col-span-1">
          <BentoCardSmall product={p} index={i} />
        </div>
      ))}

      {/* Row 2: 3 equal cards if 4+ products */}
      {smallProducts.slice(2, 5).map((p, i) => (
        <div key={p.id} className="md:col-span-1">
          <BentoCardSmall product={p} index={i + 2} />
        </div>
      ))}
    </div>
  );
}
