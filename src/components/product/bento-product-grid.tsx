'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, ArrowUpRight } from 'lucide-react';
import { type Product, formatCurrency } from '@/lib/catalogue';
import { useCart } from '@/store/cart';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
  const [imageLoaded, setImageLoaded] = useState(false);
  const addItem = useCart((s) => s.addItem);

  const isOutOfStock = product.stockQuantity !== undefined && product.stockQuantity === 0;
  const isNew = product.tags?.includes('nouveau') || product.tags?.includes('new');

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

  return (
    <AnimatedBorderCard className="col-span-2 row-span-2">
      <Link href={`/produit/${product.id}`} className="group/hero relative block h-full min-h-[480px] bg-muted">
        {/* Background image */}
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-stone-200 dark:bg-purple-900/50" />
        )}
        <Image
          src={product.image}
          alt={product.name}
          fill
          priority
          className={cn(
            'object-cover transition-all duration-700',
            imageLoaded ? 'opacity-100' : 'opacity-0',
            'group-hover/hero:scale-105'
          )}
          sizes="(max-width: 768px) 100vw, 66vw"
          onLoad={() => setImageLoaded(true)}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Tag "Hero piece" */}
        <div className="absolute top-5 left-5 flex gap-2">
          {isNew && (
            <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-3 py-1 rounded-full text-xs tracking-widest uppercase font-sans font-semibold">
              Nouveau
            </span>
          )}
          <span className="bg-primary/80 backdrop-blur-md text-primary-foreground px-3 py-1 rounded-full text-xs tracking-widest uppercase font-sans font-semibold">
            Pièce phare
          </span>
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
      </Link>
    </AnimatedBorderCard>
  );
}

// ─── Bento Card — Small ────────────────────────────────────────────────────────
function BentoCardSmall({ product, index }: { product: Product; index: number }) {
  const [isAdding, setIsAdding] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const addItem = useCart((s) => s.addItem);

  const isOutOfStock = product.stockQuantity !== undefined && product.stockQuantity === 0;
  const isNew = product.tags?.includes('nouveau') || product.tags?.includes('new');

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <AnimatedBorderCard>
        <Link href={`/produit/${product.id}`} className="group/small relative block h-full">
          {/* Image zone - 3:4 */}
          <div className="relative aspect-[3/4] bg-muted overflow-hidden">
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-stone-200 dark:bg-purple-900/50" />
            )}
            <motion.div
              animate={{ scale: isHovered ? 1.07 : 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                className={cn(
                  'object-cover transition-opacity duration-500',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                sizes="(max-width: 768px) 50vw, 25vw"
                onLoad={() => setImageLoaded(true)}
              />
            </motion.div>

            {/* Badges */}
            {isNew && (
              <span className="absolute top-3 left-3 z-10 glass-love text-primary px-3 py-1 rounded-full text-xs tracking-wider uppercase font-sans font-semibold backdrop-blur-md">
                Nouveau
              </span>
            )}

            {/* Hover overlay CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isHovered && !isOutOfStock ? 1 : 0, y: isHovered ? 0 : 10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-0 inset-x-0 p-4 glass dark:glass-dark"
            >
              <Button
                onClick={handleAdd}
                disabled={isAdding || isOutOfStock}
                size="sm"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-sans text-xs font-semibold uppercase tracking-wide h-10 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {isAdding ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Ajouter au panier'}
              </Button>
            </motion.div>
          </div>

          {/* Info */}
          <div className="p-4 space-y-1 bg-card">
            <h3 className="font-display text-base font-normal text-foreground truncate group-hover/small:text-primary transition-colors duration-300">
              {product.name}
            </h3>
            <p className="font-sans text-sm font-semibold text-foreground">
              {formatCurrency(product.priceCents)}
            </p>
          </div>
        </Link>
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

  // Bento layout: hero (2×2) + up to 4 small cards on right
  const smallProducts = restProducts.slice(0, 4);

  return (
    <div className="grid grid-cols-3 grid-rows-2 gap-4 lg:gap-5 auto-rows-[300px]">
      {/* Hero card — spans 2 cols × 2 rows */}
      <BentoCardHero product={heroProduct} />

      {/* Small cards — fill the right column, 2 rows × 2 */}
      {smallProducts.slice(0, 2).map((p, i) => (
        <BentoCardSmall key={p.id} product={p} index={i} />
      ))}

      {/* If 4+ products: second row of small cards */}
      {smallProducts.length > 2 && (
        <>
          {/* Extra row — spans full 3 cols with 3 equal cards */}
          <motion.div
            className="col-span-3 grid grid-cols-3 gap-4 lg:gap-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {smallProducts.slice(2, 5).map((p, i) => (
              <BentoCardSmall key={p.id} product={p} index={i + 2} />
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
}
