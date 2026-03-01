# 🥂 Composants Premium — Exemples d'Utilisation

**Status** : 3 composants créés ✅ | Prêts à l'emploi

---

## 📦 Import

```tsx
// Import depuis le barrel file premium
import { PremiumBadge, GoldDivider, ChampagneCTA } from "@/components/ui/premium"

// Ou import direct
import { PremiumBadge } from "@/components/ui/premium-badge"
import { GoldDivider } from "@/components/ui/gold-divider"
import { ChampagneCTA } from "@/components/ui/champagne-cta"
```

---

## 1️⃣ PremiumBadge — Badges Premium

### Usage Basique

```tsx
import { PremiumBadge } from "@/components/ui/premium"

export function ProductCard() {
  return (
    <div className="relative">
      {/* Badge "Nouveau" */}
      <PremiumBadge label="Nouveau" variant="solid" size="sm" />

      {/* Badge "Édition Limitée" */}
      <PremiumBadge label="Édition Limitée" variant="outlined" />

      {/* Badge "Exclusif" avec effet glass */}
      <PremiumBadge label="Exclusif" variant="glass" />
    </div>
  )
}
```

### Badges avec Icons Personnalisés

```tsx
import { PremiumBadgeIcon } from "@/components/ui/premium"
import { Crown, Award, Zap } from "lucide-react"

export function ProductHighlights() {
  return (
    <div className="flex gap-2">
      <PremiumBadgeIcon
        label="Récompensé"
        icon={<Award className="h-3.5 w-3.5 text-champagne" />}
        variant="outlined"
      />

      <PremiumBadgeIcon
        label="Premium"
        icon={<Crown className="h-3.5 w-3.5 text-white" />}
        variant="solid"
      />

      <PremiumBadgeIcon
        label="Flash"
        icon={<Zap className="h-3.5 w-3.5 text-champagne-dark" />}
        variant="glass"
      />
    </div>
  )
}
```

### Dot Indicator Minimal

```tsx
import { PremiumDot } from "@/components/ui/premium"

export function NotificationBell() {
  return (
    <button className="relative">
      <Bell className="h-6 w-6" />
      {/* Dot premium en haut à droite */}
      <PremiumDot className="absolute top-0 right-0" />
    </button>
  )
}
```

### Cas d'Usage Réels

```tsx
// Product Card avec badge "Nouveau"
<div className="product-card">
  <div className="absolute top-4 left-4 z-10">
    <PremiumBadge label="Nouveau" variant="solid" size="sm" />
  </div>
  <img src={product.image} />
  <h3>{product.name}</h3>
</div>

// Badge "Stock Limité" sur le panier
<div className="cart-item">
  <span>{product.name}</span>
  {product.stock < 5 && (
    <PremiumBadge label="Stock Limité" variant="outlined" size="sm" showStar={false} />
  )}
</div>

// Badge "Meilleure Vente" sur grille produits
<div className="grid grid-cols-3 gap-4">
  {products.map(product => (
    <div key={product.id} className="relative">
      {product.isBestSeller && (
        <PremiumBadge label="Meilleure Vente" variant="glass" />
      )}
      {/* Product content */}
    </div>
  ))}
</div>
```

---

## 2️⃣ GoldDivider — Séparateurs Dorés

### Variants de Base

```tsx
import { GoldDivider } from "@/components/ui/premium"

export function ContentSection() {
  return (
    <>
      <section>
        <h2>Section 1</h2>
        <p>Content...</p>
      </section>

      {/* Divider avec cercle central */}
      <GoldDivider variant="circle" spacing="lg" />

      <section>
        <h2>Section 2</h2>
        <p>Content...</p>
      </section>

      {/* Divider avec diamant */}
      <GoldDivider variant="diamond" spacing="md" />

      <section>
        <h2>Section 3</h2>
        <p>Content...</p>
      </section>
    </>
  )
}
```

### Divider avec Texte

```tsx
import { GoldDividerText } from "@/components/ui/premium"

export function CollectionPage() {
  return (
    <div>
      <ProductGrid category="vetements" />

      {/* Divider avec label */}
      <GoldDividerText text="Accessoires" spacing="xl" />

      <ProductGrid category="accessoires" />

      <GoldDividerText text="Décoration" spacing="xl" />

      <ProductGrid category="decoration" />
    </div>
  )
}
```

### Divider Vertical (Layouts Horizontaux)

