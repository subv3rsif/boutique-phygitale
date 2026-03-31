# Phase 1: Foundation - Design System + Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace existing design system (Love Symbol + Cloud Dancer + Champagne) with new 1885 identity (Encre, Ivoire, Terra, Violet) and unify navigation with hamburger menu on desktop + mobile.

**Architecture:** Complete replacement of CSS variables and fonts, refactor Header to use single hamburger menu for all devices, update Drawer to use new design system with immersive black (encre) background. All existing pages will automatically adopt new colors via CSS variable mapping.

**Tech Stack:** Next.js 15, Tailwind CSS 4, Framer Motion 12, TypeScript, Josefin Sans + DM Sans (Google Fonts)

**Estimated Duration:** 4-5 days

**Deliverable:** Site fonctionnel avec nouvelle identité visuelle complète

---

## File Structure Overview

### Files to Modify
1. `src/app/globals.css` - Replace all CSS variables, remove old utilities, add new ones
2. `src/app/layout.tsx` - Replace fonts (Josefin Sans + DM Sans)
3. `src/components/layout/header.tsx` - Refactor to hamburger-only navigation
4. `src/components/layout/drawer-menu.tsx` - Update to encre background + new styles
5. `src/components/product/product-card.tsx` - Re-style with new colors
6. `src/components/ui/button.tsx` - No changes (auto-adapts via CSS vars)

### Files to Delete (Optional)
1. `src/styles/brand-1885-tokens.css` - Champagne gold tokens (superseded)

### No New Files
All changes are modifications to existing components.

---

## Task 1: Update CSS Variables & Remove Old Design System

**Files:**
- Modify: `src/app/globals.css:1-595`

### Step 1.1: Backup current globals.css

- [ ] **Create backup**

```bash
cp src/app/globals.css src/app/globals.css.backup
```

Expected: File copied successfully

### Step 1.2: Replace root CSS variables

- [ ] **Replace :root variables (lines 80-136 approximately)**

Open `src/app/globals.css`, find the `:root` section starting around line 80, and replace ALL existing color variables with:

```css
:root {
  --radius: 0.5rem; /* 8px - Less rounded than old (20px) */

  /* ── Palette 1885 ────────────────────────────────────────── */
  --encre:      26 22 19;      /* #1A1613 - Noir principal */
  --ivoire:     242 237 228;   /* #F2EDE4 - Fond principal */
  --terra:      197 99 57;     /* #C56339 - Accent terracotta */
  --violet:     92 62 123;     /* #5C3E7B - Accent violet */
  --pierre:     138 130 120;   /* #8A8278 - Texte secondaire */

  /* Variations ivoire */
  --ivoire-2:   228 219 208;   /* #E4DBD0 - Borders, dividers */
  --ivoire-3:   207 196 181;   /* #CFC4B5 - Hover states */

  /* Variations encre */
  --encre-2:    45 38 32;      /* #2D2620 - Encre plus clair */

  /* ── Mapping Shadcn/ui ──────────────────────────────────── */
  --background: rgb(var(--ivoire));
  --foreground: rgb(var(--encre));
  --card: rgb(var(--ivoire));
  --card-foreground: rgb(var(--encre));
  --popover: rgb(var(--ivoire));
  --popover-foreground: rgb(var(--encre));
  --primary: rgb(var(--encre));
  --primary-foreground: rgb(var(--ivoire));
  --secondary: rgb(var(--terra));
  --secondary-foreground: rgb(var(--ivoire));
  --muted: rgb(var(--ivoire-2));
  --muted-foreground: rgb(var(--pierre));
  --accent: rgb(var(--terra));
  --accent-foreground: rgb(var(--ivoire));
  --destructive: rgb(220 38 38);
  --destructive-foreground: rgb(var(--ivoire));
  --border: rgb(var(--ivoire-2));
  --input: rgb(var(--ivoire-2));
  --ring: rgb(var(--terra));

  /* Sidebar (if used) */
  --sidebar: rgb(var(--ivoire));
  --sidebar-foreground: rgb(var(--encre));
  --sidebar-primary: rgb(var(--encre));
  --sidebar-primary-foreground: rgb(var(--ivoire));
  --sidebar-accent: rgb(var(--ivoire-2));
  --sidebar-accent-foreground: rgb(var(--encre));
  --sidebar-border: rgb(var(--ivoire-2));
  --sidebar-ring: rgb(var(--terra));
}
```

