# Category Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create 4 category-filtered product listing pages that display products filtered by tags using the existing BentoProductGrid component.

**Architecture:** Server-side rendered Next.js pages with shared component logic. Each page filters active products by category tag and reuses existing UI components.

**Tech Stack:** Next.js 15 App Router (Server Components), TypeScript, Tailwind CSS, Framer Motion, existing components (BentoProductGrid)

---

## File Structure Map

**Files to create:**
- `src/lib/categories.ts` - Category configuration and metadata
- `src/components/category/category-empty.tsx` - Empty state component
- `src/components/category/category-header.tsx` - Header with title and description
- `src/components/category/category-page.tsx` - Shared category page component
- `src/app/collection/page.tsx` - Collection category page
- `src/app/editions/page.tsx` - Editions category page
- `src/app/artisans/page.tsx` - Artisans category page
- `src/app/atelier/page.tsx` - L'Atelier category page

**Files to read (dependencies):**
- `src/lib/products.ts` - getActiveProducts() function
- `src/components/product/bento-product-grid.tsx` - BentoProductGrid component
- `src/types/product.ts` - Product type
- `src/components/ui/section-heading.tsx` - Word-reveal animation pattern

---

### Task 1: Create Category Configuration

**Files:**
- Create: `src/lib/categories.ts`

- [ ] **Step 1: Create categories configuration file**

```typescript
// src/lib/categories.ts

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
```

- [ ] **Step 2: Commit category configuration**

```bash
git add src/lib/categories.ts
git commit -m "feat(category): add category configuration and metadata"
```

---

### Task 2: Create Empty State Component

**Files:**
- Create: `src/components/category/category-empty.tsx`

- [ ] **Step 1: Create empty state component**

```typescript
// src/components/category/category-empty.tsx
import Link from 'next/link';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CategoryEmptyProps = {
  categoryName: string;
};

export function CategoryEmpty({ categoryName }: CategoryEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      {/* Icon */}
      <div className="mb-6">
        <Package className="h-16 w-16 text-muted-foreground/40" strokeWidth={1.5} />
      </div>

      {/* Primary message */}
      <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-3">
        Aucun produit dans cette catégorie
      </h2>

      {/* Secondary message */}
      <p className="text-muted-foreground text-base md:text-lg mb-8 max-w-md">
        Revenez bientôt pour découvrir nos nouveautés !
      </p>

      {/* Call to action */}
      <Button asChild size="lg" className="rounded-xl">
        <Link href="/">Voir toute la collection</Link>
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Commit empty state component**

```bash
git add src/components/category/category-empty.tsx
git commit -m "feat(category): add empty state component"
```

---

### Task 3: Create Category Header Component

**Files:**
- Create: `src/components/category/category-header.tsx`

- [ ] **Step 1: Read SectionHeading component for word-reveal pattern**

Read: `src/components/ui/section-heading.tsx`

Purpose: Understand the word-reveal animation implementation to replicate it in CategoryHeader.

- [ ] **Step 2: Create category header component with word-reveal animation**

```typescript
// src/components/category/category-header.tsx
'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

type CategoryHeaderProps = {
  title: string;
  description: string;
};