```tsx
import { GoldDividerVertical } from "@/components/ui/premium"

export function StatsBar() {
  return (
    <div className="flex items-center gap-8 justify-center">
      <div className="text-center">
        <span className="text-4xl font-bold text-gradient-love">150+</span>
        <p className="text-slate">Produits</p>
      </div>

      <GoldDividerVertical height="h-20" />

      <div className="text-center">
        <span className="text-4xl font-bold text-gradient-love">5000+</span>
        <p className="text-slate">Clients</p>
      </div>

      <GoldDividerVertical height="h-20" />

      <div className="text-center">
        <span className="text-4xl font-bold text-gradient-love">4.9★</span>
        <p className="text-slate">Satisfaction</p>
      </div>
    </div>
  )
}
```

### Divider Décoratif (Ornate)

```tsx
import { GoldDividerDecorative } from "@/components/ui/premium"

export function HeroSection() {
  return (
    <section className="text-center py-24">
      <h1 className="font-display text-6xl">Collection 1885</h1>
      <p className="text-slate text-xl">L'élégance intemporelle</p>

      {/* Divider décoratif avec multiple ornements */}
      <GoldDividerDecorative />

      <ChampagneCTA>Découvrir</ChampagneCTA>
    </section>
  )
}
```

### Divider avec Icon Personnalisé

```tsx
import { GoldDivider } from "@/components/ui/premium"
import { Star, Heart, Crown } from "lucide-react"

export function ThemedDividers() {
  return (
    <>
      {/* Divider avec étoile */}
      <GoldDivider
        variant="custom"
        ornament={<Star className="h-4 w-4 fill-champagne text-champagne" />}
      />

      {/* Divider avec cœur */}
      <GoldDivider
        variant="custom"
        ornament={<Heart className="h-4 w-4 fill-champagne text-champagne" />}
      />

      {/* Divider avec couronne */}
      <GoldDivider
        variant="custom"
        ornament={<Crown className="h-4 w-4 text-champagne" />}
      />
    </>
  )
}
```

---

## 3️⃣ ChampagneCTA — Boutons Premium

### Variants de Base

```tsx
import { ChampagneCTA } from "@/components/ui/premium"

export function CTASection() {
  return (
    <div className="flex gap-4">
      {/* Solid gradient (default) */}
      <ChampagneCTA variant="solid">
        Découvrir la Collection
      </ChampagneCTA>

      {/* Outline */}
      <ChampagneCTA variant="outline">
        En savoir plus
      </ChampagneCTA>

      {/* Ghost (minimal) */}
      <ChampagneCTA variant="ghost">
        Voir tout
      </ChampagneCTA>
    </div>
  )
}
```

### Tailles

```tsx
<div className="space-y-4">
  <ChampagneCTA size="sm">Small Button</ChampagneCTA>
  <ChampagneCTA size="md">Medium Button</ChampagneCTA>
  <ChampagneCTA size="lg">Large Button</ChampagneCTA>
  <ChampagneCTA size="xl">Extra Large Button</ChampagneCTA>
</div>
```

### Icons

```tsx
import { ShoppingBag, Gift, Sparkles } from "lucide-react"

<div className="flex flex-col gap-4">
  {/* Flèche (default) */}
  <ChampagneCTA icon="arrow">
    Voir les Produits
  </ChampagneCTA>

  {/* Sparkles */}
  <ChampagneCTA icon="sparkles">
    Offre Exclusive
  </ChampagneCTA>

  {/* Custom icon */}
  <ChampagneCTA icon={<ShoppingBag className="h-5 w-5" />}>
    Ajouter au Panier
  </ChampagneCTA>

  {/* Icon à gauche */}
  <ChampagneCTA
    icon={<Gift className="h-5 w-5" />}
    iconPosition="left"
  >
    Offrir un Cadeau
  </ChampagneCTA>

  {/* Pas d'icon */}
  <ChampagneCTA icon="none">
    Simple Button
  </ChampagneCTA>
</div>
```

### Full Width

```tsx
export function CheckoutCTA() {
  return (
    <div className="w-full max-w-md">
      <ChampagneCTA fullWidth size="lg">
        Finaliser ma Commande
      </ChampagneCTA>
    </div>
  )
}
```

### CTA Group (Spacing Automatique)

```tsx
import { ChampagneCTAGroup } from "@/components/ui/premium"

export function HeroActions() {
  return (
    <ChampagneCTAGroup>
      <ChampagneCTA size="lg" icon="sparkles">
        Découvrir Maintenant
      </ChampagneCTA>

      <ChampagneCTA variant="outline" size="lg">
        En savoir plus
      </ChampagneCTA>
    </ChampagneCTAGroup>
  )
}

// Vertical orientation
<ChampagneCTAGroup orientation="vertical">
  <ChampagneCTA>Option 1</ChampagneCTA>
  <ChampagneCTA>Option 2</ChampagneCTA>
  <ChampagneCTA>Option 3</ChampagneCTA>
</ChampagneCTAGroup>
```

