# Design Spec : Refonte Homepage + Navigation 1885

**Date :** 2026-03-31
**Auteur :** Claude Sonnet 4.5
**Statut :** Approuvé pour implémentation
**Approche :** Incrémental par couches (4 phases déployables)

---

## 1. Objectif

Refonte complète de la homepage et de la navigation du site e-commerce 1885 Alfortville avec :
- Nouvelle identité visuelle (design system complet)
- Homepage storytelling en 7 sections
- 4 nouvelles pages (Collection, Éditions, Artisans, Atelier)
- Contenu dynamique via base de données
- Navigation minimaliste unifiée desktop/mobile

---

## 2. Décisions de Design

### 2.1 Stratégie d'implémentation
**Choix : Approche 2 - Incrémental par couches**

Rationale :
- Chaque phase est déployable et testable
- Feedback rapide (1 semaine par phase)
- PRs reviewables (5-8 fichiers max)
- Risques isolés par phase
- Valeur livrée progressivement

### 2.2 Transition design system
**Choix : Remplacement immédiat complet (Option A)**

Rationale :
- Cohérence visuelle totale dès Phase 1
- Pas de maintenance de deux systèmes en parallèle
- Plus simple à tester et valider

### 2.3 Gestion du contenu
**Choix : Contenu dynamique depuis DB (Option C)**

Rationale :
- Flexibilité maximale pour Alfortville
- Modification du contenu sans toucher au code
- Évolutif (admin UI en Phase 5 optionnelle)

### 2.4 Frontend vs Backend
**Choix : Frontend d'abord, données seed, admin ensuite (Option A)**

Rationale :
- Validation rapide du design visuel
- Approche itérative
- Admin construit une fois le design validé

### 2.5 Navigation
**Choix : Navigation minimaliste avec hamburger desktop + mobile (Option A modifiée)**