export function CategoryHeader({ title, description }: CategoryHeaderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Split title into words for stagger animation
  const words = title.split(' ');

  return (
    <div ref={ref} className="container mx-auto px-4 py-12 md:py-16 text-center">
      {/* Animated title with word reveal */}
      <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
        {words.map((word, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{
              duration: 0.5,
              delay: i * 0.07,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="inline-block mr-2"
          >
            {word}
          </motion.span>
        ))}
      </h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{
          duration: 0.6,
          delay: words.length * 0.07 + 0.2,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto"
      >
        {description}
      </motion.p>
    </div>
  );
}
```

- [ ] **Step 3: Commit category header component**

```bash
git add src/components/category/category-header.tsx
git commit -m "feat(category): add header component with word-reveal animation"
```

---

### Task 4: Create Category Page Component

**Files:**
- Create: `src/components/category/category-page.tsx`

- [ ] **Step 1: Read BentoProductGrid to understand props and usage**

Read: `src/components/product/bento-product-grid.tsx`

Purpose: Confirm the Product type and how to pass products to BentoProductGrid.

- [ ] **Step 2: Create category page component**

```typescript
// src/components/category/category-page.tsx
import { CategoryHeader } from './category-header';
import { CategoryEmpty } from './category-empty';
import { BentoProductGrid } from '@/components/product/bento-product-grid';
import type { CategoryConfig } from '@/lib/categories';
import type { Product } from '@/types/product';

type CategoryPageProps = {
  config: CategoryConfig;
  products: Product[];
};

export function CategoryPage({ config, products }: CategoryPageProps) {
  return (
    <div className="min-h-screen">
      {/* Header with title and description */}
      <CategoryHeader title={config.title} description={config.description} />

      {/* Products or empty state */}
      <div className="container mx-auto px-4 pb-16 md:pb-24">
        {products.length === 0 ? (
          <CategoryEmpty categoryName={config.title} />
        ) : (
          <BentoProductGrid products={products} />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit category page component**

```bash
git add src/components/category/category-page.tsx
git commit -m "feat(category): add shared category page component"
```

---

### Task 5: Create Collection Page

**Files:**
- Create: `src/app/collection/page.tsx`

- [ ] **Step 1: Create collection page**

```typescript
// src/app/collection/page.tsx
import { getActiveProducts } from '@/lib/products';
import { getCategoryConfig } from '@/lib/categories';
import { CategoryPage } from '@/components/category/category-page';
import type { Metadata } from 'next';

const config = getCategoryConfig('collection')!;

export const metadata: Metadata = {
  title: config.metaTitle,
  description: config.metaDescription,
};

export default async function CollectionPage() {
  // Fetch all active products
  const allProducts = await getActiveProducts();

  // Filter by 'collection' tag
  const categoryProducts = allProducts.filter((p) =>
    p.tags?.includes('collection')
  );

  return <CategoryPage config={config} products={categoryProducts} />;
}
```

- [ ] **Step 2: Verify page builds without errors**

Run: `npm run build`

Expected: Build succeeds without errors

- [ ] **Step 3: Commit collection page**

```bash
git add src/app/collection/page.tsx
git commit -m "feat(category): add collection category page"
```

---

### Task 6: Create Editions Page

**Files:**
- Create: `src/app/editions/page.tsx`

- [ ] **Step 1: Create editions page**

```typescript
// src/app/editions/page.tsx
import { getActiveProducts } from '@/lib/products';
import { getCategoryConfig } from '@/lib/categories';
import { CategoryPage } from '@/components/category/category-page';
import type { Metadata } from 'next';

const config = getCategoryConfig('editions')!;

export const metadata: Metadata = {
  title: config.metaTitle,
  description: config.metaDescription,
};

export default async function EditionsPage() {
  // Fetch all active products
  const allProducts = await getActiveProducts();

  // Filter by 'editions' tag
  const categoryProducts = allProducts.filter((p) =>
    p.tags?.includes('editions')
  );

  return <CategoryPage config={config} products={categoryProducts} />;
}
```

- [ ] **Step 2: Verify page builds without errors**

Run: `npm run build`

Expected: Build succeeds without errors

- [ ] **Step 3: Commit editions page**

```bash
git add src/app/editions/page.tsx
git commit -m "feat(category): add editions category page"
```

---

### Task 7: Create Artisans Page

**Files:**
- Create: `src/app/artisans/page.tsx`

- [ ] **Step 1: Create artisans page**

```typescript
// src/app/artisans/page.tsx
import { getActiveProducts } from '@/lib/products';
import { getCategoryConfig } from '@/lib/categories';
import { CategoryPage } from '@/components/category/category-page';
import type { Metadata } from 'next';

const config = getCategoryConfig('artisans')!;

export const metadata: Metadata = {
  title: config.metaTitle,
  description: config.metaDescription,
};

export default async function ArtisansPage() {
  // Fetch all active products
  const allProducts = await getActiveProducts();

  // Filter by 'artisans' tag
  const categoryProducts = allProducts.filter((p) =>
    p.tags?.includes('artisans')
  );

  return <CategoryPage config={config} products={categoryProducts} />;
}
```

- [ ] **Step 2: Verify page builds without errors**

Run: `npm run build`

Expected: Build succeeds without errors

- [ ] **Step 3: Commit artisans page**

```bash
git add src/app/artisans/page.tsx
git commit -m "feat(category): add artisans category page"
```

---

### Task 8: Create Atelier Page

**Files:**
- Create: `src/app/atelier/page.tsx`

- [ ] **Step 1: Create atelier page**

```typescript
// src/app/atelier/page.tsx
import { getActiveProducts } from '@/lib/products';
import { getCategoryConfig } from '@/lib/categories';
import { CategoryPage } from '@/components/category/category-page';
import type { Metadata } from 'next';

const config = getCategoryConfig('atelier')!;

export const metadata: Metadata = {
  title: config.metaTitle,
  description: config.metaDescription,
};

export default async function AtelierPage() {
  // Fetch all active products
  const allProducts = await getActiveProducts();

  // Filter by 'atelier' tag
  const categoryProducts = allProducts.filter((p) =>
    p.tags?.includes('atelier')
  );

  return <CategoryPage config={config} products={categoryProducts} />;
}
```

- [ ] **Step 2: Verify page builds without errors**

Run: `npm run build`

Expected: Build succeeds without errors

- [ ] **Step 3: Commit atelier page**

```bash
git add src/app/atelier/page.tsx
git commit -m "feat(category): add atelier category page"
```

---

### Task 9: Manual Testing

**Files:**
- None (testing only)

- [ ] **Step 1: Start development server**

Run: `npm run dev`

Expected: Server starts on http://localhost:3000

- [ ] **Step 2: Test collection page navigation**

Actions:
1. Open http://localhost:3000
2. Click hamburger menu icon
3. Click "Collection" link
4. Verify page loads at /collection
5. Verify CategoryHeader displays "La Collection" with description
6. Verify products display or empty state shows

Expected: Page loads correctly, appropriate content displays

- [ ] **Step 3: Test editions page navigation**

Actions:
1. From menu, click "Éditions" link
2. Verify page loads at /editions
3. Verify CategoryHeader displays "Éditions Limitées" with description
4. Verify products display or empty state shows

Expected: Page loads correctly, appropriate content displays

- [ ] **Step 4: Test artisans page navigation**

Actions:
1. From menu, click "Artisans" link
2. Verify page loads at /artisans
3. Verify CategoryHeader displays "Nos Artisans" with description
4. Verify products display or empty state shows

Expected: Page loads correctly, appropriate content displays

- [ ] **Step 5: Test atelier page navigation**

Actions:
1. From menu, click "L'Atelier" link
2. Verify page loads at /atelier
3. Verify CategoryHeader displays "L'Atelier" with description
4. Verify products display or empty state shows

Expected: Page loads correctly, appropriate content displays

- [ ] **Step 6: Test direct URL access**

Actions:
1. Navigate directly to http://localhost:3000/collection
2. Navigate directly to http://localhost:3000/editions
3. Navigate directly to http://localhost:3000/artisans
4. Navigate directly to http://localhost:3000/atelier

Expected: All pages load correctly via direct URL access

- [ ] **Step 7: Test empty state button**

Actions (if empty state displays):
1. Click "Voir toute la collection" button
2. Verify navigation to homepage (/)

Expected: Button navigates to homepage

- [ ] **Step 8: Test responsive design**

Actions:
1. Open DevTools and switch to mobile viewport (375px)
2. Navigate through all 4 category pages
3. Verify layout adapts to mobile
4. Switch to tablet viewport (768px)
5. Navigate through all 4 category pages
6. Verify layout adapts to tablet

Expected: All pages are fully responsive

- [ ] **Step 9: Test word-reveal animation**

Actions:
1. Open /collection page
2. Scroll to top to trigger animation
3. Verify title words animate in with stagger effect
4. Verify description fades in after title

Expected: Smooth word-reveal animation plays on page load

- [ ] **Step 10: Test product filtering**

Actions (requires products with tags in database):
1. In admin, add 'collection' tag to at least one product
2. Visit /collection
3. Verify product appears
4. Add 'editions' tag to same product
5. Visit /editions
6. Verify product appears on both pages

Expected: Products with multiple tags appear on multiple category pages

---

### Task 10: Final Build and Commit

**Files:**
- None (verification only)

- [ ] **Step 1: Run production build**

Run: `npm run build`

Expected: Build completes successfully with no errors or warnings

- [ ] **Step 2: Start production server locally**

Run: `npm run start`

Expected: Server starts and all pages accessible

- [ ] **Step 3: Quick smoke test in production mode**

Actions:
1. Visit all 4 category pages
2. Verify all pages render correctly
3. Verify no console errors

Expected: All pages work correctly in production build

- [ ] **Step 4: Create final summary commit**

```bash
git add -A
git commit -m "feat(category): complete category pages implementation

- Add 4 category pages: collection, editions, artisans, atelier
- Server-side filtering by product tags
- Shared component architecture (CategoryPage, CategoryHeader, CategoryEmpty)
- Word-reveal animations for titles
- Empty state handling
- SEO metadata per page
- Fully responsive design
- Reuses existing BentoProductGrid component"
```

- [ ] **Step 5: Push to repository**

Run: `git push origin main`

Expected: Changes pushed successfully

---

## Implementation Complete

All 4 category pages are now live and functional:
- ✅ /collection - Displays products tagged with 'collection'
- ✅ /editions - Displays products tagged with 'editions'
- ✅ /artisans - Displays products tagged with 'artisans'
- ✅ /atelier - Displays products tagged with 'atelier'

**Next steps:**
- Admin can now add category tags to products via the admin interface
- Products will automatically appear on the appropriate category pages
- Menu navigation from DrawerMenu now works without 404 errors