### Step 1.3: Remove dark mode section

- [ ] **Delete [data-theme="dark"] and .dark sections (lines 138-170 approximately)**

Find and delete the entire dark mode block:

```css
[data-theme="dark"],
.dark {
  /* ... all content ... */
}
```

This removes all dark mode support as per design decision.

### Step 1.4: Remove old color variable declarations

- [ ] **Delete old Love Symbol, Cloud Dancer, Champagne variables (lines 84-99 approximately)**

Find and delete these variable declarations if they still exist:

```css
--love-symbol-900: ...;
--love-symbol: ...;
--cloud-dancer: ...;
--champagne: ...;
/* etc. */
```

They should already be replaced by Step 1.2, but verify none remain.

### Step 1.5: Add new utility classes

- [ ] **Add new utilities at end of utilities layer (after line 590 approximately)**

Add these new utility classes before the closing of `@layer utilities`:

```css
@layer utilities {
  /* ... existing utilities ... */

  /* ── 1885 Custom Utilities ────────────────────────────── */

  /* Text gradients */
  .text-gradient-1885 {
    background: linear-gradient(135deg, rgb(var(--encre)), rgb(var(--terra)));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Focus states */
  .focus-terra {
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--terra))] focus-visible:ring-offset-2;
  }

  /* Shadows terra */
  .shadow-terra {
    box-shadow: 0 4px 14px rgba(197, 99, 57, 0.15);
  }

  .shadow-terra-lg {
    box-shadow: 0 8px 24px rgba(197, 99, 57, 0.2);
  }

  /* Glass effect ivoire */
  .glass-1885 {
    background: rgba(242, 237, 228, 0.8);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgb(var(--ivoire-2));
  }

  /* Background utilities */
  .bg-encre {
    background-color: rgb(var(--encre));
  }

  .bg-encre-2 {
    background-color: rgb(var(--encre-2));
  }

  .bg-ivoire {
    background-color: rgb(var(--ivoire));
  }

  .bg-ivoire-2 {
    background-color: rgb(var(--ivoire-2));
  }

  .bg-ivoire-3 {
    background-color: rgb(var(--ivoire-3));
  }

  .bg-terra {
    background-color: rgb(var(--terra));
  }

  .bg-violet {
    background-color: rgb(var(--violet));
  }

  /* Text utilities */
  .text-encre {
    color: rgb(var(--encre));
  }

  .text-ivoire {
    color: rgb(var(--ivoire));
  }

  .text-terra {
    color: rgb(var(--terra));
  }

  .text-violet {
    color: rgb(var(--violet));
  }

  .text-pierre {
    color: rgb(var(--pierre));
  }

  /* Border utilities */
  .border-encre {
    border-color: rgb(var(--encre));
  }

  .border-ivoire {
    border-color: rgb(var(--ivoire));
  }

  .border-ivoire-2 {
    border-color: rgb(var(--ivoire-2));
  }

  .border-terra {
    border-color: rgb(var(--terra));
  }
}
```

### Step 1.6: Remove obsolete animations and utilities

- [ ] **Delete champagne, love, cloud utilities (search and remove)**

Search for and delete these utility classes throughout the file:
- `.champagne-*` (all variants)
- `.love-*` (except if used elsewhere)
- `.cloud-*` (all variants)
- `.gradient-border-animated`
- `.shimmer-auto`
- `.animate-grain`
- `.animate-glow`

