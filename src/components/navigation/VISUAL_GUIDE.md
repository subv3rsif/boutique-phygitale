# 📐 Bottom Nav - Guide Visuel

## 🎨 Rendu Final

```
┌─────────────────────────────────────────────────┐
│                   HEADER                        │
│              (Header component)                 │
├─────────────────────────────────────────────────┤
│                                                 │
│                  MAIN CONTENT                   │
│                                                 │
│            (pb-24 pour éviter overlap)          │
│                                                 │
│                                                 │
├─────────────────────────────────────────────────┤
│                   FOOTER                        │
│              (mb-20 pour overlap)               │
└─────────────────────────────────────────────────┘

                    ┌─────────┐
          ┌─────────┤  CART   ├─────────┐  ← Elevated sub-pill
          │         │ (h-14)  │         │     (-top-2, bg-fuchsia-600)
          │         └────┬────┘         │
          │           ╔══╪══╗           │
    ┌─────┴───┬───────╬══╪══╬───────┬───┴─────┐
    │  HOME   │ EXPLORE ║ CART ║ SAVED │ PROFILE │ ← Main dock
    │  (h-12) │  (h-12) ║(h-14)║(h-12) │  (h-12) │
    └─────────┴─────────╩══════╩───────┴─────────┘
    ╰──────────────────────────────────────────────╯
              Floating Pill (h-16, rounded-full)
              max-w-[560px], bottom-4, glass-vibrant
```

---

## 🎯 Anatomie du Dock

### Structure Principale

```
┌──────────────────────────────────────────────────┐
│   Fixed Container (z-50, bottom-4)               │
│   ┌────────────────────────────────────────────┐ │
│   │  Dock (max-w-[560px], h-16, glass-vibrant)│ │
│   │  ┌──────────────────────────────────────┐ │ │
│   │  │  Items Container (flex justify-around)│ │ │
│   │  │                                       │ │ │
│   │  │  [Home] [Explore] [Cart*] [Saved] [Profile]
│   │  │                                       │ │ │
│   │  └──────────────────────────────────────┘ │ │
│   └────────────────────────────────────────────┘ │
│   pb-[env(safe-area-inset-bottom)] ← iOS notch  │
└──────────────────────────────────────────────────┘

*Cart est dans une sous-pill surélevée
```

---

## 🔍 Détails par Composant

### 1️⃣ Dock Container

```scss
// Classes Tailwind
fixed bottom-4 left-0 right-0 z-50
pb-[env(safe-area-inset-bottom)]
flex justify-center px-4

// Dimensions
max-w-[560px]    // Largeur max centrée
h-16             // Hauteur fixe (64px)

// Glassmorphism
glass-vibrant                    // Custom utility
backdrop-blur-md                 // Effet verre
shadow-premium-lg                // Ombre douce
border border-border/50          // Bordure subtile
rounded-full                     // Pill shape
```

### 2️⃣ Items Réguliers (Home, Explore, Saved, Profile)

```scss
// Dimensions
h-12 w-12        // 48×48px

// Shape
rounded-xl       // Coins arrondis

// États
default:   text-muted-foreground, strokeWidth: 1.5
hover:     text-foreground, scale-105
active:    text-primary, strokeWidth: 2, scale-110
           + bg-gradient-love opacity-10 (indicator)

// Animation indicator
layoutId="activeIndicator"       // Framer Motion
transition: spring (380/30)
```

### 3️⃣ Cart Button (Central)

```scss
// Dimensions
h-14 w-14        // 56×56px (plus grand que les autres)

// Positioning
relative -top-2  // Surélevé de 8px

// Colors
bg-fuchsia-600         // Magenta mat
text-white
shadow-premium-purple  // Ombre spécifique

// Shape
rounded-full

// Interactive
hover:  scale-1.05
tap:    scale-0.95
```

### 4️⃣ Cart Badge

```scss
// Positioning
absolute -top-1 -right-1  // Top right corner

// Dimensions
min-w-[20px] h-5 px-1.5   // Auto-width basé sur chiffres

// Colors
bg-red-500
text-white
border-2 border-background

// Typography
text-xs font-semibold

// Animation
initial:  scale: 0
animate:  scale: 1
exit:     scale: 0
transition: spring (500/15)
```

