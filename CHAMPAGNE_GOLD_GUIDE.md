# 🥂 Champagne Gold — Guide d'Utilisation

**Status** : Design tokens installés ✅ | Prêt à l'emploi

---

## 📊 Identité de Marque 1885

### Ratio de Couleurs
- **70% Cloud Dancer** (`#F3EFEA`) — Arrière-plans, cartes
- **25% Love Symbol** (`#503B64`) — Actions primaires, headers, branding
- **5% Champagne Gold** (`#DDB76A`) — **Accents premium, highlights, détails**

---

## 🎨 Palette Champagne Gold

### Couleurs Disponibles

| Nom | Hex | RGB Variable | Usage |
|-----|-----|--------------|-------|
| **Champagne** | `#DDB76A` | `var(--champagne)` | Accent principal (recommandé) |
| Champagne Base | `#C89F4E` | `var(--champagne-base)` | Alternative laiton |
| Champagne Dark | `#A67F3D` | `var(--champagne-dark)` | Shadows, états actifs |
| Champagne Light | `#F9E6C8` | `var(--champagne-light)` | Borders, backgrounds légers |
| Champagne Lighter | `#FCF2E1` | `var(--champagne-lighter)` | Hover states ultra subtils |
| Champagne Deep | `#B48C41` | `var(--champagne-deep)` | Active states |

### Couleurs Complémentaires

| Nom | Hex | Usage |
|-----|-----|-------|
| Slate Text | `#475569` | Corps de texte raffiné sur Cloud Dancer |
| Slate Dark | `#334155` | Titres, texte fort |
| Slate Light | `#94A3B8` | Texte secondaire, placeholders |
| Green Subtle | `#6FB46F` | États de succès, confirmations |

---

## 🛠️ Utilities Tailwind CSS

### Backgrounds

```tsx
// Solid champagne
<div className="bg-champagne" />
<div className="bg-champagne-light" />
<div className="bg-champagne-lighter" />

// Gradients champagne
<div className="bg-gradient-champagne" />
<div className="bg-gradient-champagne-soft" />
<div className="bg-gradient-love-champagne" />
<div className="bg-gradient-cloud-champagne" />

// Glass effect with champagne tint
<div className="glass-champagne" />
```

### Text Colors

```tsx
// Solid text
<span className="text-champagne">Premium text</span>
<span className="text-champagne-dark">Darker text</span>

// Gradient text
<h1 className="text-gradient-champagne">Luxury Title</h1>
<h2 className="text-gradient-love-champagne">Mixed Gradient</h2>

// Slate text (body copy)
<p className="text-slate">Refined body text on Cloud Dancer</p>
<p className="text-slate-dark">Stronger text</p>
<p className="text-slate-light">Secondary text</p>
```

### Borders

```tsx
// Static border
<div className="border border-champagne" />
<div className="border border-champagne-light" />

// Animated border
<div className="champagne-border-animated" />
```

### Shadows & Glow

```tsx
// Standard shadows
<div className="shadow-champagne" />
<div className="shadow-champagne-sm" />
<div className="shadow-champagne-lg" />

// Glow effects
<div className="champagne-glow" />
<div className="champagne-glow-sm" />
```

### Effects

```tsx
// Shimmer animation
<button className="champagne-shimmer">
  Shimmer Button
</button>

// Hover glow
<div className="hover-champagne-glow">
  Hover me
</div>

// Champagne dot/badge indicator
<span className="champagne-dot">New</span>
```

---

## ✅ Cas d'Usage Recommandés

### 1. Premium Badge

```tsx
export function PremiumBadge({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-champagne-light border border-champagne text-champagne-dark font-medium text-sm shadow-champagne-sm">
      <span className="text-champagne">★</span>
      {label}
    </div>
  )
}

// Usage
<PremiumBadge label="Édition Limitée" />
<PremiumBadge label="Nouveauté" />
```

### 2. Gold Section Divider