Keep:
- `.animate-shimmer` (used in some components)
- `.grid-lines` (still useful)
- Basic fade/slide animations

### Step 1.7: Verify and test CSS changes

- [ ] **Check for syntax errors**

Run:
```bash
npm run build
```

Expected: Build succeeds, or shows CSS errors to fix

If errors: Fix syntax issues (missing semicolons, unclosed braces)

### Step 1.8: Commit CSS changes

- [ ] **Commit design system update**

```bash
git add src/app/globals.css
git commit -m "feat(design): replace design system with 1885 palette

- Remove Love Symbol, Cloud Dancer, Champagne variables
- Add Encre, Ivoire, Terra, Violet, Pierre
- Remove dark mode support
- Add new utility classes (text-gradient-1885, glass-1885, etc.)
- Update radius from 20px to 8px
- Clean up obsolete animations and utilities"
```

---

## Task 2: Update Typography (Fonts)

**Files:**
- Modify: `src/app/layout.tsx:1-118`

### Step 2.1: Replace font imports

- [ ] **Update import statements (lines 3-4)**

Replace:
```typescript
import { Cormorant_Garamond, Work_Sans, JetBrains_Mono } from "next/font/google";
```

With:
```typescript
import { Josefin_Sans, DM_Sans, JetBrains_Mono } from "next/font/google";
```

### Step 2.2: Replace Cormorant_Garamond with Josefin_Sans

- [ ] **Replace font configuration (lines 12-18)**

Replace:
```typescript
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  style: ['normal', 'italic'],
});
```

With:
```typescript
const josefin = Josefin_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '700'],
  display: 'swap',
});
```

### Step 2.3: Replace Work_Sans with DM_Sans

- [ ] **Replace font configuration (lines 20-26)**

Replace:
```typescript
const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});
```

With:
```typescript
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500'],
  display: 'swap',
});
```

### Step 2.4: Keep JetBrains_Mono unchanged

- [ ] **Verify mono font is unchanged (lines 28-34)**

JetBrains_Mono should remain as-is:
```typescript
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
  display: 'swap',
});
```

### Step 2.5: Update body className

- [ ] **Update font variable references (line 92)**

Replace:
```typescript
<body className={`${cormorant.variable} ${workSans.variable} ${jetbrains.variable} font-sans antialiased`}>
```

With:
```typescript
<body className={`${josefin.variable} ${dmSans.variable} ${jetbrains.variable} font-sans antialiased`}>
```

### Step 2.6: Test font loading

- [ ] **Verify fonts load correctly**

Run:
```bash
npm run dev
```

Open browser to `http://localhost:3000`
Open DevTools → Network → Filter "font"
Expected: See `Josefin_Sans` and `DM_Sans` loading

### Step 2.7: Commit font changes

- [ ] **Commit typography update**

```bash
git add src/app/layout.tsx
git commit -m "feat(design): replace fonts with Josefin Sans + DM Sans

- Replace Cormorant Garamond with Josefin Sans (display)
- Replace Work Sans with DM Sans (sans-serif)
- Keep JetBrains Mono for technical content
- Update body className to use new font variables"
```

---

## Task 3: Refactor Header to Unified Hamburger Navigation

**Files:**
- Modify: `src/components/layout/header.tsx:1-250`

### Step 3.1: Backup current header

- [ ] **Create backup**

```bash
cp src/components/layout/header.tsx src/components/layout/header.tsx.backup
```

### Step 3.2: Update imports

- [ ] **Replace imports (lines 1-14)**

Replace entire import section with:

```typescript
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DrawerMenu } from './drawer-menu';
import { cn } from '@/lib/utils';
```

Remove unused imports: `Search`, `User`, `useTheme`, `ThemeProvider`, `FloatingMenuButton`

### Step 3.3: Simplify Header component structure

- [ ] **Replace entire Header function (lines 16-250)**

Replace with:

```typescript
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const totalItems = useCart((state) => state.totalItems());

  // Detect scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 border-b",
          isScrolled
            ? "glass-1885 shadow-terra h-16 md:h-20"
            : "bg-ivoire border-ivoire-2 h-16 md:h-24"
        )}
      >
        <div className="w-full max-w-7xl mx-auto h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Left: Hamburger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(true)}
            className={cn(
              "text-pierre hover:text-encre transition-colors focus-terra",
              isScrolled ? "h-10 w-10" : "h-12 w-12"
            )}
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* Center: Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 focus-terra">
            {/* Desktop: Full logo */}
            <div className="hidden md:block text-center">
              <div className="flex items-center gap-3 justify-center mb-1">
                <span className={cn(
                  "font-display font-bold text-encre transition-all",
                  isScrolled ? "text-3xl" : "text-5xl"
                )}>
                  18
                </span>
                <div className={cn(
                  "h-px bg-ivoire-2 transition-all",
                  isScrolled ? "w-8" : "w-12"
                )} />
                <span className={cn(
                  "font-display font-bold text-encre transition-all",
                  isScrolled ? "text-3xl" : "text-5xl"
                )}>
                  85
                </span>
              </div>
              {!isScrolled && (
                <p className="text-[10px] tracking-[0.3em] uppercase text-pierre">
                  Manufacture Alfortvillaise
                </p>
              )}
            </div>

            {/* Mobile: Compact logo */}
            <div className="md:hidden font-display font-bold text-3xl text-encre">
              1885
            </div>
          </Link>

          {/* Right: Cart */}
          <Link href="/panier" className="relative focus-terra">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "text-pierre hover:text-encre transition-colors relative",
                isScrolled ? "h-10 w-10" : "h-12 w-12"
              )}
              aria-label="Panier"
            >
              <ShoppingBag className="h-6 w-6" />

              {/* Badge count */}
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Badge className="h-5 w-5 flex items-center justify-center p-0 rounded-full bg-terra text-ivoire border-2 border-background font-bold text-xs">
                      {totalItems > 9 ? '9+' : totalItems}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </Link>
        </div>
      </header>

      {/* Drawer Menu */}
      <DrawerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </>
  );
}
```

### Step 3.4: Verify header compiles

- [ ] **Check TypeScript compilation**

Run:
```bash
npm run type-check
```

Expected: No TypeScript errors in header.tsx

If errors: Fix type issues (likely DrawerMenu props)

### Step 3.5: Test header visually

- [ ] **Visual verification**

Run:
```bash
npm run dev
```

Open browser to `http://localhost:3000`
Verify:
- ✅ Hamburger icon visible left
- ✅ Logo centered (desktop: "18 — 85", mobile: "1885")
- ✅ Cart icon visible right with badge if items > 0
- ✅ Sticky behavior works (header shrinks on scroll)
- ✅ Click hamburger opens drawer (will be updated in Task 4)

### Step 3.6: Commit header refactor

- [ ] **Commit navigation update**

```bash
git add src/components/layout/header.tsx
git commit -m "feat(nav): refactor header to unified hamburger navigation

- Remove desktop-only navigation links
- Add hamburger menu button (desktop + mobile)
- Center logo (18 — 85 desktop, 1885 mobile)
- Simplify cart button with terra badge
- Update scroll behavior (shrink on scroll > 50px)
- Remove unused theme toggle and search
- Apply new color scheme (ivoire, encre, terra)"
```

---

## Task 4: Update Drawer Menu with New Design

**Files:**
- Modify: `src/components/layout/drawer-menu.tsx:1-end`

### Step 4.1: Read current drawer implementation

- [ ] **Review current drawer-menu.tsx**

Run:
```bash
cat src/components/layout/drawer-menu.tsx | head -50
```

Note: We need to see current structure to update it properly

### Step 4.2: Update drawer props and remove theme

- [ ] **Simplify component props (lines 1-20 approximately)**

Replace props interface:

```typescript
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DrawerMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};
```

Remove `theme` and `onToggleTheme` props (no longer needed)