---

## 📏 Spacing & Dimensions

### Hiérarchie des tailles

```
Regular Items:  12 × 12  (48px)
Cart Button:    14 × 14  (56px)   ← +16.7% plus grand
Dock Height:    16       (64px)
Badge:           5       (20px)
```

### Safe Zones

```
┌────────────────────────────────────────┐
│ Screen Edge                            │
│  ↓                                     │
│  ├─ px-4 (16px) ─────────┐             │
│  │                       │             │
│  │   ┌─────────────────┐ │             │
│  │   │  DOCK CONTENT   │ │ ← max-w-[560px]
│  │   └─────────────────┘ │             │
│  │                       │             │
│  └───────────────────────┘             │
│                                        │
│  ↓ bottom-4 (16px)                     │
│  ↓ env(safe-area-inset-bottom)         │ ← iOS notch
└────────────────────────────────────────┘
```

---

## 🎨 États Visuels

### État Normal (Item inactif)

```
┌─────────┐
│  🏠     │  ← Icon: text-muted-foreground
│         │     strokeWidth: 1.5
└─────────┘     opacity: normal
```

### État Hover

```
┌─────────┐
│  🏠     │  ← Icon: text-foreground
│         │     scale: 1.05
└─────────┘     cursor: pointer
```

### État Active

```
╔═════════╗
║ ░░░░░░░ ║  ← Background: bg-gradient-love opacity-10
║ ░ 🏠 ░  ║     Icon: text-primary, strokeWidth: 2
║ ░░░░░░░ ║     scale: 1.10
╚═════════╝     layoutId animation
```

### Cart avec Badge

```
    ┌──┐
    │3 │  ← Badge: bg-red-500, scale animation
    └──┘
  ┌──────┐
  │  🛒  │  ← Cart: bg-fuchsia-600, elevated
  │      │
  └──────┘
```

---

## 🎭 Animations

### 1️⃣ Mount Animation (Dock apparition)

```ts
initial: { y: 100, opacity: 0 }    // Part d'en bas, invisible
animate: { y: 0, opacity: 1 }      // Monte à sa position, opaque
transition: {
  type: 'spring',
  stiffness: 260,
  damping: 20,
  delay: 0.2
}
```

Résultat : Le dock "glisse" vers le haut en 0.3s avec un effet ressort.

### 2️⃣ Active Indicator Animation

```ts
<motion.div layoutId="activeIndicator" />

// Quand on change de page :
Home → Explore : L'indicator se déplace fluidement (shared layout)
```

Résultat : Animation morphing fluide entre items.

### 3️⃣ Badge Pop Animation

```ts
key={cartCount}                    // Re-render si count change
initial: { scale: 0 }              // Invisible
animate: { scale: 1 }              // Apparaît
exit: { scale: 0 }                 // Disparaît
transition: {
  type: 'spring',
  stiffness: 500,                  // Très rapide
  damping: 15                      // Léger overshoot
}
```

Résultat : Le badge "pop" avec un rebond satisfaisant.

### 4️⃣ Cart Button Interactions

```ts
whileHover: { scale: 1.05 }       // +5% à l'hover
whileTap: { scale: 0.95 }         // -5% au tap
```

Résultat : Feedback tactile visuel.

---

## 🌈 Design Tokens Utilisés

### Couleurs (Love Symbol × Cloud Dancer)

```scss
// Light Mode
--love-symbol: #503B64           // Primary, active items
--cloud-dancer: #F3EFEA           // Background, cards
--muted-foreground: (love-light)  // Inactive icons

// Dark Mode
--background: (love-symbol-900)   // #231429
--foreground: (cloud-dancer)      // Text inversé

// Accent
--fuchsia-600: #C026D3            // Cart button
--red-500: #EF4444                // Badge
```

### Shadows

```scss
.shadow-premium-lg {
  box-shadow:
    0 2px 8px rgba(80, 59, 100, 0.08),
    0 8px 24px rgba(80, 59, 100, 0.12),
    0 20px 48px rgba(80, 59, 100, 0.16),
    0 40px 80px rgba(80, 59, 100, 0.2);
}

.shadow-premium-purple {
  box-shadow:
    0 4px 14px rgba(80, 59, 100, 0.25),
    0 12px 32px rgba(80, 59, 100, 0.18);
}
```