### Floating Action Button (FAB)

```tsx
import { ChampagneFAB } from "@/components/ui/premium"
import { ShoppingBag, MessageCircle, Phone } from "lucide-react"

export function FloatingActions() {
  return (
    <>
      {/* Panier en bas à droite */}
      <ChampagneFAB
        icon={<ShoppingBag className="h-6 w-6" />}
        label="Panier"
        position="bottom-right"
        onClick={() => router.push('/panier')}
      />

      {/* Support chat en bas à gauche */}
      <ChampagneFAB
        icon={<MessageCircle className="h-6 w-6" />}
        label="Support"
        position="bottom-left"
        onClick={() => openChat()}
      />

      {/* Appel en haut à droite */}
      <ChampagneFAB
        icon={<Phone className="h-6 w-6" />}
        position="top-right"
        onClick={() => window.open('tel:+33123456789')}
      />
    </>
  )
}
```

---

## 🎨 Exemples Combinés (Real-World)

### Hero Section Premium

```tsx
import { PremiumBadge, GoldDivider, ChampagneCTA } from "@/components/ui/premium"
import { Star } from "lucide-react"

export function PremiumHero() {
  return (
    <section className="relative py-32 bg-gradient-cloud-champagne overflow-hidden">
      {/* Background orb */}
      <div className="absolute top-20 right-20 h-96 w-96 rounded-full bg-gradient-champagne opacity-10 blur-3xl" />

      <div className="container relative z-10 text-center space-y-8">
        {/* Premium badge */}
        <PremiumBadge label="Collection Exclusive 1885" variant="solid" size="lg" />

        {/* Heading */}
        <h1 className="font-display text-7xl font-bold text-gradient-love-champagne">
          L'Élégance Intemporelle
        </h1>

        <p className="text-slate text-xl max-w-2xl mx-auto">
          Découvrez notre sélection premium de goodies municipaux,
          alliant tradition et modernité.
        </p>

        {/* Divider */}
        <GoldDivider variant="diamond" spacing="md" />

        {/* Features */}
        <div className="flex justify-center gap-8">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-champagne fill-champagne/20" />
            <span className="text-slate">Qualité Premium</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-champagne fill-champagne/20" />
            <span className="text-slate">Fabrication Française</span>
          </div>
        </div>

        {/* CTAs */}
        <ChampagneCTAGroup>
          <ChampagneCTA size="lg" icon="sparkles">
            Découvrir la Collection
          </ChampagneCTA>
          <ChampagneCTA variant="outline" size="lg" icon="none">
            En savoir plus
          </ChampagneCTA>
        </ChampagneCTAGroup>
      </div>
    </section>
  )
}
```

### Product Card Premium

```tsx
import { PremiumBadge, ChampagneCTA } from "@/components/ui/premium"
import { type Product } from "@/lib/catalogue"

export function PremiumProductCard({ product }: { product: Product }) {
  return (
    <div className="relative group rounded-2xl glass-love p-6 hover:shadow-premium-lg transition-all champagne-border-animated">
      {/* "Nouveau" badge */}
      {product.isNew && (
        <div className="absolute top-4 left-4 z-10">
          <PremiumBadge label="Nouveau" variant="solid" size="sm" />
        </div>
      )}

      {/* "Stock Limité" badge */}
      {product.stock < 5 && (
        <div className="absolute top-4 right-4 z-10">
          <PremiumBadge label="Stock Limité" variant="outlined" size="sm" showStar={false} />
        </div>
      )}

      {/* Image */}
      <img
        src={product.image}
        alt={product.name}
        className="w-full aspect-square object-cover rounded-xl mb-4"
      />

      {/* Content */}
      <h3 className="font-display text-2xl text-foreground mb-2">
        {product.name}
      </h3>

      <p className="text-slate mb-4">
        {product.description}
      </p>

      {/* Price */}
      <div className="flex items-baseline gap-2 mb-6">
        <span className="text-3xl font-bold text-gradient-love-champagne">
          {product.price}€
        </span>
        {product.oldPrice && (
          <span className="text-slate-light line-through text-sm">
            {product.oldPrice}€
          </span>
        )}
      </div>

      {/* CTA */}
      <ChampagneCTA fullWidth icon="none">
        Ajouter au Panier
      </ChampagneCTA>
    </div>
  )
}
```

