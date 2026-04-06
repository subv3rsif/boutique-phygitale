# Category Pages Implementation Design

> **For agentic workers:** This spec should be implemented using the writing-plans skill to create a detailed implementation plan, followed by execution via subagent-driven-development or executing-plans.

**Goal:** Create 4 category-filtered product listing pages (/collection, /editions, /artisans, /atelier) that display products from the database filtered by their respective tag values.

**Architecture:** Server-side rendered Next.js pages with shared component logic. Each page filters active products by category tag and displays them using the existing BentoProductGrid component.

**Tech Stack:** Next.js 15 App Router (Server Components), Drizzle ORM, existing BentoProductGrid component, Tailwind CSS + Framer Motion

---

## 1. Architecture Overview

### Core Approach
- **4 separate page files**: `/collection/page.tsx`, `/editions/page.tsx`, `/artisans/page.tsx`, `/atelier/page.tsx`
- **Shared component logic**: All pages use a common `<CategoryPage>` component
- **Server-side filtering**: Products are fetched and filtered on the server using existing `getActiveProducts()` function
- **Tag-based filtering**: Each page filters products where `product.tags?.includes(categoryTag)`
- **Reuse existing UI**: The `<BentoProductGrid>` component handles all product display

### Why This Architecture
- Server-side rendering provides optimal SEO
- No additional client-side JavaScript needed
- Reuses proven patterns (getActiveProducts, BentoProductGrid)
- Clear file structure shows all available routes
- Centralized logic prevents code duplication
- Allows per-category customization if needed later

### Data Flow
```
User navigates to /collection
→ Next.js Server Component loads
→ Calls getActiveProducts() from database
→ Filters products: p.tags?.includes('collection')
→ Passes filtered products to CategoryPage
→ CategoryPage renders header + BentoProductGrid
→ HTML sent to client (fully rendered)
```

## 2. File Structure

### New Files

```
src/
├── app/
│   ├── collection/
│   │   └── page.tsx              # Collection category page
│   ├── editions/
│   │   └── page.tsx              # Limited Editions category page
│   ├── artisans/
│   │   └── page.tsx              # Artisans category page
│   └── atelier/
│       └── page.tsx              # L'Atelier category page
├── components/
│   └── category/
│       ├── category-page.tsx      # Shared category page component
│       ├── category-header.tsx    # Category header with title + description
│       └── category-empty.tsx     # Empty state component
└── lib/
    └── categories.ts              # Category configuration and metadata
```

### Modified Files
- None! All existing code remains untouched

### Why This Structure
- Explicit page files make routes clear and discoverable
- Shared components in `/components/category/` prevent duplication
- Configuration file (`categories.ts`) centralizes metadata management
- Clean separation between routing (pages) and presentation (components)

## 3. Components and Responsibilities

### 3.1 Category Configuration (`src/lib/categories.ts`)

Central configuration file that maps each category to its metadata:

```typescript
export type CategoryConfig = {
  slug: string;           // URL slug: 'collection', 'editions', etc.
  tag: string;            // Product tag to filter: 'collection', 'editions', etc.
  title: string;          // Display title: "La Collection"
  description: string;    // 1-2 sentence description
  metaTitle: string;      // SEO title
  metaDescription: string; // SEO description
};

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

// Helper to get category config
export function getCategoryConfig(slug: string): CategoryConfig | undefined {
  return categories[slug];
}
```

### 3.2 Category Page Component (`src/components/category/category-page.tsx`)

Shared component that handles layout and empty states:

**Props:**
- `config: CategoryConfig` - Category metadata
- `products: Product[]` - Filtered products to display

**Responsibilities:**
- Render category header with title and description
- Display products using `<BentoProductGrid>`
- Show empty state if no products found
- Handle animations (reuse existing patterns)

**Behavior:**
- If `products.length === 0`: Show `<CategoryEmpty>`
- If `products.length > 0`: Show `<CategoryHeader>` + `<BentoProductGrid>`

### 3.3 Category Header (`src/components/category/category-header.tsx`)

Simple header component with title and description:

**Props:**
- `title: string`
- `description: string`

**Features:**
- Animated title using word-reveal pattern (like existing SectionHeading)
- Centered layout with max-width
- Spacing consistent with site design

