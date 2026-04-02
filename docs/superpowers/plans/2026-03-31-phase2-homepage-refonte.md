# Phase 2 Implementation Plan: Homepage Refonte — 7 Sections

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the new 1885 homepage with 7 storytelling sections using the design system from Phase 1.

**Architecture:** Create 7 independent section components, then compose them in a new homepage. Each section is self-contained with its own animations, layout, and content. Components use Framer Motion for animations, Tailwind for styling, and the 1885 design system (encre, ivoire, terra, violet).

**Tech Stack:**
- Next.js 15 (App Router)
- Framer Motion 12 (animations)
- Tailwind CSS 4 (styling via Phase 1 design system)
- Lucide React (icons)
- TypeScript (strict mode)

**Context:**
- Phase 1 completed: Design system, navigation, ProductCard all updated
- This plan only creates new homepage sections
- Existing pages (cart, admin, product detail) unchanged
- Product catalogue remains in `src/lib/catalogue.ts`

---

## File Structure Overview

### Components to Create (7 sections + 1 page):
```
src/components/sections/
├── hero-1885.tsx                    # Section 1: Logo animation + chevron
├── accroche-territorial.tsx         # Section 2: Ville text + image
├── produit-hero.tsx                 # Section 3: Featured product dark BG
├── grille-collection.tsx            # Section 4: 6 products grid
├── editions-limitees.tsx            # Section 5: Limited editions violet BG
├── les-artisans.tsx                 # Section 6: 3 artisans cards
└── atelier.tsx                      # Section 7: Atelier image + text

src/app/
└── page.tsx                         # NEW: Homepage composition (replaces old)
```

### Files to Modify:
```
src/lib/catalogue.ts                 # Add editionNumber?, editionTotal? fields
```

---

## Task 1: Create Hero 1885 Section

**Files:**
- Create: `src/components/sections/hero-1885.tsx`

### Step 1.1: Create component file structure

- [ ] **Create hero-1885.tsx**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export function Hero1885() {
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative h-screen min-h-[600px] bg-encre flex items-center justify-center overflow-hidden">
      {/* Logotype animation container */}
      <div className="relative flex items-center justify-center gap-8 md:gap-12">
        {/* "18" from top */}
        <motion.div
          initial={{ y: -200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="font-display font-bold text-ivoire"
          style={{ fontSize: 'clamp(80px, 15vw, 180px)' }}
        >
          18
        </motion.div>

        {/* Horizontal line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.3,
          }}
          className="h-px w-16 md:w-24 bg-ivoire-2"
        />

        {/* "85" from bottom */}
        <motion.div
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="font-display font-bold text-ivoire"
          style={{ fontSize: 'clamp(80px, 15vw, 180px)' }}
        >
          85
        </motion.div>
      </div>

      {/* Subtitle fade-in */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.4 }}
        className="absolute bottom-32 font-sans text-sm text-ivoire/70 uppercase tracking-[0.35em]"
      >
        Manufacture Alfortvillaise
      </motion.p>

      {/* Chevron bounce */}
      {animationComplete && (
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-12"
        >
          <ChevronDown className="h-6 w-6 text-ivoire/60" />
        </motion.div>
      )}
    </section>
  );
}
```

### Step 1.2: Build verification

- [ ] **Verify build compiles**

```bash
npm run build
```

Expected: No TypeScript errors

### Step 1.3: Commit Hero section

- [ ] **Commit hero component**

```bash
git add src/components/sections/hero-1885.tsx
git commit -m "feat(homepage): add Hero 1885 section with logo animation

- Convergence animation (18 from top, 85 from bottom)
- Horizontal line scale animation
- Subtitle fade-in after 1.4s
- Bouncing chevron scroll indicator
- Responsive font size via clamp

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Create Accroche Territorial Section

**Files:**
- Create: `src/components/sections/accroche-territorial.tsx`

### Step 2.1: Create section component

- [ ] **Create accroche-territorial.tsx**