### Section Séparée par Catégories

```tsx
import { GoldDividerText } from "@/components/ui/premium"
import { ProductGrid } from "@/components/product/product-grid"

export function CatalogPage() {
  return (
    <div className="container py-16 space-y-16">
      {/* Vêtements */}
      <section>
        <h2 className="font-display text-4xl font-bold mb-8">Vêtements</h2>
        <ProductGrid products={vetements} />
      </section>

      <GoldDividerText text="Accessoires" spacing="xl" />

      {/* Accessoires */}
      <section>
        <h2 className="font-display text-4xl font-bold mb-8">Accessoires</h2>
        <ProductGrid products={accessoires} />
      </section>

      <GoldDividerText text="Décoration" spacing="xl" />

      {/* Décoration */}
      <section>
        <h2 className="font-display text-4xl font-bold mb-8">Décoration</h2>
        <ProductGrid products={decoration} />
      </section>
    </div>
  )
}
```

### Checkout Summary Premium

```tsx
import { PremiumBadge, GoldDivider, ChampagneCTA } from "@/components/ui/premium"
import { Lock } from "lucide-react"

export function CheckoutSummary({ cart }: { cart: CartItem[] }) {
  return (
    <div className="rounded-2xl glass-love p-8 space-y-6">
      {/* Header avec badge */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Récapitulatif</h2>
        <PremiumBadge label="Paiement Sécurisé" variant="glass" size="sm" showStar={false} />
      </div>

      <GoldDivider variant="line" spacing="sm" />

      {/* Items */}
      <div className="space-y-4">
        {cart.items.map(item => (
          <div key={item.id} className="flex justify-between">
            <span className="text-slate">{item.name} × {item.qty}</span>
            <span className="text-foreground font-semibold">{item.total}€</span>
          </div>
        ))}
      </div>

      <GoldDivider variant="line" spacing="sm" />

      {/* Totals */}
      <div className="space-y-2">
        <div className="flex justify-between text-slate">
          <span>Sous-total</span>
          <span>{cart.subtotal}€</span>
        </div>
        <div className="flex justify-between text-slate">
          <span>Livraison</span>
          <span>{cart.shipping}€</span>
        </div>
        <div className="flex justify-between text-xl font-bold">
          <span className="text-foreground">Total</span>
          <span className="text-gradient-love-champagne">{cart.total}€</span>
        </div>
      </div>

      {/* CTA */}
      <ChampagneCTA
        fullWidth
        size="lg"
        icon={<Lock className="h-5 w-5" />}
        iconPosition="left"
      >
        Payer {cart.total}€
      </ChampagneCTA>
    </div>
  )
}
```

---

## 🎯 Best Practices

### DO ✅

```tsx
// ✅ Utiliser PremiumBadge pour highlights importants
<PremiumBadge label="Nouveau" variant="solid" />

// ✅ Dividers pour séparer sections distinctes
<GoldDividerText text="Accessoires" spacing="xl" />

// ✅ ChampagneCTA pour actions premium/exclusives
<ChampagneCTA icon="sparkles">Collection Exclusive</ChampagneCTA>

// ✅ Combiner pour sections complètes
<section>
  <PremiumBadge label="Featured" />
  <h2>Title</h2>
  <GoldDivider />
  <Content />
  <ChampagneCTA>Action</ChampagneCTA>
</section>
```

### DON'T ❌

```tsx
// ❌ Trop de badges (overwhelming)
<div>
  <PremiumBadge label="Nouveau" />
  <PremiumBadge label="Exclusif" />
  <PremiumBadge label="Limité" />
  <PremiumBadge label="Premium" />
</div>

// ❌ Dividers trop rapprochés
<GoldDivider />
<p>Short text</p>
<GoldDivider /> {/* Trop proche */}

// ❌ ChampagneCTA pour toutes les actions (dilue l'impact)
<ChampagneCTA>Action banale</ChampagneCTA> {/* Utiliser Button normal */}

// ❌ Dépasser 5% de surface champagne
<div className="bg-champagne w-full h-screen"> {/* Trop de champagne */}
```

---

## 📖 Documentation Complète

- **Guide d'utilisation** : `CHAMPAGNE_GOLD_GUIDE.md`
- **Page démo interactive** : http://localhost:3000/premium-demo
- **Design tokens** : `src/styles/brand-1885-tokens.css`
- **Composants** : `src/components/ui/premium/`

---

**Créé** : 2026-03-01
**Composants** : 3 (PremiumBadge, GoldDivider, ChampagneCTA)
**Build** : ✅ Successful
**Status** : Production-ready 🚀