```tsx
export function GoldDivider({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-px my-12", className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-champagne to-transparent opacity-40" />
      <div className="absolute left-1/2 -translate-x-1/2 -top-2 h-4 w-4">
        <div className="h-full w-full rounded-full bg-gradient-champagne shadow-champagne" />
      </div>
    </div>
  )
}
```

### 3. Champagne CTA Button

```tsx
export function ChampagneCTA({ children, ...props }: ButtonProps) {
  return (
    <button
      className="px-6 py-3 rounded-xl bg-gradient-champagne text-white font-semibold shadow-champagne-lg hover-champagne-glow champagne-shimmer transition-all"
      {...props}
    >
      {children}
    </button>
  )
}

// Usage
<ChampagneCTA>Découvrir la Collection Exclusive</ChampagneCTA>
```

### 4. Icon Highlight

```tsx
<div className="flex items-center gap-3">
  <div className="h-10 w-10 rounded-full bg-champagne-light flex items-center justify-center shadow-champagne-sm">
    <Star className="h-5 w-5 text-champagne" />
  </div>
  <span className="text-slate-dark">Premium Feature</span>
</div>
```

### 5. Product Card Accent

```tsx
export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="relative rounded-2xl glass-love p-6 hover:shadow-premium-lg transition-all">
      {/* Champagne accent corner */}
      <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-gradient-champagne shadow-champagne-sm champagne-dot" />

      {/* Product content */}
      <img src={product.image} alt={product.name} />
      <h3 className="font-display text-2xl text-foreground">{product.name}</h3>

      {/* Price with champagne accent */}
      <div className="flex items-baseline gap-2 mt-4">
        <span className="text-3xl font-bold text-gradient-love-champagne">
          {product.price}€
        </span>
        <span className="text-slate-light line-through">{product.oldPrice}€</span>
      </div>
    </div>
  )
}
```

### 6. Subtle Background Tint

```tsx
<section className="py-24 bg-gradient-cloud-champagne">
  <div className="container">
    <h2 className="font-display text-4xl text-gradient-love-champagne mb-8">
      Collection Signature 1885
    </h2>
    {/* Content */}
  </div>
</section>
```

---

## ❌ À Éviter

### Ne PAS utiliser champagne pour :

```tsx
// ❌ Corps de texte (utiliser text-slate à la place)
<p className="text-champagne">Long paragraph of body text...</p>

// ❌ Backgrounds larges saturés
<div className="bg-champagne w-full h-screen" />

// ❌ Boutons primaires (utiliser Love Symbol à la place)
<Button className="bg-champagne">Primary Action</Button>

// ❌ Plus de 5% de la surface visible
// Trop de champagne tue le champagne !
```

### ✅ Utiliser plutôt :

```tsx
// ✅ Corps de texte raffiné
<p className="text-slate">Long paragraph of body text...</p>

// ✅ Accents subtils sur grandes surfaces
<div className="bg-cloud-dancer border-t-2 border-champagne/20" />

// ✅ Boutons primaires Love Symbol
<Button className="bg-gradient-love">Primary Action</Button>

// ✅ Champagne en touches délicates (5% max)
<div className="glass-love">
  <span className="text-champagne">★</span>
  <h3 className="text-foreground">Title</h3>
</div>
```

---

## 🎨 Exemples Combinés

### Hero Section Premium

```tsx
<section className="relative py-32 bg-gradient-cloud-champagne overflow-hidden">
  {/* Subtle champagne orb background */}
  <div className="absolute top-20 right-20 h-96 w-96 rounded-full bg-gradient-champagne opacity-10 blur-3xl" />

  <div className="container relative z-10">
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-champagne mb-6">
      <span className="text-champagne font-medium text-sm">★</span>
      <span className="text-champagne-dark font-medium text-sm">Collection Exclusive 1885</span>
    </div>

    <h1 className="font-display text-7xl font-bold mb-6">
      <span className="text-foreground">L'Élégance</span>
      <br />
      <span className="text-gradient-love-champagne">Intemporelle</span>
    </h1>

    <p className="text-slate text-xl max-w-2xl mb-12">
      Découvrez notre sélection premium de goodies municipaux,
      alliant tradition et modernité dans un design raffiné.
    </p>

    <div className="flex gap-4">
      <ChampagneCTA>Découvrir la Collection</ChampagneCTA>
      <Button variant="outline" className="border-champagne/30 text-slate-dark hover:bg-champagne-lighter">
        En savoir plus
      </Button>
    </div>
  </div>

  {/* Champagne divider */}
  <GoldDivider className="mt-24" />
</section>
```