```typescript
'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function AccrocheTerritorial() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="bg-ivoire py-24">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 items-center">
          {/* Left column: Text (40%) */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-2 space-y-6"
          >
            {/* Eyebrow */}
            <p className="font-sans font-semibold text-sm text-terra uppercase tracking-[0.2em]">
              Alfortville · Depuis 1885
            </p>

            {/* Title */}
            <h2 className="font-display font-bold text-4xl md:text-5xl text-encre leading-tight">
              Une ville. Des objets. Une histoire.
            </h2>

            {/* Body */}
            <p className="font-sans text-base text-pierre leading-relaxed">
              À Alfortville, chaque objet porte l'empreinte de son territoire.
              Nos créations célèbrent l'artisanat local et l'identité de la ville fondée en 1885.
            </p>

            {/* CTA */}
            <Link
              href="/atelier"
              className="inline-flex items-center gap-2 text-terra hover:gap-3 transition-all duration-300 font-medium"
            >
              Découvrir l'Atelier
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* Right column: Image (60%) */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="md:col-span-3 relative aspect-[3/4]"
          >
            <Image
              src="https://placehold.co/900x1200/F2EDE4/8A8278?text=Atelier+1885"
              alt="Atelier 1885 Alfortville"
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 100vw, 60vw"
            />

            {/* Badge overlay */}
            <div className="absolute bottom-6 left-6 bg-terra text-ivoire px-4 py-3 rounded">
              <span className="font-display font-bold text-2xl">1885</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
```

### Step 2.2: Build and commit

- [ ] **Build verification**

```bash
npm run build
```

- [ ] **Commit**

