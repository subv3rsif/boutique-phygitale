# 🎨 Bottom Navigation Bar - Guide d'Implémentation

> **Floating Pill Design** inspiré d'Iconly – Shop Market
> Intégré au design system **Love Symbol × Cloud Dancer**

---

## 📦 Ce qui a été créé

### 1️⃣ Fichiers Navigation
```
src/components/navigation/
├── bottom-nav.tsx             # ✨ Composant principal (UI)
├── bottom-nav-wrapper.tsx     # 🔌 Wrapper Zustand (connexion store)
├── nav-items.ts               # ⚙️ Configuration (items, routes exclues)
└── README.md                  # 📚 Documentation détaillée
```

### 2️⃣ Pages de destination
```
src/app/
├── explorer/page.tsx          # 🧭 Page Explorer (placeholder)
├── favoris/page.tsx           # ❤️ Page Favoris (placeholder)
└── profil/page.tsx            # 👤 Page Profil (placeholder)
```

### 3️⃣ Intégration Layout
```tsx
// src/app/layout.tsx
import { BottomNavWrapper } from "@/components/navigation/bottom-nav-wrapper";

export default function RootLayout({ children }) {
  return (
    <body>
      <ThemeProvider>
        <Header />
        <main className="pb-24">{children}</main>     {/* ⚠️ pb-24 ajouté */}
        <Footer className="mb-20" />                 {/* ⚠️ mb-20 ajouté */}
        <BottomNavWrapper />                         {/* ✅ Ajouté */}
        <Toaster />
      </ThemeProvider>
    </body>
  );
}
```

---

## 🎯 Fonctionnalités Implémentées