### Step 4.3: Replace drawer content with new design

- [ ] **Replace entire drawer component body**

Replace the entire component function with:

```typescript
export function DrawerMenu({ isOpen, onClose }: DrawerMenuProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/collection', label: 'Collection' },
    { href: '/editions', label: 'Éditions' },
    { href: '/artisans', label: 'Artisans' },
    { href: '/atelier', label: "L'Atelier" },
  ];

  const footerLinks = [
    { href: '/mentions-legales', label: 'Mentions légales' },
    { href: '/cgv', label: 'CGV' },
    { href: '/politique-confidentialite', label: 'Politique de confidentialité' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay (desktop only) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="hidden md:block fixed inset-0 bg-encre/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "fixed inset-y-0 left-0 z-50 bg-encre overflow-y-auto",
              "w-full md:w-96"
            )}
          >
            <div className="h-full p-8 md:p-12 flex flex-col">

              {/* Logo grand format */}
              <div className="mb-16">
                <div className="flex items-center gap-4 mb-3">
                  <span className="font-display font-bold text-7xl md:text-8xl text-ivoire">
                    18
                  </span>
                  <div className="h-px flex-1 bg-ivoire-2" />
                  <span className="font-display font-bold text-7xl md:text-8xl text-ivoire">
                    85
                  </span>
                </div>
                <p className="text-xs tracking-[0.35em] uppercase text-pierre text-center">
                  Manufacture Alfortvillaise
                </p>
              </div>

              {/* Navigation principale */}
              <nav className="space-y-6 flex-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className={cn(
                      "block font-display text-4xl md:text-5xl font-bold transition-colors",
                      pathname === link.href
                        ? "text-terra"
                        : "text-ivoire hover:text-terra"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Divider */}
              <div className="h-px bg-ivoire-2 my-12" />

              {/* Links secondaires */}
              <nav className="space-y-3">
                {footerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className="block text-sm text-pierre hover:text-ivoire transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Bouton fermeture */}
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="absolute top-6 right-6 text-ivoire hover:text-terra h-12 w-12"
                aria-label="Fermer le menu"
              >
                <X className="w-8 h-8" />
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

### Step 4.4: Test drawer functionality

- [ ] **Visual and interaction test**

Run:
```bash
npm run dev
```

Open `http://localhost:3000`

Test:
- ✅ Click hamburger → drawer slides from left
- ✅ Drawer background is black (encre)
- ✅ Logo "18 — 85" in large format at top
- ✅ 4 main nav links in large Josefin Sans Bold
- ✅ Active link is terra color
- ✅ Footer links are small and grey (pierre)
- ✅ Click X or overlay → drawer closes
- ✅ Mobile: drawer is full width
- ✅ Desktop: drawer is 384px wide with overlay

### Step 4.5: Commit drawer update

- [ ] **Commit drawer redesign**

```bash
git add src/components/layout/drawer-menu.tsx
git commit -m "feat(nav): redesign drawer menu with new 1885 identity

- Replace light drawer with dark encre background
- Add large 18 — 85 logo at top
- Update navigation links (Collection, Éditions, Artisans, Atelier)
- Style active link with terra color
- Add divider and footer links
- Remove theme toggle functionality
- Update animations and transitions
- Apply responsive styles (full width mobile, 384px desktop)"
```

---

## Task 5: Update ProductCard Styling

**Files:**
- Modify: `src/components/product/product-card.tsx:1-264`

### Step 5.1: Update ProductCard colors

- [ ] **Update hover border color (line 74 approximately)**

Find:
```typescript
className={cn(
  "group relative flex flex-col h-full overflow-hidden rounded-lg",
  "bg-card border border-border",
  "transition-all duration-300",
  "hover:border-primary/50 hover:card-shadow-lg focus-within:ring-2 focus-within:ring-primary"
)}
```