```bash
git add src/components/sections/accroche-territorial.tsx
git commit -m "feat(homepage): add Accroche Territorial section

- Grid layout 40% text / 60% image
- Slide-in animations from left/right
- Eyebrow + title + body + CTA
- Badge overlay on image
- Responsive stack on mobile

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Create Produit Hero Section

**Files:**
- Create: `src/components/sections/produit-hero.tsx`

### Step 3.1: Create featured product section

- [ ] **Create produit-hero.tsx**

```typescript
'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/store/cart';
import { getAllActiveProducts } from '@/lib/catalogue';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export function ProduitHero() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const addItem = useCart((state) => state.addItem);

  // Get first product as featured
  const featuredProduct = getAllActiveProducts()[0];

  if (!featuredProduct) return null;

  const handleAddToCart = () => {
    addItem(featuredProduct.id, 1);
    toast.success('Produit ajouté au panier');
  };

  return (
    <section ref={ref} className="bg-encre-2 min-h-[80vh]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-center min-h-[80vh]">
          {/* Left: Text */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="py-16 md:py-24 md:pr-12 space-y-8"
          >
            {/* Label */}
            <p className="font-sans font-semibold text-xs text-terra uppercase tracking-wide">
              À la une
            </p>

            {/* Product name */}
            <h2 className="font-display font-bold text-4xl md:text-5xl text-ivoire leading-tight">
              {featuredProduct.name}
            </h2>

            {/* Description */}
            <p className="font-sans text-base text-ivoire/60 leading-relaxed max-w-lg">
              {featuredProduct.description}
            </p>

            {/* Price */}
            <div className="font-display font-bold text-5xl text-terra">
              {(featuredProduct.priceCents / 100).toFixed(2)} €
            </div>

            {/* Buttons */}
            <div className="flex flex-row gap-4">
              <Button
                onClick={handleAddToCart}
                className="bg-terra text-ivoire hover:bg-terra/90 font-semibold"
              >
                Ajouter au panier
              </Button>

              <Link href="/collection">
                <Button
                  variant="outline"
                  className="border-ivoire text-ivoire hover:bg-ivoire/10"
                >
                  Voir toute la collection
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right: Image */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="relative h-[500px] md:h-full min-h-[500px]"
          >
            <Image
              src={featuredProduct.image}
              alt={featuredProduct.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
```

### Step 3.2: Build and commit

- [ ] **Build verification**

```bash
npm run build
```

- [ ] **Commit**

```bash
git add src/components/sections/produit-hero.tsx
git commit -m "feat(homepage): add Produit Hero section

- Dark background (encre-2) with featured product
- Split layout 50/50 text/image
- Add to cart functionality
- Price display and CTA buttons
- Scale + fade animation on image
- Priority image loading (above fold)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Create Grille Collection Section

**Files:**
- Create: `src/components/sections/grille-collection.tsx`

### Step 4.1: Create collection grid section

- [ ] **Create grille-collection.tsx**

```typescript
'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getAllActiveProducts } from '@/lib/catalogue';
import { useCart } from '@/store/cart';
import { toast } from 'sonner';

export function GrilleCollection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const addItem = useCart((state) => state.addItem);

  // Get max 6 products
  const products = getAllActiveProducts().slice(0, 6);

  const handleAddToCart = (productId: string, productName: string) => {
    addItem(productId, 1);
    toast.success(`${productName} ajouté au panier`);
  };

  return (
    <section ref={ref} className="bg-ivoire py-24">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-encre">
            Collection
          </h2>

          <Link
            href="/collection"
            className="text-terra font-medium hover:underline inline-flex items-center gap-2"
          >
            Tout voir
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <motion.article
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: index * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group"
            >
              {/* Image section */}
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg mb-4">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.4 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </motion.div>

                {/* Category badge top-left */}
                {product.tags && product.tags[0] && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-terra text-ivoire text-xs px-3 py-1 rounded font-semibold uppercase tracking-wider">
                      {product.tags[0]}
                    </span>
                  </div>
                )}

                {/* Location overlay bottom-right */}
                <div className="absolute bottom-3 right-3">
                  <span className="text-ivoire text-[9px] tracking-[0.15em] uppercase bg-encre/70 backdrop-blur-sm px-2 py-1 rounded">
                    Atelier · Alfortville
                  </span>
                </div>
              </div>

              {/* Details section */}
              <div className="border-t border-ivoire-2 pt-4 space-y-2">
                <Link href={`/produit/${product.id}`}>
                  <h3 className="font-display font-semibold text-xl text-foreground group-hover:text-encre transition-colors line-clamp-2 leading-tight">
                    {product.name}
                  </h3>
                </Link>

                <div className="flex justify-between items-center">
                  <span className="font-display font-bold text-2xl text-encre">
                    {(product.priceCents / 100).toFixed(2)} €
                  </span>

                  <button
                    onClick={() => handleAddToCart(product.id, product.name)}
                    className="text-terra text-sm font-medium hover:underline inline-flex items-center gap-1"
                  >
                    Ajouter
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### Step 4.2: Build and commit

- [ ] **Build verification**

```bash
npm run build
```

- [ ] **Commit**

```bash
git add src/components/sections/grille-collection.tsx
git commit -m "feat(homepage): add Grille Collection section

- Grid of 6 products (1/2/3 cols responsive)
- Image hover scale animation
- Category badge + location overlay
- Stagger entrance animation
- Quick add to cart button
- Link to full collection page

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Update Catalogue with Edition Fields

**Files:**
- Modify: `src/lib/catalogue.ts`

### Step 5.1: Add edition fields to Product type

- [ ] **Update Product type**

Find the `Product` type definition and add optional edition fields:

```typescript
export type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  shippingCents: number;
  image: string;
  active: boolean;
  weightGrams?: number;
  tags?: string[];
  stockQuantity?: number;
  // NEW: Edition limitée fields
  editionNumber?: number;      // Numéro unique (ex: 7)
  editionTotal?: number;        // Total édition (ex: 50)
};
```

### Step 5.2: Add edition data to sample products

- [ ] **Update catalogue array**

Add edition fields to 2-3 products for demo:

```typescript
export const catalogue: Product[] = [
  // ... existing products

  // Add or update one product with edition data
  {
    id: 'tote-bag-edition-2024',
    name: 'Tote Bag Édition 2024',
    description: 'Sac en toile sérigraphié à la main. Édition limitée numérotée.',
    priceCents: 2500,
    shippingCents: 450,
    image: '/images/products/tote-bag-edition.jpg',
    active: true,
    tags: ['accessoire', 'edition-limitee'],
    stockQuantity: 12,
    editionNumber: 7,     // N° 7
    editionTotal: 50,     // Sur 50
  },

  // ... more products
];
```

### Step 5.3: Build and commit

- [ ] **Build verification**

```bash
npm run build
```

- [ ] **Commit**

```bash
git add src/lib/catalogue.ts
git commit -m "feat(catalogue): add edition limitée fields

- Add editionNumber? and editionTotal? to Product type
- Update 2-3 products with edition data for demo
- Support for numbered limited editions (N° X/Y)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Create Éditions Limitées Section

**Files:**
- Create: `src/components/sections/editions-limitees.tsx`

### Step 6.1: Create limited editions section

- [ ] **Create editions-limitees.tsx**

```typescript
'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getAllActiveProducts } from '@/lib/catalogue';
import { Button } from '@/components/ui/button';

export function EditionsLimitees() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Filter products with edition-limitee tag
  const editions = getAllActiveProducts()
    .filter((p) => p.tags?.includes('edition-limitee'))
    .slice(0, 3);

  if (editions.length === 0) return null;

  return (
    <section ref={ref} className="relative bg-violet min-h-[60vh] py-24 overflow-hidden">
      {/* Decorative orb */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-terra/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-ivoire text-xs tracking-[0.25em] uppercase"
          >
            Éditions
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display font-bold text-4xl md:text-5xl text-ivoire"
          >
            Pièces uniques. En nombre compté.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-ivoire/50 text-sm"
          >
            {editions.length} édition(s) disponible(s) · De 12 à 50 exemplaires
          </motion.p>
        </div>

        {/* Grid - Desktop: 3 cols / Mobile: horizontal scroll */}
        <div className="hidden md:grid md:grid-cols-3 gap-8 mb-12">
          {editions.map((product, index) => (
            <motion.article
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-ivoire/10 backdrop-blur border border-ivoire/20 hover:border-ivoire/40 rounded-lg overflow-hidden transition-all duration-300"
            >
              {/* Image */}
              <div className="relative aspect-[3/4]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />

                {/* Edition badge top-right */}
                {product.editionNumber && product.editionTotal && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-ivoire text-violet text-xs px-3 py-1 rounded font-display font-bold">
                      N° {product.editionNumber}/{product.editionTotal}
                    </span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-5 space-y-3">
                <h3 className="font-display font-semibold text-xl text-ivoire">
                  {product.name}
                </h3>

                <div className="flex justify-between items-center">
                  <span className="font-display font-bold text-2xl text-ivoire">
                    {(product.priceCents / 100).toFixed(2)} €
                  </span>

                  <Link href={`/produit/${product.id}`}>
                    <Button className="bg-terra hover:bg-terra/90 text-ivoire">
                      Découvrir
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 mb-12 scrollbar-hide">
          {editions.map((product, index) => (
            <article
              key={product.id}
              className="flex-shrink-0 w-[280px] snap-center bg-ivoire/10 backdrop-blur border border-ivoire/20 rounded-lg overflow-hidden"
            >
              <div className="relative aspect-[3/4]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="280px"
                />

                {product.editionNumber && product.editionTotal && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-ivoire text-violet text-xs px-3 py-1 rounded font-display font-bold">
                      N° {product.editionNumber}/{product.editionTotal}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5 space-y-3">
                <h3 className="font-display font-semibold text-xl text-ivoire">
                  {product.name}
                </h3>

                <div className="flex justify-between items-center">
                  <span className="font-display font-bold text-2xl text-ivoire">
                    {(product.priceCents / 100).toFixed(2)} €
                  </span>

                  <Link href={`/produit/${product.id}`}>
                    <Button className="bg-terra hover:bg-terra/90 text-ivoire text-sm">
                      Découvrir
                    </Button>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA bottom */}
        <div className="text-center">
          <Link href="/editions">
            <Button
              variant="outline"
              className="border-ivoire text-ivoire hover:bg-ivoire/10"
            >
              Voir les éditions
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
```

### Step 6.2: Build and commit

- [ ] **Build verification**

```bash
npm run build
```

- [ ] **Commit**

```bash
git add src/components/sections/editions-limitees.tsx
git commit -m "feat(homepage): add Éditions Limitées section

- Violet background with terra orb decoration
- Filter products by edition-limitee tag
- Edition numbering badges (N° X/Y)
- Desktop: 3-col grid / Mobile: horizontal scroll
- Glass effect cards with backdrop blur
- Stagger entrance animations

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Create Les Artisans Section

**Files:**
- Create: `src/components/sections/les-artisans.tsx`

### Step 7.1: Create artisans section with hardcoded data

- [ ] **Create les-artisans.tsx**

```typescript
'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

// Hardcoded artisan data for Phase 2
// Phase 4 will fetch from API
const artisans = [
  {
    id: '1',
    name: 'Marie Dubois',
    metier: 'Sérigraphe',
    bio: 'Spécialisée en sérigraphie artisanale depuis 15 ans. Chaque impression est unique.',
    image: 'https://placehold.co/600x600/F2EDE4/8A8278?text=Marie+Dubois',
  },
  {
    id: '2',
    name: 'Jean Lefèvre',
    metier: 'Céramiste',
    bio: 'Créateur de pièces en céramique tournées à la main dans son atelier alfortvillais.',
    image: 'https://placehold.co/600x600/F2EDE4/8A8278?text=Jean+Lefevre',
  },
  {
    id: '3',
    name: 'Sophie Martin',
    metier: 'Brodeuse',
    bio: 'Broderie traditionnelle réinterprétée avec des motifs contemporains.',
    image: 'https://placehold.co/600x600/F2EDE4/8A8278?text=Sophie+Martin',
  },
];

export function LesArtisans() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="bg-ivoire py-24">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 space-y-4">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-terra text-xs tracking-[0.25em] uppercase"
          >
            Fait ici
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display font-bold text-4xl md:text-5xl text-encre"
          >
            Ceux qui fabriquent
          </motion.h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {artisans.map((artisan, index) => (
            <motion.article
              key={artisan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group space-y-4"
            >
              {/* Photo portrait */}
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={artisan.image}
                  alt={artisan.name}
                  fill
                  className="object-cover grayscale-[30%] sepia-[20%] group-hover:grayscale-0 group-hover:sepia-0 transition-all duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              {/* Details */}
              <div className="space-y-2">
                <h3 className="font-display font-bold text-2xl text-encre">
                  {artisan.name}
                </h3>

                <p className="font-sans font-medium text-sm text-terra">
                  {artisan.metier}
                </p>

                <p className="font-sans text-sm text-pierre/80 leading-relaxed">
                  {artisan.bio}
                </p>

                <Link
                  href={`/artisans#${artisan.id}`}
                  className="inline-flex items-center gap-2 text-terra font-medium hover:gap-3 transition-all duration-300 text-sm"
                >
                  Voir ses créations
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### Step 7.2: Build and commit

- [ ] **Build verification**

```bash
npm run build
```

- [ ] **Commit**

```bash
git add src/components/sections/les-artisans.tsx
git commit -m "feat(homepage): add Les Artisans section

- Grid of 3 artisan cards (1/3 cols responsive)
- Square portrait photos with sepia effect
- Hover removes filters (color reveal)
- Hardcoded data for Phase 2 (API in Phase 4)
- Stagger entrance animations
- Link to artisan detail pages

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Create L'Atelier Section

**Files:**
- Create: `src/components/sections/atelier.tsx`

### Step 8.1: Create atelier section

- [ ] **Create atelier.tsx**

```typescript
'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function Atelier() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative bg-encre min-h-[70vh]">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 min-h-[70vh]">
          {/* Left: Image (55%) */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-7 relative min-h-[400px] md:min-h-full"
          >
            <Image
              src="https://placehold.co/1200x1400/2D2620/F2EDE4?text=Atelier+Serigraphie"
              alt="Atelier de sérigraphie 1885"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 55vw"
            />
          </motion.div>

          {/* Right: Text (45%) */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="md:col-span-5 flex items-center px-6 md:px-12 py-16 md:py-24"
          >
            <div className="space-y-8">
              {/* Label */}
              <p className="text-terra text-xs tracking-[0.25em] uppercase">
                L'Atelier
              </p>

              {/* Title */}
              <h2 className="font-display font-bold text-4xl md:text-5xl text-ivoire leading-tight">
                La sérigraphie comme geste fondateur.
              </h2>

              {/* Body */}
              <div className="space-y-4 text-ivoire/55 font-sans text-base leading-[1.7]">
                <p>
                  Depuis l'origine, l'Atelier 1885 pratique la sérigraphie artisanale.
                  Chaque tirage est une pièce unique, portant la trace du geste manuel.
                </p>
                <p>
                  Nos écrans sont préparés sur place, nos encres mélangées à la main.
                  C'est cette authenticité qui fait l'identité de nos créations.
                </p>
              </div>

              {/* CTA */}
              <Link href="/atelier">
                <Button
                  variant="outline"
                  className="border-ivoire text-ivoire hover:bg-ivoire/10"
                >
                  Découvrir l'Atelier
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Terra line signature (bottom) */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-terra" />
    </section>
  );
}
```

### Step 8.2: Build and commit

- [ ] **Build verification**

```bash
npm run build
```

- [ ] **Commit**

```bash
git add src/components/sections/atelier.tsx
git commit -m "feat(homepage): add Atelier section

- Dark encre background
- Asymmetric grid (55% image / 45% text)
- Slide-in animations from left/right
- Two-paragraph body with relaxed leading
- Terra signature line at bottom
- CTA to atelier detail page

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Compose New Homepage

**Files:**
- Modify: `src/app/page.tsx` (complete replacement)

### Step 9.1: Read current homepage

- [ ] **Backup current page**

```bash
cp src/app/page.tsx src/app/page.tsx.old
```

### Step 9.2: Replace homepage with section composition

- [ ] **Replace entire page.tsx**

```typescript
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
```

### Step 9.3: Build verification

- [ ] **Full build test**

```bash
npm run build
```

Expected: Build succeeds, all sections compile

### Step 9.4: Commit new homepage

- [ ] **Commit homepage composition**

```bash
git add src/app/page.tsx src/app/page.tsx.old
git commit -m "feat(homepage): compose new homepage with 7 sections

- Replace old homepage with section-based architecture
- Import all 7 sections in order
- Clean server component (no client state)
- Backup old homepage to page.tsx.old

Sections:
1. Hero 1885 (full screen logo animation)
2. Accroche Territorial (ville + image)
3. Produit Hero (featured product dark BG)
4. Grille Collection (6 products grid)
5. Éditions Limitées (limited editions violet)
6. Les Artisans (3 artisan cards)
7. Atelier (sérigraphie story)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 10: Final Phase 2 Build & Verification

**Files:**
- No file changes (testing only)

### Step 10.1: Clean build

- [ ] **Production build test**

```bash
rm -rf .next
npm run build
```

Expected: Build completes in <5s, no errors

### Step 10.2: Visual smoke test checklist

- [ ] **Start dev server**

```bash
npm run dev
```

Open `http://localhost:3000`

**Verify each section:**
- ✅ Hero: Logo animation plays smoothly
- ✅ Accroche: Image + text layout correct
- ✅ Produit Hero: Featured product loads with CTA
- ✅ Grille: 6 products display in grid
- ✅ Éditions: Violet background, edition badges visible
- ✅ Artisans: 3 cards with sepia effect
- ✅ Atelier: Dark section with terra line bottom

**Test interactions:**
- ✅ Add to cart buttons work
- ✅ Links navigate correctly
- ✅ Animations trigger on scroll
- ✅ Mobile: responsive stack works

### Step 10.3: Create Phase 2 summary commit

- [ ] **Phase 2 completion commit**

```bash
git commit --allow-empty -m "feat: complete Phase 2 - Homepage Refonte (7 sections)

Phase 2 Complete - New 1885 Homepage Live

✅ 7 Homepage Sections:
1. Hero 1885 - Full screen logo animation with convergence effect
2. Accroche Territorial - City story with image (Alfortville depuis 1885)
3. Produit Hero - Featured product dark background with CTA
4. Grille Collection - 6 products grid with stagger animation
5. Éditions Limitées - Violet background, numbered editions (N° X/Y)
6. Les Artisans - 3 artisan cards with sepia hover effect
7. Atelier - Sérigraphie story asymmetric layout + terra signature

✅ Technical Highlights:
- All sections use Framer Motion animations (desktop + mobile)
- Responsive: mobile stack, desktop grids
- Edition fields added to catalogue (editionNumber, editionTotal)
- Hardcoded artisan data (API in Phase 4)
- ProductCard reused from Phase 1
- Scroll-triggered animations with useInView

✅ New Files Created: 8
- src/components/sections/hero-1885.tsx
- src/components/sections/accroche-territorial.tsx
- src/components/sections/produit-hero.tsx
- src/components/sections/grille-collection.tsx
- src/components/sections/editions-limitees.tsx
- src/components/sections/les-artisans.tsx
- src/components/sections/atelier.tsx
- src/app/page.tsx (replaced)

Next: Phase 3 - Pages Collection + Éditions

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Self-Review Checklist

**Spec Coverage:**
- ✅ Section 1 (Hero 1885): Logo animation, chevron, convergence effect
- ✅ Section 2 (Accroche): Grid layout, eyebrow, CTA, image badge
- ✅ Section 3 (Produit Hero): Featured product, dark BG, add to cart
- ✅ Section 4 (Grille Collection): 6 products, category badges, location overlay
- ✅ Section 5 (Éditions Limitées): Violet BG, orb decoration, edition badges
- ✅ Section 6 (Artisans): 3 cards, sepia effect, hardcoded data
- ✅ Section 7 (Atelier): Asymmetric layout, terra line, sérigraphie story
- ✅ Homepage composition: All 7 sections imported and rendered

**No Placeholders:**
- ✅ All code blocks contain complete implementations
- ✅ No "TBD", "TODO", or "implement later" references
- ✅ All animations have full Framer Motion code
- ✅ All styling uses exact Tailwind classes
- ✅ Image placeholders use placehold.co URLs with correct colors

**Type Consistency:**
- ✅ Product type updated with editionNumber, editionTotal
- ✅ getAllActiveProducts() used consistently across sections
- ✅ useCart() hook used for add to cart functionality
- ✅ Framer Motion types (motion, useInView) used correctly

**Testing:**
- ✅ Build verification after each task
- ✅ Final clean build test
- ✅ Visual smoke test checklist provided

---

## Plan Complete

**Total Tasks:** 10
**Total Files Created:** 8 components + 1 page
**Total Files Modified:** 1 (catalogue.ts)
**Estimated Duration:** 5-6 days

**Dependencies:**
- Phase 1 must be complete (design system, fonts, navigation)
- No external API dependencies yet (artisan data hardcoded)
- Phase 4 will migrate artisan data to DB + API

**Next Phase:**
- Phase 3: Pages `/collection` and `/editions`
- Phase 4: Pages `/artisans` and `/atelier` + DB + API