### ✨ Design System
| Feature | Implementation |
|---------|---------------|
| **Glassmorphism** | `glass-vibrant` (backdrop-blur-md) |
| **Shadows** | `shadow-premium-lg` |
| **Colors** | Love Symbol (#503B64) × Cloud Dancer (#F3EFEA) |
| **Shape** | `rounded-full` pill + `max-w-[560px]` |

### 🎨 Cart Button (Central)
- **Position** : Surélevé `-top-2` dans une sous-pill
- **Color** : Magenta `bg-fuchsia-600`
- **Shadow** : `shadow-premium-purple`
- **Size** : `h-14 w-14` (légèrement plus grand)

### 📛 Badge Counter
- **Animation** : Framer Motion `scale` avec spring physics
- **Transition** : Pop effect (stiffness: 500, damping: 15)
- **Display** : Affiche "99+" si > 99
- **Visibility** : AnimatePresence pour entrée/sortie fluide

### 🎭 Active Indicator
- **Animation** : `layoutId="activeIndicator"` (Framer Motion)
- **Style** : Fond gradient subtil `bg-gradient-love opacity-10`
- **Transition** : Spring (stiffness: 380, damping: 30)

### 📱 iOS Safe Areas
```tsx
className={cn(
  'fixed bottom-4 left-0 right-0 z-50',
  'pb-[env(safe-area-inset-bottom)]', // ✅ Support notch
)}
```

### ♿ Accessibilité
- ✅ `aria-label` sur tous les liens
- ✅ `aria-current="page"` sur l'item actif
- ✅ `focus-visible` ring avec offset
- ✅ Icons avec `aria-hidden="true"`

---

## 🔌 Connexion au Store Zustand

### Actuellement Connecté

```tsx
// bottom-nav-wrapper.tsx
export function BottomNavWrapper() {
  const cartStore = useCart();
  const cartCount = cartStore.totalItems(); // ✅ Auto-sync

  return <BottomNav cartCount={cartCount} />;
}
```

Le compteur du panier se met à jour automatiquement grâce à :
1. **Zustand** `useCart()` observable
2. **Persist middleware** (sauvegarde localStorage)
3. **totalItems()** méthode computed

### Ajouter un Badge "Favoris"

Si vous créez un store `useFavorites` similaire :

```tsx
// src/store/favorites.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type FavoritesStore = {
  items: string[];
  totalItems: () => number;
  addItem: (id: string) => void;
  removeItem: (id: string) => void;
};

export const useFavorites = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: () => get().items.length,
      addItem: (id) => set((state) => ({ items: [...state.items, id] })),
      removeItem: (id) => set((state) => ({ items: state.items.filter(i => i !== id) })),
    }),
    { name: 'favorites-storage' }
  )
);
```

**Puis modifier `bottom-nav-wrapper.tsx`** :

```tsx
'use client';

import { useCart } from '@/store/cart';
import { useFavorites } from '@/store/favorites'; // ✅ Import
import { BottomNav } from './bottom-nav';

export function BottomNavWrapper() {
  const cartStore = useCart();
  const favoritesStore = useFavorites(); // ✅ Hook

  const cartCount = cartStore.totalItems();
  const favoritesCount = favoritesStore.totalItems(); // ✅ Récupère le count

  return (
    <BottomNav
      cartCount={cartCount}
      favoritesCount={favoritesCount} // ✅ Passe en prop
    />
  );
}
```

**Et modifier `bottom-nav.tsx` (ligne ~30)** :

```tsx
export type BottomNavProps = {
  cartCount?: number;
  favoritesCount?: number; // ✅ Ajout
  onCartClick?: () => void;
  className?: string;
};

export function BottomNav({
  cartCount = 0,
  favoritesCount = 0, // ✅ Ajout
  onCartClick,
  className,
}: BottomNavProps) {
  // ... reste du code

  // Dans le map des items (ligne ~135)
  {!item.isCart && item.href === '/favoris' && favoritesCount > 0 && (
    <AnimatePresence mode="wait">
      <motion.div
        key={favoritesCount}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
        className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center border-2 border-background"
      >
        {favoritesCount > 99 ? '99+' : favoritesCount}
      </motion.div>
    </AnimatePresence>
  )}
```

---

## 🚫 Routes Exclues (Auto-Hide)

La Bottom Nav se masque automatiquement sur :

```ts
// nav-items.ts
export const EXCLUDED_ROUTES = [
  '/login',           // Auth
  '/register',
  '/checkout',        // Checkout flow
  '/commande/success',
  '/admin',           // Admin panel
  '/retrait',         // Pickup validation
];
```

**Pour ajouter une route** :
```ts
export const EXCLUDED_ROUTES = [
  // ... routes existantes
  '/mon-compte/settings', // ✅ Nouvelle route
];
```

---

## 🎨 Personnalisation Rapide

### Changer la couleur du Cart
```tsx
// bottom-nav.tsx (ligne 26)
const CART_BUTTON_BG = 'bg-blue-600'; // Au lieu de fuchsia-600
```

### Modifier le max-width
```tsx
// bottom-nav.tsx (ligne 25)
const DOCK_MAX_WIDTH = 'max-w-[480px]'; // Plus étroit
const DOCK_MAX_WIDTH = 'max-w-[640px]'; // Plus large
```

### Changer les icônes
```tsx
// nav-items.ts
import { Home, Sparkles, ShoppingCart, Heart, UserCircle } from 'lucide-react';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Accueil', href: '/', icon: Home },
  { label: 'Explorer', href: '/explorer', icon: Sparkles }, // ✨ Nouvelle icône
  // ...
];
```

### Masquer sur Desktop
```tsx
// bottom-nav.tsx (ligne ~62)
<nav className={cn(
  'fixed bottom-4 left-0 right-0 z-50',
  'md:hidden', // ✅ Masque sur ≥768px
  // ...
)}>
```

---

## 🧪 Tester l'Implémentation

### 1️⃣ Dev Server
```bash
npm run dev
```

### 2️⃣ Checklist Manuelle
- [ ] La nav s'affiche en bas de l'écran (mobile)
- [ ] Le bouton Cart est surélevé et magenta
- [ ] Cliquer sur Home/Explorer/Favoris/Profil navigue bien
- [ ] L'indicator actif suit la page courante
- [ ] Ajouter un produit au panier → badge s'anime avec "pop"
- [ ] Badge affiche le bon nombre d'items
- [ ] Aller sur `/checkout` → nav disparaît
- [ ] Aller sur `/` → nav réapparaît
- [ ] Le footer ne chevauche pas la nav (mb-20 sur footer)

### 3️⃣ Test iOS Safe Area
Sur iPhone avec notch/Dynamic Island :
- [ ] La nav ne chevauche pas l'indicateur Home
- [ ] `env(safe-area-inset-bottom)` appliqué correctement

### 4️⃣ Test Dark Mode
```tsx
// Basculer le theme
<ThemeToggle />
```
- [ ] Glassmorphism s'adapte au dark mode
- [ ] Couleurs restent lisibles
- [ ] Shadows subtiles en dark

---

## 🐛 Problèmes Courants

### ❌ Nav chevauche le footer
**Solution** : Ajouter `mb-20` au footer et `pb-24` au main.

```tsx
<main className="pb-24">{children}</main>
<footer className="mb-20">...</footer>
```

### ❌ Badge ne s'anime pas
**Solution** : Vérifier Framer Motion installé.
```bash
npm install framer-motion@^12.33.0
```

### ❌ Icons manquantes
**Solution** : Vérifier lucide-react.
```bash
npm install lucide-react@latest
```

### ❌ cartCount ne met pas à jour
**Solution** : Vérifier le Zustand store.
```tsx
// Vérifier dans DevTools
console.log(useCart.getState().totalItems());
```

### ❌ Nav visible sur desktop
**Solution** : Ajouter `md:hidden` au `<nav>`.

---

## 📚 Structure Technique

```
┌─────────────────────────────────────────┐
│         layout.tsx (Server)             │
│  ┌───────────────────────────────────┐  │
│  │  BottomNavWrapper (Client)        │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  useCart() → totalItems()   │  │  │
│  │  │         ↓                    │  │  │
│  │  │  BottomNav (Presentational) │  │  │
│  │  │  - cartCount prop           │  │  │
│  │  │  - Framer Motion animations │  │  │
│  │  │  - Lucide icons             │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Avantages** :
- ✅ `layout.tsx` reste Server Component (performance)
- ✅ Séparation logique / présentation (testabilité)
- ✅ Facile d'ajouter d'autres stores (favorites, notifications)

---

## 🎯 Next Steps

1. **Implémenter les pages** :
   - [ ] `/explorer` - Catalogue complet avec filtres
   - [ ] `/favoris` - Liste des produits favoris
   - [ ] `/profil` - Infos utilisateur, historique commandes

2. **Analytics** :
   ```tsx
   onCartClick={() => {
     analytics.track('cart_clicked', { cartCount });
   }}
   ```

3. **Haptic Feedback** (mobile) :
   ```tsx
   onClick={() => {
     if ('vibrate' in navigator) {
       navigator.vibrate(10); // 10ms
     }
   }}
   ```

4. **PWA Badge** :
   Ajouter un badge "Installer l'app" sur le bouton Profile.

5. **Notifications Badge** :
   Ajouter un badge sur Profile pour les notifications non lues.

---

## ✅ Résumé

### Ce qui fonctionne
✅ Bottom Nav Floating Pill design
✅ Connexion automatique au store Zustand (`useCart`)
✅ Badge animé avec compteur panier
✅ Active indicator avec Framer Motion
✅ iOS Safe Areas support
✅ Routes exclues (checkout, login, admin)
✅ Accessibilité (aria-labels, focus-visible)
✅ Dark mode compatible

### Prêt pour
🚀 Développement (npm run dev)
🚀 Production (npm run build)
🚀 Déploiement Vercel

---

**Créé avec 💜 pour Boutique 1885**
*Design System : Love Symbol × Cloud Dancer*