### Glassmorphism

```scss
.glass-vibrant {
  background: rgba(243, 239, 234, 0.6);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(80, 59, 100, 0.15);
}
```

---

## 📱 Responsive Behavior

### Mobile (< 768px)

```
┌─────────────────────────────┐
│                             │
│      MOBILE CONTENT         │
│                             │
│                             │
│          (pb-24)            │
└─────────────────────────────┘
        ┌─────────┐
        │  DOCK   │  ← Visible, centré
        └─────────┘
```

### Desktop (≥ 768px)

**Option 1** : Toujours visible
```
┌──────────────────────────────────────┐
│        DESKTOP CONTENT               │
│                                      │
│                                      │
│                                      │
└──────────────────────────────────────┘
              ┌─────────┐
              │  DOCK   │  ← Toujours visible
              └─────────┘
```

**Option 2** : Masqué (recommandé)
```tsx
<nav className="... md:hidden">  // ← Masqué sur desktop
```

---

## 🧩 Flux de Données

```
┌────────────────────────────────────────────┐
│  User Action                               │
│  "Ajoute produit au panier"                │
└────────────────┬───────────────────────────┘
                 ↓
┌────────────────────────────────────────────┐
│  Zustand Store (useCart)                   │
│  - items: [{ id: '1', qty: 1 }]            │
│  - addItem('1', 1)                         │
│  - totalItems() → 1                        │
└────────────────┬───────────────────────────┘
                 ↓
┌────────────────────────────────────────────┐
│  BottomNavWrapper                          │
│  const cartCount = useCart().totalItems()  │
│  → 1                                       │
└────────────────┬───────────────────────────┘
                 ↓
┌────────────────────────────────────────────┐
│  BottomNav                                 │
│  <BottomNav cartCount={1} />               │
└────────────────┬───────────────────────────┘
                 ↓
┌────────────────────────────────────────────┐
│  Badge Component                           │
│  {cartCount > 0 && <Badge>{1}</Badge>}     │
│  → Animate: scale 0 → 1 (pop!)             │
└────────────────────────────────────────────┘
```

---

## 🎯 Design Principles

### 1️⃣ Hiérarchie Visuelle
- Cart **central** et **élevé** → Action primaire
- Items réguliers **égaux** → Navigation secondaire
- Badge **rouge vif** → Attention urgente

### 2️⃣ Affordance
- **Pill shape** → Suggère conteneur séparé du contenu
- **Glassmorphism** → Suggère élément flottant au-dessus
- **Shadows** → Renforcent la profondeur
- **Hover scale** → Suggère interactivité

### 3️⃣ Feedback
- **Active indicator** → Position claire dans l'app
- **Badge animation** → Confirmation d'action réussie
- **Scale on tap** → Feedback tactile immédiat

### 4️⃣ Consistency
- **Icons** : Toujours 24×24px (w-6 h-6)
- **Stroke** : 1.5 inactif, 2.0 actif
- **Spacing** : justify-around → Equal gaps
- **Colors** : Toujours depuis design tokens

---

## ✅ Checklist Visuelle

### Avant de lancer
- [ ] Dock centré horizontalement
- [ ] Hauteur totale = 16 (64px)
- [ ] Cart button surélevé de -top-2 (8px)
- [ ] Glassmorphism appliqué (backdrop-blur visible)
- [ ] Shadows douces et subtiles
- [ ] Badge badge en top-right du Cart
- [ ] Active indicator suit la page courante
- [ ] Spacing uniforme entre items (justify-around)
- [ ] Safe area iOS respectée (pb-env)
- [ ] Footer ne chevauche pas (mb-20)

### Interactions à tester
- [ ] Hover sur item → Scale 1.05
- [ ] Tap sur item → Scale 0.95
- [ ] Changement de page → Indicator animé
- [ ] Ajout au panier → Badge pop
- [ ] Scroll de page → Dock reste fixe
- [ ] Navigation rapide → Pas de lag

---

**Design créé avec 💜 pour Boutique 1885**
*Inspiré par Iconly – Shop Market*