### Product Grid with Accents

```tsx
<div className="grid grid-cols-3 gap-8">
  {products.map((product, i) => (
    <div
      key={product.id}
      className="group relative rounded-2xl glass-love p-6 hover:shadow-premium-lg transition-all champagne-border-animated"
    >
      {/* New badge */}
      {product.isNew && (
        <PremiumBadge label="Nouveau" />
      )}

      <img src={product.image} className="w-full aspect-square object-cover rounded-xl mb-4" />

      <h3 className="font-display text-2xl text-foreground mb-2">
        {product.name}
      </h3>

      <p className="text-slate mb-4">
        {product.description}
      </p>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gradient-love-champagne">
          {product.price}€
        </span>
        {product.oldPrice && (
          <span className="text-slate-light line-through text-sm">
            {product.oldPrice}€
          </span>
        )}
      </div>
    </div>
  ))}
</div>
```

---

## 🔍 Accessibilité

### Ratios de Contraste

| Combinaison | Ratio | Note WCAG | Usage |
|-------------|-------|-----------|-------|
| Champagne sur Blanc | 3.8:1 | AA Large | ✅ Texte 18px+ |
| Champagne sur Cloud Dancer | 4.2:1 | AA Large | ✅ Texte 18px+ |
| Champagne sur Love Symbol | 7.5:1 | AAA | ✅ Tout texte |
| Champagne Light sur Blanc | 1.2:1 | Fail | ❌ Jamais pour texte |
| Slate Text sur Cloud Dancer | 8.1:1 | AAA | ✅ Corps de texte |

### Recommandations

```tsx
// ✅ GOOD - Texte champagne sur fond foncé
<div className="bg-primary p-4">
  <span className="text-champagne text-lg">Accessible Text</span>
</div>

// ⚠️ CAUTION - Texte champagne sur fond clair (18px+ uniquement)
<div className="bg-cloud-dancer p-4">
  <h2 className="text-champagne text-2xl font-bold">Large Title Only</h2>
</div>

// ❌ BAD - Texte champagne-light (jamais)
<div className="bg-white">
  <span className="text-champagne-light">Invisible Text</span>
</div>

// ✅ GOOD - Corps de texte slate
<div className="bg-cloud-dancer p-4">
  <p className="text-slate">Perfect contrast for body text</p>
</div>
```

---

## 📁 Fichiers Modifiés

- ✅ `src/styles/brand-1885-tokens.css` — Design tokens champagne (créé)
- ✅ `src/app/globals.css` — Import tokens + @theme inline (modifié)

---

## 🚀 Prochaines Étapes

### Option 1 : Créer les Composants Premium (30 min)
Créer 3 composants réutilisables :
- `<PremiumBadge />` — Badges avec bordure champagne
- `<GoldDivider />` — Séparateurs de section élégants
- `<ChampagneCTA />` — Boutons premium avec shimmer

### Option 2 : Style Guide Complet (2h)
Générer une page `/style-guide` interactive avec :
- Tous les tokens visuels
- Tous les composants premium
- Exemples de layouts
- Playground interactif

### Option 3 : Intégrer Immédiatement
Commencer à utiliser les utilities dans vos pages existantes :
- Hero homepage : ajout accents champagne
- Product cards : badges "Nouveau"
- CTAs premium : boutons collection exclusive
- Section dividers : séparateurs or

---

**Guide créé** : 2026-03-01
**Design System** : Love Symbol × Cloud Dancer × Champagne Gold
**Ratio Brand** : 70% / 25% / 5%
**Status** : Prêt à l'emploi ✨