Replace with:
```typescript
className={cn(
  "group relative flex flex-col h-full overflow-hidden rounded-lg",
  "bg-card border border-border",
  "transition-all duration-300",
  "hover:border-terra/50 focus-within:ring-2 focus-within:ring-terra"
)}
```

### Step 5.2: Update badge color

- [ ] **Update category badge (lines 120-129 approximately)**

Find the badge component in the image section:

```typescript
<span className="bg-terra text-ivoire text-xs px-3 py-1 rounded font-semibold uppercase tracking-wider">
  {product.tags[0]}
</span>
```

Should already be terra, but verify.

### Step 5.3: Add "Atelier · Alfortville" overlay

- [ ] **Add location mention (after category badge, around line 130)**

Add new overlay div inside the image section, after the category badge:

```typescript
{/* Mention lieu overlay */}
<div className="absolute bottom-3 right-3">
  <span className="text-ivoire text-[9px] tracking-[0.15em] uppercase bg-encre/60 backdrop-blur-sm px-2 py-1 rounded">
    Atelier · Alfortville
  </span>
</div>
```

### Step 5.4: Update CTA button colors

- [ ] **Update add to cart button (lines 200-205 approximately)**

Find the button className and update:

Replace:
```typescript
className={cn(
  "w-full relative overflow-hidden",
  "bg-primary text-primary-foreground hover:bg-primary/90",
  // ...
)}
```

With:
```typescript
className={cn(
  "w-full relative overflow-hidden",
  "bg-encre text-ivoire hover:bg-encre-2",
  "font-semibold transition-all duration-300",
  "disabled:opacity-50 disabled:cursor-not-allowed",
  "focus-terra"
)}
```

### Step 5.5: Update "Ajouter →" link color

- [ ] **Update add link in details section (around line 185)**

Find the "Ajouter" link and update:

```typescript
<button
  onClick={() => addItem(product.id, 1)}
  className="text-terra text-sm font-medium hover:underline"
>
  Ajouter →
</button>
```

### Step 5.6: Test ProductCard appearance

- [ ] **Visual verification**

Run:
```bash
npm run dev
```

Navigate to homepage

Verify ProductCard:
- ✅ Border hover is terra (not primary)
- ✅ Category badge is terra with white text
- ✅ "Atelier · Alfortville" visible bottom-right
- ✅ "Ajouter au panier" button is black (encre)
- ✅ "Ajouter →" link is terracotta
- ✅ Focus ring is terra

### Step 5.7: Commit ProductCard update

- [ ] **Commit card styling**

```bash
git add src/components/product/product-card.tsx
git commit -m "feat(ui): update ProductCard with new 1885 colors

- Change hover border from primary to terra
- Update button from primary to encre background
- Add 'Atelier · Alfortville' location overlay
- Update CTA link to terra color
- Update focus ring to terra
- Maintain all existing functionality"
```

---

## Task 6: Delete Obsolete Champagne Tokens File

**Files:**
- Delete: `src/styles/brand-1885-tokens.css`

### Step 6.1: Verify file is no longer imported

- [ ] **Check for imports**

Run:
```bash
grep -r "brand-1885-tokens" src/
```

Expected: Should only show in `src/app/globals.css` import (line 3)

### Step 6.2: Remove import from globals.css

- [ ] **Remove import statement**

Open `src/app/globals.css`, find line 3:
```css
@import "../styles/brand-1885-tokens.css";
```

Delete this line completely.

### Step 6.3: Delete the file

- [ ] **Remove champagne tokens file**

```bash
rm src/styles/brand-1885-tokens.css
```

Expected: File deleted

### Step 6.4: Verify build still works

- [ ] **Test build**

Run:
```bash
npm run build
```

Expected: Build succeeds without errors

### Step 6.5: Commit file deletion

- [ ] **Commit cleanup**

```bash
git add src/app/globals.css src/styles/
git commit -m "chore: remove obsolete champagne tokens file

- Delete src/styles/brand-1885-tokens.css (superseded by new variables)
- Remove import from globals.css
- Champagne gold utilities no longer needed"
```

