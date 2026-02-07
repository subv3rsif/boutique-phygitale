# 🎨 Boutique 1885 - Design System & Frontend Implementation

## Direction Artistique

**Aesthetic**: Editorial Sombre Luxueux - Galerie d'art nocturne meets boutique de designer

**Ce qui rend cette boutique INOUBLIABLE**:
Le contraste entre l'élégance sombre quasi-galerie et les accents magenta néon qui "pulsent" au moment des actions clés.

---

## 🎨 Palette de Couleurs

### Core Colors

```css
--dust-rose: #906873      /* Chaleur subtile, surfaces claires */
--neon-magenta: #B9399B   /* Accent CTA, glow en dark mode */
--royal-plum: #4B1E59     /* Profondeur, titres, accents secondaires */
--deep-indigo: #271E46    /* Fonds sombres, drawer */
--ink-navy: #1D192E       /* Ultra sombre */
--paper: #E3D9DC          /* Fond clair (light mode) */
--ink: #0A0910            /* Fond flagship (dark mode) */
```

### Rôles de Couleur

#### Light Mode - "Papier + Encre Premium"
- **Background**: `#E3D9DC` (Paper)
- **Surface**: `#F6F1F3` (Paper + 1 cran)
- **Texte principal**: `#0A0910` (Ink)
- **Texte secondaire**: `#5D5674` (Deep Indigo 300)
- **Bordures**: `#9E9AAC` (Deep Indigo 100)
- **CTA primaire**: `#B9399B` (Neon Magenta)
- **Accent secondaire**: `#4B1E59` (Royal Plum)

#### Dark Mode - "Flagship Galerie"
- **Background**: `#0A0910` (Ink)
- **Surface**: `#120D1F` (Deep Indigo 900)
- **Texte principal**: `#E3D9DC` (Paper)
- **Texte secondaire**: `#9998A1` (Ink Navy 100)
- **Bordures**: `#161322` (Ink Navy 700)
- **CTA primaire**: `#B9399B` (avec glow magenta)
- **Accent secondaire**: `#785682` (Royal Plum 300)

---

## ✨ Composants Clés

### 1. Hero Section
**Fichier**: `src/components/layout/hero.tsx`

**Features**:
- Gradient animé Deep Indigo → Ink
- Orbes flottants avec effet glow (animation y-axis loop)
- Grain texture animé (SVG pattern)
- Badge "Édition Municipale 1885"
- Animations orchestrées Framer Motion (stagger children)
- CTA avec shimmer effect
- Trust indicators (édition limitée, livraison, retrait)

**Animations**:
```typescript
// Container stagger
staggerChildren: 0.12
delayChildren: 0.3

// Floating orbs
y: [0, -10, 0] (3s infinite)
y: [0, 15, 0] (4s infinite, delay 0.5s)
```

### 2. Drawer Menu
**Fichier**: `src/components/layout/drawer-menu.tsx`

**Features**:
- Fond Deep Indigo (dark) / Paper (light)
- Fast lanes en haut:
  - Nouveautés (avec icon Sparkles)
  - Best-sellers (avec icon TrendingUp)
  - Reprendre mon panier (si non vide, badge count)
- Navigation principale
- Barre verticale magenta pour item actif (`.active-indicator`)
- Toggle dark/light mode en bas
- Backdrop blur overlay

**Interaction**:
- Slide in/out from left (translate-x)
- Click overlay to close
- Focus magenta sur tous les items

### 3. Header
**Fichier**: `src/components/layout/header.tsx`

**Features**:
- Layout minimal: Hamburger (gauche) | Logo centré | Panier (droite)
- Badge panier magenta avec count
- Glow effect sur badge (dark mode)
- Indicateur actif: trait magenta sous section active
- Backdrop blur header

**Responsive**:
- Mobile-first
- Sticky top
- z-index 40

### 4. ProductCard
**Fichier**: `src/components/product/product-card.tsx`

**Features**:
- Aspect ratio 4:5 (portrait éditorial)
- Image parallax au hover (scale 1 → 1.08)
- Gradient overlay révélé au hover
- Badge "Nouveau" avec Sparkles
- Badge stock faible
- Prix + shipping info
- CTA magenta avec shimmer

**Animations**:
```typescript
// Entry (staggered)
initial: { opacity: 0, y: 20 }
animate: { opacity: 1, y: 0 }
delay: index * 0.1

// Hover image scale
scale: isHovered ? 1.08 : 1
duration: 0.6

// Tap feedback
whileTap: { scale: 0.97 }
```

### 5. Cart Sticky Mobile
**Fichier**: `src/components/cart/cart-sticky-mobile.tsx`

**Features**:
- Visible uniquement mobile (hidden md+)
- Apparaît après scroll 400px
- Badge count + total price
- Shimmer effect animé (loop)
- CTA vers `/panier`

**Animations**:
```typescript
// Entry from bottom
initial: { y: 100, opacity: 0 }
animate: { y: 0, opacity: 1 }
type: "spring", stiffness: 260

// Shimmer loop
x: '-100%' → '100%'
repeat: Infinity, repeatDelay: 1s
```

### 6. Product Page
**Fichier**: `src/app/produit/[id]/page.tsx`

**Features**:
- Galerie image principale (4:5 ratio)
- Trust indicators (3 icônes: qualité, édition, livraison)
- Quantité selector (1-10)
- Prix dynamique (prix × quantité)
- CTA sticky mobile (pas encore implémenté)
- Accordéons fins:
  - Livraison à domicile
  - Retrait gratuit à La Fabrik
  - Détails du produit

