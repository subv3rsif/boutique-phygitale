# Bottom Navigation Bar - Floating Pill 🎨

Navigation mobile haut de gamme inspirée du style **Iconly – Shop Market**, intégrée au design system Love Symbol × Cloud Dancer.

---

## 📁 Structure

```
src/components/navigation/
├── bottom-nav.tsx          # Composant principal (Client Component)
├── bottom-nav-wrapper.tsx  # Wrapper Zustand (Client Component)
├── nav-items.ts            # Configuration des items
└── README.md               # Documentation
```

---

## 🎯 Fonctionnalités

### ✨ Design
- **Floating Pill** : Dock arrondi avec effet verre (glassmorphism)
- **Elevated Cart** : Bouton panier surélevé dans une sous-pill magenta
- **Animated Badge** : Compteur avec animation "pop" lors des changements
- **Active Indicator** : Fond gradient subtil sur l'item actif

### 🔧 Technique
- **iOS Safe Areas** : Support `env(safe-area-inset-bottom)` pour notch
- **Framer Motion** : Animations fluides (spring, scale, layout)
- **Client Component** : Wrapper séparé pour garder `layout.tsx` en Server Component
- **Accessibilité** : Aria-labels, focus-visible, aria-current

### 🎨 Personnalisation
- Utilise les utilities custom de `globals.css` :
  - `glass-vibrant` - Glassmorphism
  - `shadow-premium-lg` - Ombre douce
  - `shadow-premium-purple` - Ombre magenta (cart)
  - `bg-gradient-love` - Gradient Love Symbol (indicator actif)

---

## 🚀 Installation & Intégration

### 1️⃣ Déjà intégré dans `layout.tsx`
```tsx
import { BottomNavWrapper } from "@/components/navigation/bottom-nav-wrapper";

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <ThemeProvider>
          <Header />
          <main className="pb-24">{children}</main> {/* ⚠️ padding-bottom important! */}
          <Footer className="mb-20" />           {/* ⚠️ margin-bottom important! */}
          <BottomNavWrapper />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 2️⃣ Routes exclues
La navigation est automatiquement masquée sur :
- `/login`, `/register` - Auth
- `/checkout`, `/commande/success` - Checkout flow
- `/admin/*` - Admin panel
- `/retrait/*` - Pickup validation

**Modifier les exclusions** dans `nav-items.ts` :
```ts
export const EXCLUDED_ROUTES = [
  '/login',
  '/checkout',
  // Ajouter d'autres routes...
];
```

---

## 🔌 Connexion au Store Zustand

### Actuellement
Le `BottomNavWrapper` se connecte automatiquement au store `useCart` :

```tsx
// src/components/navigation/bottom-nav-wrapper.tsx
export function BottomNavWrapper() {
  const cartStore = useCart();
  const cartCount = cartStore.totalItems(); // ✅ Déjà connecté

  return <BottomNav cartCount={cartCount} />;
}
```

### Ajouter un store "Favoris"
Si vous créez un store `useFavorites` :

```tsx
// src/store/favorites.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type FavoritesStore = {
  items: string[]; // product IDs
  totalItems: () => number;
  // ... autres méthodes
};

export const useFavorites = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: () => get().items.length,
      // ... implémentation
    }),
    { name: 'favorites-storage' }
  )
);
```

**Puis modifier `bottom-nav.tsx`** pour afficher un badge sur "Favoris" :

```tsx
// bottom-nav.tsx (ligne ~140)
{!item.isCart && item.href === '/favoris' && favoritesCount > 0 && (
  <motion.div
    key={favoritesCount}
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center border-2 border-background"
  >
    {favoritesCount}
  </motion.div>
)}
```

---

## 🎨 Personnalisation

### Changer la couleur du Cart
Dans `bottom-nav.tsx` (ligne 26) :
```ts
const CART_BUTTON_BG = 'bg-fuchsia-600'; // Change to any color
```

### Modifier le max-width du dock
Dans `bottom-nav.tsx` (ligne 25) :
```ts
const DOCK_MAX_WIDTH = 'max-w-[560px]'; // Augmente ou réduis
```

### Changer les icônes
Dans `nav-items.ts`, remplace les icônes Lucide :
```ts
import { Home, Sparkles, ShoppingBag, Heart, UserCircle } from 'lucide-react';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Accueil', href: '/', icon: Sparkles }, // ✨ Nouvelle icône
  // ...
];
```

### Ajouter un 6ème item
⚠️ **Non recommandé** pour l'ergonomie mobile (dock trop large).

Si nécessaire, modifier `nav-items.ts` :
```ts
export const NAV_ITEMS: NavItem[] = [
  // ... items existants
  {
    label: 'Aide',
    href: '/aide',
    icon: HelpCircle,
    ariaLabel: 'Centre d\'aide',
  },
];
```

---

## 📱 Responsive Behavior

### Mobile (default)
- Bottom Nav **visible**
- Dock centré avec marges latérales (`px-4`)

### Desktop (optionnel)
Pour masquer sur desktop, ajouter dans `bottom-nav.tsx` :
```tsx
<nav className={cn(
  'fixed bottom-4 left-0 right-0 z-50',
  'md:hidden', // ✅ Masquer sur ≥768px
  // ... autres classes
)}>
```

---

## 🧪 Tests

### Test manuel
1. Navigue entre les pages → Indicator actif doit suivre
2. Ajoute des produits au panier → Badge doit s'animer
3. Va sur `/checkout` → Nav doit disparaître
4. Teste sur iOS Safari → Safe area doit fonctionner

### Test avec React Testing Library
```tsx
import { render, screen } from '@testing-library/react';
import { BottomNav } from './bottom-nav';

test('affiche le badge quand cartCount > 0', () => {
  render(<BottomNav cartCount={3} />);
  expect(screen.getByText('3')).toBeInTheDocument();
});

test('masque le badge quand cartCount = 0', () => {
  render(<BottomNav cartCount={0} />);
  expect(screen.queryByText('0')).not.toBeInTheDocument();
});
```

---

## 🐛 Troubleshooting

### La nav chevauche le footer
Ajouter `pb-24` au `<main>` et `mb-20` au `<footer>` dans `layout.tsx`.

### Le badge ne s'anime pas
Vérifier que Framer Motion est bien installé :
```bash
npm install framer-motion@^12.33.0
```

### Icons ne s'affichent pas
Vérifier l'import :
```tsx
import { Home } from 'lucide-react';
```

### Nav visible sur desktop
Ajouter `md:hidden` à la classe du `<nav>`.

---

## 📚 Ressources

- [Lucide Icons](https://lucide.dev/) - Bibliothèque d'icônes
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility classes

---

## 🎉 Next Steps

1. **Implémenter les pages** : `/explorer`, `/favoris`, `/profil`
2. **Ajouter Analytics** : Track clicks sur les items
3. **Haptic Feedback** : Vibration au click (mobile)
4. **Dark Mode** : Tester l'apparence en mode sombre
5. **PWA** : Ajouter un badge "Installer l'app" sur Profile

---

**Créé avec 💜 pour Boutique 1885**