---

## Task 7: Smoke Test All Existing Pages

**Files:**
- No file changes
- Testing only

### Step 7.1: Test homepage

- [ ] **Navigate and verify**

Run:
```bash
npm run dev
```

Open `http://localhost:3000`

Verify:
- ✅ Page loads without errors
- ✅ Background is ivoire (light beige)
- ✅ Text is encre (dark)
- ✅ Header visible with new navigation
- ✅ Products display with new ProductCard style

### Step 7.2: Test cart page

- [ ] **Navigate to /panier**

Open `http://localhost:3000/panier`

Verify:
- ✅ Page loads
- ✅ Colors updated
- ✅ Buttons are encre/terra
- ✅ No broken styles

### Step 7.3: Test product detail page

- [ ] **Navigate to /produit/[id]**

Click any product from homepage

Verify:
- ✅ Page loads
- ✅ Product details visible
- ✅ Add to cart button styled correctly
- ✅ No console errors

### Step 7.4: Test admin page (if logged in)

- [ ] **Navigate to /admin**

Open `http://localhost:3000/admin` (or /admin/orders)

Verify:
- ✅ Page loads (or redirects to login)
- ✅ Admin UI colors updated
- ✅ Tables and buttons styled correctly

If not logged in, verify login page uses new colors.

### Step 7.5: Test responsive (mobile)

- [ ] **Test mobile breakpoints**

Open DevTools → Toggle device toolbar → Select iPhone or similar

Verify:
- ✅ Header compact (hamburger + logo + cart)
- ✅ Drawer opens full screen
- ✅ ProductCards stack vertically
- ✅ All interactions work on mobile

### Step 7.6: Test dark mode is disabled

- [ ] **Verify no dark mode toggle**

Check:
- ✅ No dark mode toggle in UI
- ✅ Page stays light (ivoire background) regardless of OS setting
- ✅ No flickering on load

### Step 7.7: Document any visual issues

- [ ] **Create issue list if needed**

If any pages have broken styles or colors:
1. Take screenshot
2. Note the page URL
3. Note the specific issue
4. Create GitHub issue or document in TESTING.md

For this commit, we accept minor issues to be fixed in follow-up.

---

## Task 8: Final Build & Deploy Verification

**Files:**
- No file changes
- Build verification

### Step 8.1: Clean build test

- [ ] **Full production build**

```bash
rm -rf .next
npm run build
```

Expected: Build completes without errors

If errors: Fix TypeScript/build issues before proceeding

### Step 8.2: Test production build locally

- [ ] **Run production server**

```bash
npm run start
```

Open `http://localhost:3000`

Verify:
- ✅ All pages load correctly
- ✅ Fonts load (check Network tab)
- ✅ CSS is minified and correct
- ✅ No console errors
- ✅ Animations work smoothly

### Step 8.3: Performance check

- [ ] **Lighthouse audit**

Open DevTools → Lighthouse
Run audit on homepage

Target scores:
- Performance: > 85
- Accessibility: > 95
- Best Practices: > 90

Note: Scores may vary, but should be comparable to before.

### Step 8.4: Create summary commit

- [ ] **Final Phase 1 summary commit**

```bash
git add -A
git commit -m "feat: complete Phase 1 - Foundation (Design System + Navigation)

Phase 1 Complete - New 1885 Identity Applied

✅ Design System:
- Replaced Love Symbol + Cloud Dancer + Champagne with Encre + Ivoire + Terra + Violet
- Updated all CSS variables in globals.css
- Changed border-radius from 20px to 8px
- Added new utilities (glass-1885, text-gradient-1885, shadow-terra)
- Removed dark mode support

✅ Typography:
- Replaced Cormorant Garamond with Josefin Sans (display)
- Replaced Work Sans with DM Sans (sans-serif)
- Kept JetBrains Mono for technical content

✅ Navigation:
- Unified hamburger menu (desktop + mobile)
- Redesigned drawer with encre background
- Updated navigation links (Collection, Éditions, Artisans, Atelier)
- Centered logo (18 — 85 desktop, 1885 mobile)
- Simplified cart button with terra badge

✅ Components:
- Updated ProductCard with terra accents
- Added 'Atelier · Alfortville' location overlay
- Updated button colors (encre/terra)

✅ Cleanup:
- Removed champagne tokens file
- Removed obsolete utilities and animations

All existing pages now use new design system automatically via CSS variables.

Duration: 4-5 days
Next: Phase 2 - Homepage Refonte (7 sections)"
```