**Animations**:
- Left column: `{ x: -30 }` → `{ x: 0 }`
- Right column: `{ x: 30 }` → `{ x: 0 }`, delay 0.1s
- Accordions: height auto with spring

---

## 🎬 Animations Framer Motion

### Orchestrated Page Load
```typescript
// HomePage sections
initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true, margin: "-100px" }}
transition={{ duration: 0.6 }}
```

### Micro-interactions
- **Tap Scale**: `whileTap={{ scale: 0.97 }}`
- **Shimmer**: Gradient translate on hover/loop
- **Parallax**: Image scale 1.08 on hover
- **Floating**: y-axis loop infinite
- **Stagger**: Children delay based on index

### Custom Easing
```typescript
ease: [0.22, 1, 0.36, 1] // Smooth expo-out
```

---

## 🎯 Utilities CSS Custom

### Glow Effects
```css
.magenta-glow {
  box-shadow: 0 0 20px rgba(185, 57, 155, 0.3),
              0 0 40px rgba(185, 57, 155, 0.15);
}

.magenta-glow-sm {
  box-shadow: 0 0 10px rgba(185, 57, 155, 0.2),
              0 0 20px rgba(185, 57, 155, 0.1);
}
```

### Shadows
```css
.card-shadow {
  box-shadow: 0 2px 8px rgba(10, 9, 16, 0.06);
}

.card-shadow-lg {
  box-shadow: 0 4px 16px rgba(10, 9, 16, 0.08);
}
```

### Focus Ring
```css
.focus-magenta:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

### Active Indicator
```css
.active-indicator::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--accent);
}
```

### Gradients
```css
.gradient-hero {
  background: linear-gradient(135deg,
    rgb(var(--deep-indigo)) 0%,
    rgb(var(--ink)) 100%);
}
```

### Grain Animation
```css
@keyframes grain {
  0%, 100% { transform: translate(0, 0); }
  /* ... 10 steps random translate */
}

.animate-grain {
  animation: grain 8s steps(10) infinite;
}
```

---

## 📐 Typographie

### Fonts
- **Display (Titres)**: Playfair Display - 400, 700, 900
- **Sans (Corps)**: DM Sans - 400, 500, 700
- **Mono (Code)**: JetBrains Mono - 400, 700

### Hiérarchie
```css
/* Hero */
font-display text-5xl md:text-7xl font-bold

/* Section Titles */
font-display text-3xl md:text-4xl font-bold

/* Product Titles */
font-display text-xl font-bold

/* Body */
text-lg leading-relaxed
```

---

## 📱 Responsive Grid

### Product Grid
```tsx
grid-cols-1           // Mobile
sm:grid-cols-2        // Tablet
lg:grid-cols-3        // Desktop
xl:grid-cols-4        // Large Desktop
```

### Spacing
- Container: `container px-4`
- Sections: `py-16 space-y-20`
- Cards: `gap-6`

---

## 🌓 Dark Mode

### Implementation
1. **ThemeProvider**: Context + localStorage persistence
2. **ThemeScript**: Blocking script to prevent flash
3. **Default**: Dark (flagship)
4. **Toggle**: Dans le drawer menu

### CSS Variables
Utilise `[data-theme="dark"]` pour définir les couleurs dark mode.

### Conditional Glow
```tsx
className={cn(
  "bg-primary",
  theme === 'dark' && 'magenta-glow'
)}
```

---

## 🎨 Pages Implémentées

### 1. HomePage (`/`)
- Hero immersif
- Sections: Nouveautés / Best-sellers / Collection
- Grid responsive avec stagger animations
- CTA contact en bas

### 2. ProductPage (`/produit/[id]`)
- Galerie image
- Détails produit
- Quantité selector
- Accordéons livraison/retrait
- CTA ajout panier

### 3. NotFound (`/404`)
- Message "Oups. Cette page s'est éclipsée."
- Barre de recherche
- Chips catégories (Nouveautés, Best-sellers, etc.)
- Best-sellers grid (4 produits)
- Reprise panier (si non vide)
- Réassurance (livraison, retrait, contact)

---

## 🚀 Performance

### Optimizations
- ✅ Next.js Image avec `sizes` optimisés
- ✅ Lazy loading images (priority sur 3 premiers)
- ✅ CSS animations (GPU-accelerated)
- ✅ Framer Motion avec `layoutId` pour shared layouts
- ✅ Zustand avec persist middleware
- ✅ LocalStorage pour theme + cart

### Accessibility
- ✅ Focus rings magenta sur tous les interactifs
- ✅ ARIA labels sur images et boutons
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Semantic HTML (article, section, nav)

---

## 📦 Stack Technique

```json
{
  "framework": "Next.js 16.1.6",
  "react": "19.2.3",
  "animations": "framer-motion ^12.x",
  "styling": "Tailwind CSS 4",
  "state": "Zustand 5.x",
  "types": "TypeScript 5.x"
}
```

---

## 🎯 Prochaines Étapes

### En cours
- ✅ Hero Section
- ✅ Drawer Menu
- ✅ Header
- ✅ ProductCard
- ✅ Cart Sticky Mobile
- ✅ Product Page
- ✅ 404 Page
- ✅ Dark/Light Mode

### À venir
- [ ] Page Panier complète
- [ ] Checkout flow
- [ ] Page succès commande
- [ ] Page admin dashboard
- [ ] Animations page transitions (route changes)
- [ ] Skeleton loaders sur lazy load
- [ ] Infinite scroll / Load more
- [ ] Filtre produits (tags, prix)

---

**Repo GitHub**: https://github.com/subv3rsif/boutique-phygitale
**Commit**: `c4721b6` - feat: implement editorial dark design system with Framer Motion

**Développé avec Claude Sonnet 4.5** 🤖✨