Rationale :
- Cohérence totale desktop/mobile
- Header épuré (logo centré)
- Navigation immersive dans drawer
- Flexibilité (facile d'ajouter des liens)

### 2.6 Images
**Choix : Placeholders élégants customisés (Option A)**

Rationale :
- Résultat immédiat
- Cohérence palette
- Alfortville uploade vraies photos via admin Phase 5

### 2.7 Animations
**Choix : Animations desktop only, réduites mobile (Option B)**

Rationale :
- Performance mobile optimale
- Animations spectaculaires desktop
- Meilleure expérience adaptée à chaque device

### 2.8 Éditions limitées
**Choix : Tag simple + champs numérotation (Option A)**

Rationale :
- Simple pour MVP
- Pas de table dédiée
- Évolutif (migration possible plus tard)

---

## 3. Architecture Globale

### 3.1 Plan de migration en 4 phases

#### Phase 1 : Foundation (Design System + Navigation)
**Durée :** 4-5 jours
**Fichiers modifiés :** 6-8 fichiers
**Livrable :** Site fonctionnel avec nouvelle identité visuelle

**Modifications :**
- `src/app/globals.css` → Variables CSS complètes
- `src/app/layout.tsx` → Fonts Josefin Sans + DM Sans
- `src/components/layout/header.tsx` → Header unifié hamburger
- `src/components/layout/drawer-menu.tsx` → Drawer fond encre
- `src/components/product/product-card.tsx` → Re-stylé nouvelles couleurs
- Suppression `src/styles/brand-1885-tokens.css` (ou vidé)

**Impact :** Toutes les pages existantes passent aux nouvelles couleurs

#### Phase 2 : Homepage Refonte
**Durée :** 5-6 jours
**Fichiers créés :** 8 fichiers (7 sections + page)
**Livrable :** Nouvelle homepage déployée

**Créations :**
- `src/components/sections/hero-1885.tsx`
- `src/components/sections/accroche-territorial.tsx`
- `src/components/sections/produit-hero.tsx`
- `src/components/sections/grille-collection.tsx`
- `src/components/sections/editions-limitees.tsx`
- `src/components/sections/les-artisans.tsx`
- `src/components/sections/atelier.tsx`
- `src/app/page.tsx` → Remplacement complet

**Modifications :**
- `src/lib/catalogue.ts` → Ajout `editionNumber?`, `editionTotal?`

#### Phase 3 : Pages Produits
**Durée :** 3-4 jours
**Fichiers créés :** 2 pages
**Livrable :** Navigation produits complète

**Créations :**
- `src/app/collection/page.tsx` → Grille + filtres
- `src/app/editions/page.tsx` → Éditions limitées

#### Phase 4 : Pages Éditoriales + DB
**Durée :** 4-5 jours
**Fichiers créés :** 10+ fichiers
**Livrable :** Site complet avec contenu dynamique

**Créations :**
- DB Schema : `src/lib/db/schema.ts` (tables artisans, editorial)
- Migration : `drizzle/0XXX_add_editorial_tables.sql`
- Seed : `scripts/seed-editorial.ts`
- API : `src/app/api/artisans/route.ts`, `src/app/api/editorial/route.ts`
- Pages : `src/app/artisans/page.tsx`, `src/app/atelier/page.tsx`

**Modifications :**
- `src/components/sections/les-artisans.tsx` → Fetch API
- `src/app/atelier/page.tsx` → Fetch API

### 3.2 Compatibilité avec l'existant

**✅ Conservé intact (aucune modification) :**
- Toute la logique Stripe (`/api/checkout`, `/api/stripe/webhook`)
- Zustand store panier (`/store/cart.ts`)
- Pages admin (`/admin/*`)
- Flow checkout (`/panier`, `/commande/success`)
- Auth NextAuth (`/api/auth/*`)
- Tables DB existantes (orders, pickup_tokens, email_queue, etc.)

**✅ Modifié (style uniquement) :**
- Header + Drawer (nouvelle structure, même comportement)
- ProductCard (nouveau style, même props/API)
- Buttons, Badges (nouvelles couleurs via CSS vars)

**✅ Nouveau (ajouté) :**
- Homepage (7 sections)
- Pages `/collection`, `/editions`, `/artisans`, `/atelier`
- Tables DB `artisans`, `artisan_products`, `editorial_sections`
- Components sections

---

## 4. Design System

### 4.1 Variables CSS

**Fichier :** `src/app/globals.css`

**Remplacer complètement les anciennes variables par :**

```css
:root {
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
  --primary: rgb(var(--encre));
  --primary-foreground: rgb(var(--ivoire));
  --secondary: rgb(var(--terra));
  --secondary-foreground: rgb(var(--ivoire));
  --accent: rgb(var(--terra));
  --accent-foreground: rgb(var(--ivoire));
  --muted: rgb(var(--ivoire-2));
  --muted-foreground: rgb(var(--pierre));
  --border: rgb(var(--ivoire-2));
  --input: rgb(var(--ivoire-2));
  --ring: rgb(var(--terra));

  /* Radius */
  --radius: 0.5rem; /* 8px - Moins arrondi que l'ancien (20px) */
}
```

**Supprimer :**
- Section `[data-theme="dark"]` (dark mode)
- Toutes les variables `--love-symbol-*`, `--cloud-dancer-*`, `--champagne-*`
- Utilities `.champagne-*`, `.love-*`, `.cloud-*`
- Animations `.grain`, `.glow-pulse`, `.shimmer-auto`, `.gradient-border-animated`

**Ajouter utilities :**

```css
/* Text gradients 1885 */
.text-gradient-1885 {
  background: linear-gradient(135deg, rgb(var(--encre)), rgb(var(--terra)));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Focus states */
.focus-terra {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terra focus-visible:ring-offset-2;
}

/* Shadows terra */
.shadow-terra {
  box-shadow: 0 4px 14px rgba(197, 99, 57, 0.15);
}

/* Glass effect ivoire */
.glass-1885 {
  background: rgba(242, 237, 228, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgb(var(--ivoire-2));
}
```

### 4.2 Typographies

**Fichier :** `src/app/layout.tsx`

**Remplacer :**
```typescript
// AVANT
import { Cormorant_Garamond, Work_Sans, JetBrains_Mono } from "next/font/google";

// APRÈS
import { Josefin_Sans, DM_Sans, JetBrains_Mono } from "next/font/google";

// Display: Josefin Sans (logotype, titres)
const josefin = Josefin_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '700'],
  display: 'swap',
});

// Sans: DM Sans (corps, navigation, labels)
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500'],
  display: 'swap',
});

// Mono: Conserver JetBrains Mono
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
  display: 'swap',
});
```

**Utilisation :**
- **Josefin Sans** : Tous les titres (h1-h6), logotype "1885", noms de produits
- **DM Sans** : Corps, navigation, labels, boutons
- **JetBrains Mono** : Code technique uniquement

### 4.3 Boutons & CTAs

**Bouton primaire :**
```typescript
className="bg-encre text-ivoire hover:bg-encre-2"
```

**Bouton accent :**
```typescript
className="bg-terra text-ivoire hover:bg-terra/90"
```

**CTA textuel (liens) :**
```typescript
className="text-terra hover:text-terra/80 underline-offset-4"
```

**Bouton outline :**
```typescript
className="border border-encre text-encre hover:bg-encre hover:text-ivoire"
```

---

## 5. Navigation

### 5.1 Header (Desktop & Mobile)

**Structure unifiée :**

```
┌─────────────────────────────────────┐
│  [☰]      [1885]           [🛒]     │
│         MANUFACTURE                 │
│      ALFORTVILLAISE                 │
└─────────────────────────────────────┘
```

**3 zones :**

1. **Gauche : Hamburger**
   - Visible desktop ET mobile
   - Ouvre drawer
   - Icon `Menu` lucide-react
   - Couleur : `text-pierre` hover `text-encre`

2. **Centre : Logo**
   - Desktop : "18 — 85" + sous-titre
   - Mobile : "1885" seul
   - Font : Josefin Sans Bold
   - Centré absolument

3. **Droite : Panier**
   - Icon `ShoppingBag` lucide-react
   - Badge terra si items > 0
   - Link vers `/panier`

**Hauteur :**
- Desktop : `h-24` (normal) → `h-20` (sticky scroll)
- Mobile : `h-16` (normal) → `h-14` (sticky scroll)

**Sticky behavior :**
```typescript
const [isScrolled, setIsScrolled] = useState(false);

// Au scroll > 50px
className={cn(
  "sticky top-0 z-50 transition-all duration-300",
  isScrolled
    ? "glass-1885 shadow-terra h-20"
    : "bg-ivoire h-24"
)}
```

### 5.2 Drawer Menu

**Background :** `bg-encre` (fond noir)

**Largeur :**
- Desktop : `w-96` (384px)
- Mobile : `w-full` (plein écran)

**Contenu :**

1. **Logo grand format** (en haut)
   ```
   18 ————— 85
   MANUFACTURE ALFORTVILLAISE
   ```

2. **Navigation principale** (grande typo)
   - Collection
   - Éditions
   - Artisans
   - L'Atelier
   - Font : Josefin Sans Bold 4xl-5xl
   - Couleur : `text-ivoire` hover `text-terra`
   - Item actif : `text-terra`

3. **Divider** (ligne horizontale `bg-ivoire-2`)

4. **Links secondaires** (petit)
   - Mentions légales
   - CGV
   - Politique de confidentialité
   - Font : DM Sans Regular sm
   - Couleur : `text-pierre` hover `text-ivoire`

5. **Bouton fermeture** (X top-right)

**Animation ouverture :**
```typescript
<motion.div
  initial={{ x: "-100%" }}
  animate={{ x: 0 }}
  exit={{ x: "-100%" }}
  transition={{ type: "spring", damping: 30, stiffness: 300 }}
>
```

**Overlay (desktop uniquement) :**
```typescript
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  onClick={onClose}
  className="hidden md:block fixed inset-0 bg-encre/60 backdrop-blur-sm z-40"
/>
```

---

## 6. Homepage — 7 Sections

### 6.1 Section 1 : Hero 1885

**Fichier :** `src/components/sections/hero-1885.tsx`

**Specs :**
- Background : `bg-encre`
- Hauteur : `h-screen min-h-[600px]`
- Layout : Centré verticalement et horizontalement

**Contenu :**
1. Logotype "18 — 85" avec animation convergence
   - "18" arrive du haut (y: -200 → 0)
   - "85" arrive du bas (y: 200 → 0)
   - Ligne horizontale apparaît au centre (scaleX: 0 → 1)
   - Duration : 1.2s, easing `[0.16, 1, 0.3, 1]` (expo-out)
   - Font : Josefin Sans Bold, `text-[clamp(80px,15vw,180px)]`
   - Couleur : `text-ivoire`

2. Sous-titre (fade après logotype)
   - "Manufacture Alfortvillaise"
   - Font : DM Sans Light, text-sm
   - Tracking : `tracking-[0.35em]`
   - Uppercase
   - Delay : 1.4s

3. Chevron bounce (invite scroll)
   - Icon `ChevronDown` lucide-react
   - Position : `absolute bottom-12`
   - Animation : bounce vertical (y: [0, -10, 0])
   - Loop infini après 2.5s
   - Couleur : `text-ivoire/60`

**Responsive mobile :**
- Même animation (pas simplifiée car section unique)
- Text size adaptatif via clamp

### 6.2 Section 2 : Accroche Territoriale

**Fichier :** `src/components/sections/accroche-territorial.tsx`

**Specs :**
- Background : `bg-ivoire`
- Padding : `py-24`
- Layout : Grid 2 colonnes (40% texte / 60% image)

**Colonne gauche (texte) :**
1. Eyebrow
   - "Alfortville · Depuis 1885"
   - Font : DM Sans SemiBold, text-sm
   - Couleur : `text-terra`
   - Uppercase, `tracking-[0.2em]`

2. Titre
   - "Une ville. Des objets. Une histoire."
   - Font : Josefin Sans Bold, 4xl-5xl
   - Couleur : `text-encre`

3. Corps (2-3 phrases)
   - Font : DM Sans Regular, text-base
   - Couleur : `text-pierre`
   - Leading relaxed

4. CTA textuel
   - "Découvrir l'Atelier →"
   - Couleur : `text-terra`
   - Hover : gap augmente (items-center gap-2 hover:gap-3)

**Colonne droite (image) :**
- Aspect ratio : 3/4 (portrait)
- Image : placeholder `https://placehold.co/900x1200/F2EDE4/8A8278?text=Atelier+1885`
- Badge overlay bas-gauche
  - "1885"
  - `bg-terra text-ivoire`
  - Font : Josefin Sans Bold, text-2xl
  - Position : `absolute bottom-6 left-6`

**Animation :**
- Texte : entre par la gauche (x: -50 → 0)
- Image : entre par la droite (x: 50 → 0)
- Trigger : `useInView` avec `margin: "-100px"`

**Responsive mobile :**
- Stack vertical (grid-cols-1)
- Texte en premier, image en dessous

### 6.3 Section 3 : Produit Héros

**Fichier :** `src/components/sections/produit-hero.tsx`

**Specs :**
- Background : `bg-encre-2`
- Hauteur : `min-h-[80vh]`
- Layout : Grid 2 colonnes 50/50
- Produit : Premier produit du catalogue (`products[0]`)

**Colonne gauche (texte) :**
1. Label
   - "À la une"
   - Font : DM Sans SemiBold, text-xs
   - Couleur : `text-terra`
   - Uppercase, tracking wide

2. Nom produit
   - Font : Josefin Sans Bold, 4xl-5xl
   - Couleur : `text-ivoire`

3. Description
   - Font : DM Sans Regular, text-base
   - Couleur : `text-ivoire/60`

4. Prix
   - Font : Josefin Sans Bold, text-5xl
   - Couleur : `text-terra`

5. Boutons (flex row gap-4)
   - "Ajouter au panier" : `bg-terra text-ivoire`
   - "Voir toute la collection →" : `border-ivoire text-ivoire` (outline)

**Colonne droite (image) :**
- Image produit pleine hauteur
- `object-cover`
- Sizes : `(max-width: 768px) 100vw, 50vw`
- Priority (above fold)

**Animation :**
- Texte : fade-up (y: 30 → 0)
- Image : scale (0.95 → 1) + fade
- Delay image : 0.2s

**Responsive mobile :**
- Stack vertical
- Image en bas (min-h-[500px])

### 6.4 Section 4 : Grille Collection

**Fichier :** `src/components/sections/grille-collection.tsx`

**Specs :**
- Background : `bg-ivoire`
- Padding : `py-24`
- Produits : Maximum 6 premiers du catalogue

**Header :**
- Titre "Collection" (gauche)
- Lien "Tout voir →" (droite, `text-terra`)
- Flex justify-between

**Grille :**
- Grid : 1 col mobile / 2 cols tablet / 3 cols desktop
- Gap : 6 (24px)

**ProductCard (composant séparé) :**

1. **Image section**
   - Aspect ratio : 4/5
   - Hover : scale(1.03) sur image (via motion.div)
   - Badge catégorie overlay top-left
     - Premier tag du produit
     - `bg-terra text-ivoire text-xs px-3 py-1 rounded`
     - Uppercase, tracking wide
   - Mention lieu overlay bottom-right
     - "Atelier · Alfortville"
     - `bg-encre/60 backdrop-blur text-ivoire text-[9px]`
     - Uppercase, tracking wide

2. **Détails section** (p-5)
   - Nom produit : Josefin Sans SemiBold, text-xl, hover `text-terra`
   - Prix : Josefin Sans Bold, text-2xl
   - CTA "Ajouter →" : `text-terra text-sm`, hover underline

3. **Border separator**
   - `border-t border-ivoire-2` en haut de la section détails

**Animation :**
- Stagger entrée : delay `index * 0.08`
- Fade-up : opacity 0 → 1, y: 20 → 0
- Trigger : `useInView`

**Responsive mobile :**
- Animations simplifiées (fade uniquement, pas de stagger)

### 6.5 Section 5 : Éditions Limitées

**Fichier :** `src/components/sections/editions-limitees.tsx`

**Specs :**
- Background : `bg-violet`
- Hauteur : `min-h-[60vh]`
- Padding : `py-24`
- Produits : Maximum 3 éditions (filtrés par tag `edition-limitee`)

**Background effects :**
- Orb décoratif : `bg-terra/10 w-[600px] h-[600px] rounded-full blur-3xl`
- Position : `absolute top-0 right-0`

**Header (centré) :**
1. Eyebrow
   - "Éditions"
   - `text-ivoire text-xs tracking-[0.25em] uppercase`

2. Titre
   - "Pièces uniques. En nombre compté."
   - Font : Josefin Sans Bold, 4xl-5xl
   - Couleur : `text-ivoire`

3. Sous-titre
   - "{n} édition(s) disponible(s) · De 12 à 50 exemplaires"
   - `text-ivoire/50 text-sm`

**Grille produits :**
- Desktop : Grid 3 colonnes
- Mobile : Scroll horizontal avec snap

**EditionCard :**
1. Container
   - `bg-ivoire/10 backdrop-blur border border-ivoire/20`
   - Hover : `border-ivoire/40`

2. Image : aspect 3/4

3. Badge numérotation (overlay top-right)
   - "N° {editionNumber}/{editionTotal}"
   - `bg-ivoire text-violet text-xs px-3 py-1`
   - Font : Josefin Sans Bold

4. Détails (p-5)
   - Nom : Josefin Sans SemiBold, `text-ivoire`
   - Prix : Josefin Sans Bold, text-2xl, `text-ivoire`
   - Bouton "Découvrir" : `bg-terra hover:bg-terra/90`

**CTA bottom :**
- "Voir les éditions →"
- Bouton outline `border-ivoire text-ivoire`

**Animation :**
- Stagger cards : delay `index * 0.1`
- Fade-up

**Responsive mobile :**
- Scroll horizontal : `overflow-x-auto snap-x snap-mandatory`
- Cards : `flex-shrink-0 w-[280px] snap-center`
- Masquer scrollbar : `scrollbarWidth: 'none'`

### 6.6 Section 6 : Les Artisans

**Fichier :** `src/components/sections/les-artisans.tsx`

**Specs :**
- Background : `bg-ivoire`
- Padding : `py-24`
- Artisans : 3 (Phase 1-3 : données hardcodées / Phase 4 : fetch API)

**Header :**
1. Eyebrow
   - "Fait ici"
   - `text-terra text-xs tracking-[0.25em] uppercase`

2. Titre
   - "Ceux qui fabriquent"
   - Font : Josefin Sans Bold, 4xl-5xl

**Grille :**
- Grid : 1 col mobile / 3 cols desktop
- Gap : 8 (32px)

**ArtisanCard :**
1. **Photo portrait**
   - Aspect ratio : 1/1 (carré)
   - Effet sépia : `grayscale-[30%] sepia-[20%]`
   - Hover : couleur complète (`grayscale-0 sepia-0`)
   - Transition : 500ms

2. **Détails** (space-y-2)
   - Nom : Josefin Sans Bold, text-2xl, `text-encre`
   - Métier : DM Sans Medium, text-sm, `text-terra`
   - Bio courte : DM Sans Regular, text-sm, `text-pierre/80`
   - CTA "Voir ses créations →" : `text-terra`, hover gap augmente

**Animation :**
- Stagger : delay `index * 0.1`
- Fade-up (y: 30 → 0)

**Phase 4 - Fetch API :**
```typescript
useEffect(() => {
  fetch('/api/artisans')
    .then(res => res.json())
    .then(data => setArtisans(data))
}, []);
```

### 6.7 Section 7 : L'Atelier

**Fichier :** `src/components/sections/atelier.tsx`

**Specs :**
- Background : `bg-encre`
- Hauteur : `min-h-[70vh]`
- Layout : Grid 2 colonnes asymétrique (55% image / 45% texte)

**Colonne gauche (image) :**
- Image atelier pleine hauteur
- `object-cover`
- Placeholder : `https://placehold.co/1200x1400/2D2620/F2EDE4?text=Atelier+Serigraphie`
- Sizes : `(max-width: 768px) 100vw, 55vw`

**Colonne droite (texte) :**
1. Label
   - "L'Atelier"
   - `text-terra text-xs tracking-[0.25em] uppercase`

2. Titre
   - "La sérigraphie comme geste fondateur."
   - Font : Josefin Sans Bold, 4xl-5xl
   - Couleur : `text-ivoire`

3. Corps (2 paragraphes)
   - Font : DM Sans Regular, text-base
   - Couleur : `text-ivoire/55`
   - Leading relaxed (1.7)

4. CTA
   - "Découvrir l'Atelier →"
   - Bouton outline `border-ivoire text-ivoire`

**Ligne signature (footer) :**
- `absolute bottom-0 left-0 right-0 h-0.5 bg-terra`
- Ligne terracotta 2px en bas de section

**Animation :**
- Image : entre par la gauche (x: -30 → 0)
- Texte : entre par la droite (x: 30 → 0), delay 0.2s

**Responsive mobile :**
- Stack vertical
- Image en haut (min-h-[400px])

---

## 7. Nouvelles Pages

### 7.1 Page `/collection`

**Fichier :** `src/app/collection/page.tsx`

**Structure :**

1. **Hero compact (40vh)**
   - Background : `bg-encre`
   - Centré : Eyebrow + Titre + Description
   - Eyebrow : "Manufacture 1885"
   - Titre : "Collection" (5xl-7xl)
   - Description : 2 phrases sur les créations

2. **Breadcrumb**
   - `border-b border-ivoire-2`
   - "1885 / Collection"
   - Font : DM Sans Regular, text-sm, `text-pierre`

3. **Filtres (sticky)**
   - Position : `sticky top-16 z-30`
   - Background : `bg-ivoire/95 backdrop-blur`
   - Border bottom : `border-ivoire-2`
   - Boutons filtres : Pills arrondis
     - Inactif : `bg-ivoire-2 text-pierre`
     - Actif : `bg-encre text-ivoire`
   - Catégories : "tous", puis extraites depuis tags produits
   - Compteur : "{n} produit(s)"

4. **Grille produits**
   - Grid : 1 / 2 / 3 colonnes
   - Gap : 6
   - Animation layout : `motion.div` avec `layout` prop
   - Transition smooth lors du filtrage

5. **Empty state**
   - Si aucun produit : Message centré
   - "Aucun produit dans cette catégorie pour le moment."

**Logique filtrage :**
```typescript
const [activeFilter, setActiveFilter] = useState('tous');

const filteredProducts = useMemo(() => {
  if (activeFilter === 'tous') return allProducts;
  return allProducts.filter(p => p.tags?.includes(activeFilter));
}, [allProducts, activeFilter]);
```

### 7.2 Page `/editions`

**Fichier :** `src/app/editions/page.tsx`

**Structure :**

1. **Hero violet avec watermark**
   - Background : `bg-violet`
   - Hauteur : `py-32 md:py-40`
   - Watermark "1885" géant en fond
     - Font : Josefin Sans Bold, `text-[20rem]`
     - Couleur : `text-ivoire opacity-5`
     - Position : `absolute inset-0 flex items-center justify-center`
   - Contenu centré :
     - Eyebrow : "Pièces uniques"
     - Titre : "Éditions limitées" (5xl-7xl)
     - 2 paragraphes explicatifs (`text-ivoire/70`)
     - Compteur : "{n} édition(s) disponible(s)"

2. **Grille éditions**
   - Background : `bg-ivoire`
   - Padding : `py-16`
   - Grid : 1 / 2 / 3 colonnes, gap-8
   - Utilise `ProductCard` standard

3. **Badge numérotation proéminent**
   - Position : `absolute -top-3 -right-3 z-10`
   - Cercle : `w-16 h-16 rounded-full`
   - Background : `bg-terra text-ivoire`
   - Shadow : `shadow-terra`
   - Font : Josefin Sans Bold, text-sm
   - Contenu : "{editionNumber}/{editionTotal}"

4. **Section explicative (bottom)**
   - Background : `bg-encre-2`
   - Padding : `py-20`
   - Centré, max-w-4xl
   - Titre : "Pourquoi des éditions limitées ?"
   - Paragraphe explicatif (`text-ivoire/60`)

**Filtrage :**
```typescript
const editionsLimitees = getAllActiveProducts().filter(
  p => p.tags?.includes('edition-limitee')
);
```

### 7.3 Page `/artisans`

**Fichier :** `src/app/artisans/page.tsx`

**Structure :**

1. **Hero terra**
   - Background : `bg-terra`
   - Padding : `py-20 md:py-32`
   - Centré :
     - Eyebrow : "Savoir-faire local"
     - Titre : "Les Artisans" (5xl-7xl, `text-ivoire`)
     - Description : "Ceux qui fabriquent..." (`text-ivoire/80`)

2. **Sections artisans (alternées)**
   - Layout alterné :
     - Artisan 1 (index 0) : Photo gauche / Texte droite
     - Artisan 2 (index 1) : Texte gauche / Photo droite
     - Artisan 3 (index 2) : Photo gauche / Texte droite
   - Background alterné :
     - Index pair : `bg-ivoire`
     - Index impair : `bg-ivoire-2`
   - Padding : `py-16 md:py-24`

**Chaque section artisan :**

1. **Photo** (aspect-square)
   - Effet sépia : `grayscale-[30%] sepia-[20%]`
   - Rounded : `rounded-lg`
   - Grid col : alterne selon index

2. **Bio longue**
   - Nom : Josefin Sans Bold, 4xl, `text-encre`
   - Métier : DM Sans Medium, text-lg, `text-terra`
   - Long bio : DM Sans Regular, text-lg, `text-pierre`
   - Ses créations :
     - Titre : "Ses créations" (Josefin Sans SemiBold, xl)
     - Pills : Liste produits associés (links)
     - Style : `bg-ivoire-2 hover:bg-encre hover:text-ivoire`

**Animation :**
- Photo : entre depuis gauche/droite selon index
- Texte : entre depuis droite/gauche (inverse de la photo)
- Trigger : `useInView` par section

**Phase 4 - Source données :**
```typescript
useEffect(() => {
  fetch('/api/artisans')
    .then(res => res.json())
    .then(data => setArtisans(data))
}, []);

const artisanProducts = allProducts.filter(p =>
  artisan.productIds.includes(p.id)
);
```

### 7.4 Page `/atelier`

**Fichier :** `src/app/atelier/page.tsx`

**Structure :**

1. **Hero image pleine largeur**
   - Hauteur : `h-[60vh] md:h-[80vh]`
   - Image : placeholder atelier
   - Overlay : `bg-encre/40`
   - Contenu centré :
     - Titre : "L'Atelier" (6xl-8xl, `text-ivoire`)
     - Sous-titre : "Manufacture Alfortvillaise" (tracking wide, uppercase)

2. **Section Histoire**
   - Background : `bg-ivoire`
   - Padding : `py-20 md:py-32`
   - Max-width : `max-w-3xl mx-auto`
   - Titre : "Histoire" (Josefin Sans Bold, 4xl)
   - Corps : 2-3 paragraphes (`text-pierre leading-relaxed`)

3. **Photo séparatrice 1**
   - Hauteur : `h-[50vh]`
   - Image : placeholder sérigraphie
   - `object-cover`

4. **Section Sérigraphie**
   - Background : `bg-ivoire-2`
   - Layout identique à Histoire

5. **Photo séparatrice 2**
   - Image : placeholder encres

6. **Section Processus**
   - Background : `bg-ivoire`
   - Padding : `py-20 md:py-32`
   - Titre : "Le processus"
   - 5 étapes numérotées :
     - Layout : `flex gap-8`
     - Numéro : Josefin Sans Bold, 6xl, `text-terra opacity-30`
     - Titre étape : Josefin Sans Bold, 2xl
     - Description : DM Sans Regular, `text-pierre`
   - Étapes :
     1. Conception
     2. Préparation écran
     3. Impression
     4. Séchage
     5. Finition

7. **Section Contact**
   - Background : `bg-encre`
   - Padding : `py-20 md:py-32`
   - Centré : max-w-3xl
   - Titre : "Venir nous voir" (4xl, `text-ivoire`)
   - Infos pratiques :
     - Horaires ouverture
     - Adresse La Fabrik
     - Email contact
   - Couleur : `text-ivoire/70`

**Animation :**
- Sections : fade-up au scroll
- Étapes processus : stagger individual (useInView)

**Phase 4 - Contenu dynamique :**
```typescript
useEffect(() => {
  fetch('/api/editorial?page=atelier')
    .then(res => res.json())
    .then(data => setSections(data))
}, []);

const histoireSection = sections.find(s => s.section === 'histoire');
// Utiliser histoireSection.content au lieu du texte hardcodé
```

---

## 8. Base de Données (Phase 4)

### 8.1 Schéma Drizzle

**Fichier :** `src/lib/db/schema.ts` (ajouter à la fin du fichier existant)

**Nouvelles tables :**

```typescript
// Artisans
export const artisans = pgTable('artisans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  metier: varchar('metier', { length: 255 }).notNull(),
  bio: text('bio').notNull(), // Bio courte (1 phrase)
  longBio: text('long_bio').notNull(), // Bio longue (paragraphe)
  imageUrl: varchar('image_url', { length: 500 }).notNull(),
  order: integer('order').notNull().default(0),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Association artisan <-> produits
export const artisanProducts = pgTable('artisan_products', {
  id: uuid('id').primaryKey().defaultRandom(),
  artisanId: uuid('artisan_id').notNull().references(() => artisans.id, { onDelete: 'cascade' }),
  productId: varchar('product_id', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  artisanIdx: index('idx_artisan_products_artisan').on(table.artisanId),
  productIdx: index('idx_artisan_products_product').on(table.productId),
}));

// Sections éditoriales
export const editorialSections = pgTable('editorial_sections', {
  id: uuid('id').primaryKey().defaultRandom(),
  page: varchar('page', { length: 50 }).notNull(), // 'atelier', 'homepage-accroche'
  section: varchar('section', { length: 100 }).notNull(), // 'histoire', 'serigraphie'
  title: varchar('title', { length: 255 }),
  content: text('content').notNull(),
  imageUrl: varchar('image_url', { length: 500 }),
  order: integer('order').notNull().default(0),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  pageIdx: index('idx_editorial_page').on(table.page),
}));
```

### 8.2 Seed Data

**Fichier :** `scripts/seed-editorial.ts`

**Contenu :**

**3 artisans :**
1. Marie Dubois - Céramiste
2. Thomas Laurent - Sérigraphe
3. Sophie Martin - Relieuse

**6 associations artisan-produits :**
- Marie → mug-love-symbol, gourde-inox-1885
- Thomas → tote-bag-heritage, affiche-heritage
- Sophie → carnet-edition-1885, trousse-heritage

**3 sections éditoriales :**
- atelier/histoire
- atelier/serigraphie
- homepage/accroche-territorial

**Exécution :**
```bash
npm run db:generate  # Génère migration
npm run db:push      # Applique migration
tsx scripts/seed-editorial.ts  # Exécute seed
```

### 8.3 API Routes

**GET `/api/artisans`**

**Fichier :** `src/app/api/artisans/route.ts`

**Logique :**
1. Récupérer tous les artisans actifs (order ASC)
2. Pour chaque artisan, récupérer ses productIds depuis `artisan_products`
3. Retourner JSON avec artisans + productIds

**Response :**
```json
[
  {
    "id": "uuid",
    "name": "Marie Dubois",
    "metier": "Céramiste",
    "bio": "Terre cuite et émaux naturels depuis 15 ans",
    "longBio": "Marie travaille la terre...",
    "imageUrl": "https://...",
    "order": 1,
    "productIds": ["mug-love-symbol", "gourde-inox-1885"]
  }
]
```

**GET `/api/editorial?page=atelier`**

**Fichier :** `src/app/api/editorial/route.ts`

**Params :**
- `page` (required) : 'atelier', 'homepage', etc.

**Logique :**
1. Valider param `page`
2. Fetch sections depuis `editorial_sections` WHERE page = {page} AND active = true
3. Order by `order` ASC
4. Retourner JSON

**Response :**
```json
[
  {
    "id": "uuid",
    "page": "atelier",
    "section": "histoire",
    "title": "Histoire",
    "content": "Fondé en 1885...",
    "imageUrl": null,
    "order": 1
  }
]
```

### 8.4 Mise à jour type Product

**Fichier :** `src/lib/catalogue.ts`

**Ajouter au type Product :**
```typescript
export type Product = {
  // ... champs existants

  // Nouveaux champs pour éditions limitées
  editionNumber?: number;  // Ex: 12
  editionTotal?: number;   // Ex: 50
};
```

**Mettre à jour le catalogue avec 2-3 produits éditions limitées :**
- Tag `edition-limitee`
- `editionNumber` et `editionTotal` définis
- Exemples : carnet-edition-1885, affiche-heritage, sweat-love-edition

---

## 9. Responsive Strategy

### 9.1 Breakpoints

**Tailwind CSS standards :**
- Mobile : `< 768px`
- Tablet : `768px - 1024px`
- Desktop : `>= 1024px`

### 9.2 Animations

**Desktop (≥768px) :**
- Toutes les animations Framer Motion complètes
- Hero convergence
- Word reveal
- Parallax (scale sur images)
- Animated borders
- Stagger entrées

**Mobile (<768px) :**
- Animations simplifiées
- Fade-in uniquement (opacity 0 → 1)
- Pas de parallax
- Pas d'animated borders
- Pas de stagger (ou delay minimal)

**Implémentation :**
```typescript
// Desktop animations
<motion.div className="hidden md:block">
  <motion.div animate={{ scale: isHovered ? 1.03 : 1 }}>
    {/* Complex animations */}
  </motion.div>
</motion.div>

// Mobile simplified
<motion.div
  className="md:hidden"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
>
  {/* Simple fade */}
</motion.div>
```

### 9.3 Grilles

**Collection / Éditions :**
- Mobile : 1 colonne
- Tablet : 2 colonnes
- Desktop : 3 colonnes

**Artisans :**
- Mobile : 1 colonne (stack)
- Desktop : 3 colonnes (side-by-side)

**Classes :**
```typescript
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
```

### 9.4 Scroll horizontal (mobile)

**Éditions limitées section :**
- Desktop : Grille 3 colonnes fixe
- Mobile : Scroll horizontal avec snap

```typescript
<div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory">
  {products.map(product => (
    <div className="flex-shrink-0 w-[280px] snap-center">
      <EditionCard product={product} />
    </div>
  ))}
</div>
```

**CSS :**
```css
scrollbarWidth: 'none' /* Hide scrollbar */
```

---

## 10. Images & Placeholders

### 10.1 Format placeholders

**Service :** `placehold.co`

**Palette nouvelle charte :**
- Encre : `1A1613`
- Ivoire : `F2EDE4`
- Terra : `C56339`
- Violet : `5C3E7B`
- Pierre : `8A8278`

**Exemples :**

**Produits :**
```
https://placehold.co/600x750/F2EDE4/8A8278?text=Nom+Produit&font=source-sans-pro
```

**Lifestyle (accroche territorial) :**
```
https://placehold.co/900x1200/F2EDE4/8A8278?text=Atelier+1885&font=source-sans-pro
```

**Atelier (section encre) :**
```
https://placehold.co/1200x1400/2D2620/F2EDE4?text=Atelier+Serigraphie&font=source-sans-pro
```

**Artisans portraits :**
```
https://placehold.co/800x800/8A8278/F2EDE4?text=Prenom+Nom&font=source-sans-pro
```

### 10.2 Filtres CSS images artisans

**Effet sépia au repos :**
```css
grayscale(30%) sepia(20%)
```

**Hover : couleur complète :**
```css
grayscale(0) sepia(0)
transition: all 500ms
```

**Classes Tailwind :**
```typescript
className="grayscale-[30%] sepia-[20%] group-hover:grayscale-0 group-hover:sepia-0 transition-all duration-500"
```

### 10.3 Optimisation Next.js Image

**Toujours utiliser :**
```typescript
<Image
  src={...}
  alt={...}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, 50vw"
  priority={isAboveFold} // true pour hero, produit héros
/>
```

**Sizes appropriés :**
- Hero pleine largeur : `100vw`
- 2 colonnes : `(max-width: 768px) 100vw, 50vw`
- 3 colonnes : `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw`

---

## 11. Tests & Validation

### 11.1 Checklist Phase 1

- [ ] Variables CSS correctes (couleurs affichées partout)
- [ ] Fonts chargées (Josefin Sans + DM Sans)
- [ ] Header responsive (hamburger fonctionne)
- [ ] Drawer animations fluides (ouverture/fermeture)
- [ ] Logo centré desktop + mobile
- [ ] Badge panier terra avec count
- [ ] Toutes les pages existantes se chargent sans erreur
- [ ] ProductCard re-stylé (border terra hover)
- [ ] Buttons auto-adaptés (bg-encre, bg-terra)

### 11.2 Checklist Phase 2

- [ ] 7 sections homepage affichées dans l'ordre
- [ ] Hero : animation convergence 18/85 fonctionne
- [ ] Accroche : layout 2 colonnes responsive
- [ ] Produit héros : premier produit catalogue affiché
- [ ] Grille collection : 6 produits, stagger animation
- [ ] Éditions : scroll horizontal mobile fonctionnel
- [ ] Artisans : 3 portraits avec effet sépia
- [ ] Atelier : ligne terra visible en footer
- [ ] Responsive mobile : stack vertical correct
- [ ] Animations desktop : toutes fonctionnelles
- [ ] Animations mobile : simplifiées (fade uniquement)

### 11.3 Checklist Phase 3

- [ ] Page /collection : filtres fonctionnels
- [ ] Page /collection : compteur produits correct
- [ ] Page /collection : animation layout lors filtrage
- [ ] Page /editions : hero violet avec watermark visible
- [ ] Page /editions : badge numérotation proéminent
- [ ] Breadcrumbs corrects sur toutes les pages
- [ ] Links navigation drawer vers nouvelles pages

### 11.4 Checklist Phase 4

- [ ] Migration DB appliquée (tables créées)
- [ ] Seed data exécuté (3 artisans + associations + sections)
- [ ] GET /api/artisans : retourne artisans avec productIds
- [ ] GET /api/editorial?page=atelier : retourne sections
- [ ] Page /artisans : fetch API fonctionne
- [ ] Page /atelier : contenu dynamique affiché
- [ ] Section artisans homepage : fetch API fonctionne
- [ ] Associations artisan-produits correctes

---

## 12. Prochaines Étapes (Post-Phase 4)

### 12.1 Phase 5 : Admin UI (Optionnelle)

**Pages à créer :**
- `/admin/artisans` : CRUD artisans
- `/admin/contenu` : Éditer sections éditoriales

**Features :**
- Upload images (Supabase Storage ou Cloudinary)
- Rich text editor pour long bio
- Preview avant publication

### 12.2 Améliorations futures

**Court terme :**
- Migration placeholders → vraies photos Alfortville
- Page produit individuelle refonte (même style)
- Système de favoris (localStorage)

**Moyen terme :**
- Newsletter signup (Resend)
- Filtres avancés collection (prix, disponibilité)
- Recherche produits

**Long terme :**
- Blog/actualités manufacture
- Événements atelier (calendrier)
- Personnalisation produits

---

## 13. Notes Techniques

### 13.1 Performance

**Optimisations :**
- Dynamic imports pour sections lourdes (Framer Motion)
- Images lazy-load (sauf above fold)
- Animations `will-change: transform` uniquement au hover
- `viewport={{ once: true }}` sur toutes les animations scroll

**Bundle size :**
- Framer Motion : ~100KB (déjà installé)
- Josefin Sans + DM Sans : ~50KB (fonts)
- Pas de nouvelles dépendances

### 13.2 Accessibilité

**Maintenir :**
- Aria-labels existants
- Focus-visible terra
- Alt texts images
- Semantic HTML (section, article, nav)
- Keyboard navigation drawer

**Tester :**
- Screen reader (VoiceOver / NVDA)
- Keyboard-only navigation
- Color contrast (WCAG AA minimum)

### 13.3 SEO

**Metadata pages :**
```typescript
export const metadata: Metadata = {
  title: "Collection | 1885 Alfortville",
  description: "Découvrez nos créations artisanales...",
  openGraph: { ... }
};
```

**Structured data (optionnel Phase 5) :**
- Schema.org Product
- Schema.org Organization
- Schema.org BreadcrumbList

---

## 14. Glossaire

**Termes techniques :**
- **Stagger** : Délai progressif entre animations d'éléments multiples
- **useInView** : Hook Framer Motion pour déclencher animation au scroll
- **Clamp** : Fonction CSS pour valeur responsive (min, preferred, max)
- **Aspect ratio** : Ratio largeur/hauteur (ex: 4/5 = portrait)
- **Backdrop blur** : Flou d'arrière-plan (glassmorphism)

**Composants custom :**
- **ProductCard** : Carte produit (aspect 4/5, hover scale, badges)
- **EditionCard** : Variante ProductCard pour éditions (badge numérotation)
- **ArtisanCard** : Carte artisan (aspect 1/1, effet sépia)
- **SectionHeading** : Titre de section réutilisable (eyebrow + titre + subtitle)

---

## 15. Contact & Support

**Questions pendant implémentation :**
- Architecture : Consulter ce spec
- Design : Référence Figma (si disponible) ou ce spec
- Blocages techniques : Créer issue GitHub

**Validation :**
- Chaque phase : Deploy staging + review visuelle
- Phase finale : User acceptance testing (UAT) Alfortville

---

**Fin du Design Spec**

*Document généré le 2026-03-31 par Claude Sonnet 4.5*
*Approuvé pour implémentation*