### 3.4 Empty State (`src/components/category/category-empty.tsx`)

Displayed when no products match the category:

**Design:**
```
┌────────────────────────────────────────┐
│         [Icon - Package or Box]        │
│                                        │
│  Aucun produit dans cette catégorie   │
│                                        │
│  Revenez bientôt pour découvrir       │
│  nos nouveautés !                     │
│                                        │
│  [Bouton: Voir toute la collection]   │
└────────────────────────────────────────┘
```

**Props:**
- `categoryName: string` - For personalized message

**Features:**
- Centered layout
- Icon from lucide-react (Package, Box, or Layers)
- Button links to homepage (/)
- Soft colors, not alarming (it's not an error)

### 3.5 Individual Pages

Each page file (e.g., `src/app/collection/page.tsx`):

**Structure:**
```typescript
import { getActiveProducts } from '@/lib/products';
import { getCategoryConfig } from '@/lib/categories';
import { CategoryPage } from '@/components/category/category-page';

export const metadata = {
  title: 'La Collection - 1885 Manufacture',
  description: '...',
};

export default async function CollectionPage() {
  // Fetch all active products
  const allProducts = await getActiveProducts();

  // Filter by tag
  const categoryProducts = allProducts.filter(p =>
    p.tags?.includes('collection')
  );

  // Get category config
  const config = getCategoryConfig('collection')!;

  return <CategoryPage config={config} products={categoryProducts} />;
}
```

**Responsibilities:**
- Define Next.js metadata for SEO
- Fetch products server-side
- Filter by category tag
- Pass data to shared component
- No client-side logic needed (pure Server Component)

## 4. Data Flow and Filtering

### Filtering Logic

**Products with multiple tags appear on multiple pages:**
- Product with `tags: ['collection', 'artisans']` appears on both `/collection` AND `/artisans`
- No data duplication - just different filtered views
- Filtering is strict: `p.tags?.includes(categoryTag)` must return true

**Edge cases:**
1. **Product has no tags (`tags: null` or `tags: []`)**: Not displayed on any category page
2. **Product has unrelated tags**: Not displayed on category pages, only homepage
3. **Product has only one matching tag**: Appears only on that category page
4. **Product is inactive**: Never displayed (filtered by `getActiveProducts()`)

### Query Performance

- Single query: `getActiveProducts()` fetches all active products once
- Filtering happens in-memory (fast for small catalogs <1000 products)
- No N+1 queries or per-category database hits
- Server Component = no client-side hydration cost

### Cache Behavior

- Next.js automatically caches Server Component renders
- Revalidation handled by Next.js cache strategy
- No manual cache management needed for MVP
- Future: Add ISR or cache tags if catalog grows large

## 5. Empty State Handling

### When to Show Empty State

Empty state appears when:
```typescript
categoryProducts.length === 0
```

This happens when:
- No products are tagged with this category yet
- All products with this tag are inactive
- Products exist but haven't been tagged properly

### Empty State Design

**Visual hierarchy:**
1. Icon (subtle, not alarming)
2. Primary message: "Aucun produit dans cette catégorie"
3. Secondary message: "Revenez bientôt pour découvrir nos nouveautés !"
4. Call-to-action: "Voir toute la collection" button → homepage

**Styling:**
- Centered vertically and horizontally
- Generous padding (min-height: 60vh)
- Soft colors (text-muted-foreground)
- Button uses primary brand colors
- No error styling (this is not an error state)

### User Experience

- Clear message (not confusing)
- Actionable (button to explore other products)
- Optimistic tone ("revenez bientôt")
- Not dead-end (always a path forward)

## 6. Metadata and SEO

### Per-Page Metadata

Each page exports Next.js metadata:

```typescript
export const metadata = {
  title: 'La Collection - 1885 Manufacture Alfortvillaise',
  description: 'Découvrez notre collection de produits artisanaux fabriqués à Alfortville.',
  openGraph: {
    title: 'La Collection - 1885 Manufacture',
    description: 'Des créations artisanales pensées pour incarner l\'esprit de notre manufacture.',
    images: ['/og-collection.jpg'], // Optional: category-specific OG image
  },
};
```

### SEO Benefits

- Server-side rendering = fully rendered HTML for crawlers
- Semantic HTML structure (proper headings hierarchy)
- Unique title and description per category
- Fast page load (no client-side fetching)
- Clean URLs (/collection, /editions, etc.)

### Future Enhancements (Not in MVP)

- Structured data (Product schema.org markup)
- Category-specific OG images
- Breadcrumb navigation
- Canonical URLs if needed

## 7. Animation and UX

### Reuse Existing Patterns

**From BentoProductGrid:**
- Card animations (fade-in, stagger)
- Hover effects (scale, border glow)
- Image loading states

**From SectionHeading:**
- Word-reveal animation for category title
- Smooth opacity transitions
- Stagger delays for visual interest

### Performance

- Animations use CSS transforms (GPU-accelerated)
- Framer Motion already loaded (no additional bundle size)
- Lazy loading for images (Next.js Image component)
- No layout shift during loading (skeleton states handled by BentoProductGrid)

## 8. Testing Strategy

### Manual Testing Checklist

1. **Navigation:**
   - Click menu links → pages load correctly
   - Direct URL access works
   - Back/forward browser buttons work

2. **Product Display:**
   - Products with matching tags appear
   - Products without tags don't appear
   - Products with multiple tags appear on multiple pages
   - BentoProductGrid layout works (hero + small cards)

3. **Empty State:**
   - Displays when no products match
   - Button links to homepage
   - Message is clear and helpful

4. **Responsiveness:**
   - Desktop: Bento grid layout
   - Tablet: Grid adjusts
   - Mobile: Stacked cards

5. **SEO:**
   - Page titles are unique
   - Meta descriptions present
   - HTML is semantic

### Edge Cases to Test

- Category with 1 product (only hero card)
- Category with 2-4 products (partial grid)
- Category with 10+ products (full grid + scroll)
- Category with no products (empty state)
- Product tagged with all 4 categories (appears everywhere)

## 9. Future Enhancements (Out of Scope for MVP)

Not implementing now, but designed to accommodate:

1. **Filtering/Sorting:**
   - Price range filters
   - Sort by: newest, price, popularity
   - Search within category

2. **Pagination:**
   - Load more button
   - Infinite scroll
   - URL-based pagination (?page=2)

3. **Category Customization:**
   - Hero image per category
   - Featured product spotlight
   - Custom intro section

4. **Admin Features:**
   - Bulk tag assignment
   - Tag management UI
   - Preview category pages

## 10. Success Criteria

This implementation is successful when:

✅ All 4 category pages are accessible and render correctly
✅ Products are filtered accurately by tags
✅ BentoProductGrid displays products with existing animations
✅ Empty states appear when no products match
✅ Navigation from DrawerMenu works (no 404s)
✅ SEO metadata is present and unique per page
✅ Mobile and desktop layouts work correctly
✅ Page load performance matches homepage (<2s LCP)

## 11. Implementation Notes

### Order of Implementation

1. Create `categories.ts` configuration file
2. Create `CategoryEmpty` component
3. Create `CategoryHeader` component
4. Create `CategoryPage` component
5. Create 4 individual page files
6. Test each page manually
7. Verify navigation from menu
8. Commit and deploy

### Dependencies

**Existing code (no changes needed):**
- `getActiveProducts()` - src/lib/products.ts
- `<BentoProductGrid>` - src/components/product/bento-product-grid.tsx
- Product type definitions
- Database schema (tags field already exists)

**No new packages required** - all dependencies already installed.

### Database Considerations

**Tags field usage:**
- Field: `tags: text('tags').array()` (PostgreSQL array)
- Nullable: Yes (products without tags are fine)
- Indexing: Not needed for MVP (small catalog)
- Future: Add GIN index if catalog grows large

**Existing products:**
- Products without tags won't appear on category pages
- This is expected behavior (admin can add tags later)
- No migration needed (tags field already exists)

---

## Summary

This design implements 4 category pages using a shared component architecture. Each page is a simple Server Component that filters products by tag and displays them using the existing BentoProductGrid. The solution is minimal, performant, and follows established project patterns. No breaking changes to existing code are required.