### Step 8.5: Push to repository

- [ ] **Push Phase 1 to remote**

```bash
git push origin main
```

Expected: Push succeeds

### Step 8.6: Create deployment

- [ ] **Deploy to Vercel staging (if configured)**

If using Vercel:
```bash
vercel --prod
```

Or push to `main` branch to trigger auto-deploy.

Verify deployment URL loads correctly with new design.

---

## Post-Task Checklist

After completing all tasks, verify:

- [ ] All 8 tasks completed and committed
- [ ] Build passes (`npm run build`)
- [ ] Type check passes (`npm run type-check`)
- [ ] No console errors on homepage
- [ ] All existing pages still functional
- [ ] New design system visible throughout site
- [ ] Header hamburger works on desktop + mobile
- [ ] Drawer opens/closes smoothly with new design
- [ ] ProductCards display with terra accents
- [ ] Cart badge shows terra background
- [ ] Fonts load correctly (Josefin Sans + DM Sans)
- [ ] Responsive behavior intact
- [ ] Git history clean with descriptive commits

---

## Known Limitations & Future Work

**Phase 1 Scope:**
- Only updates design system and navigation
- Homepage still shows old sections (replaced in Phase 2)
- No new pages yet (Collection, Éditions, Artisans, Atelier) - Phase 3-4

**Follow-up Phases:**
- Phase 2: Homepage 7 sections (Hero 1885, Accroche, Produit héros, etc.)
- Phase 3: Pages Collection + Éditions
- Phase 4: DB schema + Pages Artisans + Atelier

**Minor issues accepted for Phase 1:**
- Some pages may have minor color inconsistencies (will be fixed incrementally)
- Animations not yet optimized for mobile (Phase 2)
- Placeholder images still using old palette (updated in Phase 2)

---

## Troubleshooting

**Build fails with CSS errors:**
- Check for unclosed braces in globals.css
- Verify all utility classes have valid Tailwind syntax
- Run `npx tailwindcss -o test.css` to debug

**Fonts not loading:**
- Check Network tab for 404s
- Verify font names are correct (Josefin_Sans, not Josefin-Sans)
- Clear `.next` folder and rebuild

**Drawer not opening:**
- Check DrawerMenu component is imported correctly in header
- Verify `isMenuOpen` state is passed correctly
- Check z-index (should be z-50)

**Colors look wrong:**
- Verify CSS variables are RGB format (no # prefix)
- Check `rgb(var(--color))` syntax
- Inspect element in DevTools to see computed values

**TypeScript errors:**
- Run `npm run type-check` to see all errors
- Verify DrawerMenuProps matches new signature
- Check imports are correct (no unused imports)

---

## Testing Notes

**Manual testing priority:**
1. Homepage (most traffic)
2. Product pages (conversion critical)
3. Cart/checkout (revenue critical)
4. Admin pages (staff workflow)

**Automated testing (future):**
- Add Playwright test for header hamburger
- Add Playwright test for drawer open/close
- Add visual regression tests for color changes

**Browser testing:**
- Chrome/Edge (primary)
- Safari (webkit compatibility)
- Firefox (verify backdrop-blur)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

---

**End of Phase 1 Implementation Plan**

**Next Steps:** Once Phase 1 is deployed and validated, proceed to Phase 2 plan (Homepage 7 sections refonte).
