# 💡 Bottom Nav - Exemples Pratiques

## 🎯 Cas d'Usage Courants

### 1️⃣ Ajouter un Produit au Panier

```tsx
// Dans un composant produit
'use client';

import { useCart } from '@/store/cart';
import { Button } from '@/components/ui/button';

export function ProductCard({ product }) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product.id, 1);
    // ✅ Le badge de la bottom nav s'anime automatiquement !
  };

  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <Button onClick={handleAddToCart}>
        Ajouter au panier
      </Button>
    </div>
  );
}
```

**Résultat** :
1. Click sur "Ajouter au panier"
2. `useCart.addItem()` met à jour le store
3. `totalItems()` recalcule automatiquement
4. `BottomNavWrapper` détecte le changement
5. Badge s'anime avec effet "pop" 🎉

---

### 2️⃣ Vider le Panier

```tsx
'use client';

import { useCart } from '@/store/cart';
import { Button } from '@/components/ui/button';

export function CartPage() {
  const { items, clear } = useCart();

  const handleClearCart = () => {
    clear();
    // ✅ Le badge disparaît avec animation
  };

  return (
    <div>
      <h1>Mon Panier ({items.length})</h1>
      <Button variant="destructive" onClick={handleClearCart}>
        Vider le panier
      </Button>
    </div>
  );
}
```

**Résultat** :
- Badge s'anime avec `exit: { scale: 0 }` et disparaît

---

### 3️⃣ Afficher un Badge sur "Favoris"

#### Étape 1 : Créer le store

```tsx
// src/store/favorites.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type FavoritesStore = {
  items: string[]; // Product IDs

  addItem: (id: string) => void;
  removeItem: (id: string) => void;
  isInFavorites: (id: string) => boolean;
  totalItems: () => number;
  clear: () => void;
};

export const useFavorites = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (id) =>
        set((state) => {
          if (state.items.includes(id)) return state;
          return { items: [...state.items, id] };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((itemId) => itemId !== id),
        })),

      isInFavorites: (id) => get().items.includes(id),

      totalItems: () => get().items.length,

      clear: () => set({ items: [] }),
    }),
    {
      name: 'favorites-storage',
    }
  )
);
```

#### Étape 2 : Modifier `bottom-nav-wrapper.tsx`

```tsx
'use client';

import { useCart } from '@/store/cart';
import { useFavorites } from '@/store/favorites'; // ✅
import { BottomNav } from './bottom-nav';

export function BottomNavWrapper() {
  const cartStore = useCart();
  const favoritesStore = useFavorites(); // ✅

  const cartCount = cartStore.totalItems();
  const favoritesCount = favoritesStore.totalItems(); // ✅

  return (
    <BottomNav
      cartCount={cartCount}
      favoritesCount={favoritesCount} // ✅
    />
  );
}
```

#### Étape 3 : Modifier `bottom-nav.tsx`

```tsx
// Ligne 30 : Ajouter la prop
export type BottomNavProps = {
  cartCount?: number;
  favoritesCount?: number; // ✅
  onCartClick?: () => void;
  className?: string;
};

export function BottomNav({
  cartCount = 0,
  favoritesCount = 0, // ✅
  onCartClick,
  className,
}: BottomNavProps) {
  // ...

  // Ligne ~150 : Dans le map des items
  return (
    <Link key={item.href} href={item.href} className="relative">
      {/* ... icon ... */}

      {/* Badge Favoris */}
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
    </Link>
  );
}
```

#### Étape 4 : Utiliser dans un composant

```tsx
'use client';

import { useFavorites } from '@/store/favorites';
import { Heart } from 'lucide-react';

export function FavoriteButton({ productId }: { productId: string }) {
  const { addItem, removeItem, isInFavorites } = useFavorites();
  const isFavorite = isInFavorites(productId);

  const handleToggle = () => {
    if (isFavorite) {
      removeItem(productId);
    } else {
      addItem(productId);
      // ✅ Badge "Favoris" de la bottom nav s'anime !
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(
        'p-2 rounded-full',
        isFavorite ? 'text-red-500 fill-red-500' : 'text-muted-foreground'
      )}
    >
      <Heart className="w-5 h-5" />
    </button>
  );
}
```

---

### 4️⃣ Navigation Programmatique

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '@/store/cart';

export function QuickCheckoutButton() {
  const router = useRouter();
  const { totalItems } = useCart();

  const handleQuickCheckout = () => {
    if (totalItems() === 0) {
      alert('Votre panier est vide');
      return;
    }

    // Navigue vers le panier
    router.push('/panier');
    // ✅ La bottom nav met à jour l'active indicator automatiquement
  };

  return (
    <button onClick={handleQuickCheckout}>
      Passer commande ({totalItems()})
    </button>
  );
}
```

---

### 5️⃣ Analytics Tracking

```tsx
// bottom-nav-wrapper.tsx
'use client';

import { useCart } from '@/store/cart';
import { BottomNav } from './bottom-nav';

export function BottomNavWrapper() {
  const cartStore = useCart();
  const cartCount = cartStore.totalItems();

  const handleCartClick = () => {
    // ✅ Track analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'cart_clicked', {
        event_category: 'engagement',
        event_label: 'bottom_nav',
        value: cartCount,
      });
    }

    console.log('Cart clicked, count:', cartCount);
  };

  return (
    <BottomNav
      cartCount={cartCount}
      onCartClick={handleCartClick}
    />
  );
}
```

---

### 6️⃣ Haptic Feedback (Mobile)

```tsx
// bottom-nav.tsx (ligne ~110)
<Link
  href={item.href}
  onClick={(e) => {
    // Haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(10); // 10ms vibration
    }

    // Custom behavior pour Cart
    if (item.isCart && onCartClick) {
      e.preventDefault();
      onCartClick();
    }
  }}
>
  {/* ... */}
</Link>
```

---

### 7️⃣ Badge de Notification (Profil)

```tsx
// Créer un store notifications
// src/store/notifications.ts
import { create } from 'zustand';

type NotificationsStore = {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  markAsRead: () => void;
};

export const useNotifications = create<NotificationsStore>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  markAsRead: () => set({ unreadCount: 0 }),
}));

// bottom-nav-wrapper.tsx
import { useNotifications } from '@/store/notifications';

export function BottomNavWrapper() {
  const cartCount = useCart().totalItems();
  const notifCount = useNotifications((s) => s.unreadCount);

  return (
    <BottomNav
      cartCount={cartCount}
      notificationsCount={notifCount} // ✅
    />
  );
}

// bottom-nav.tsx (ajuster comme pour favoris)
{!item.isCart && item.href === '/profil' && notificationsCount > 0 && (
  <motion.div className="absolute -top-1 -right-1 ...">
    {notificationsCount}
  </motion.div>
)}
```

---

### 8️⃣ Masquer/Afficher Dynamiquement

```tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { BottomNav } from './bottom-nav';

export function BottomNavWrapper() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);

  // Masquer sur scroll down, afficher sur scroll up
  useEffect(() => {
    let lastScroll = 0;

    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll > lastScroll && currentScroll > 100) {
        // Scroll down
        setIsVisible(false);
      } else {
        // Scroll up
        setIsVisible(true);
      }

      lastScroll = currentScroll;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return <BottomNav cartCount={...} />;
}
```

---

### 9️⃣ A/B Testing des Couleurs

```tsx
// bottom-nav.tsx
const CART_COLORS = {
  fuchsia: 'bg-fuchsia-600',
  purple: 'bg-purple-600',
  pink: 'bg-pink-600',
  blue: 'bg-blue-600',
} as const;

type CartColor = keyof typeof CART_COLORS;

export type BottomNavProps = {
  cartCount?: number;
  cartColor?: CartColor; // ✅
};

export function BottomNav({
  cartCount = 0,
  cartColor = 'fuchsia', // ✅ Default
}: BottomNavProps) {
  const CART_BUTTON_BG = CART_COLORS[cartColor];

  // ... reste du code
}

// Utilisation
<BottomNav cartCount={3} cartColor="purple" />
```

---

### 🔟 PWA Install Prompt (sur Profile)

```tsx
'use client';

import { useState, useEffect } from 'react';

export function BottomNavWrapper() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBadge, setShowInstallBadge] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBadge(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowInstallBadge(false);
    }

    setDeferredPrompt(null);
  };

  return (
    <BottomNav
      cartCount={...}
      showInstallBadge={showInstallBadge}
      onInstallClick={handleInstall}
    />
  );
}
```

---

## 🎨 Personnalisation Avancée

### Custom Item avec Animation

```tsx
// nav-items.ts
export const NAV_ITEMS: NavItem[] = [
  // ... items existants
  {
    label: 'Scan QR',
    href: '/scan',
    icon: QrCode,
    isSpecial: true, // ✅ Flag custom
    ariaLabel: 'Scanner un QR code',
  },
];

// bottom-nav.tsx
{item.isSpecial && (
  <motion.div
    animate={{ rotate: [0, 5, -5, 0] }}
    transition={{ repeat: Infinity, duration: 2 }}
  >
    <Icon className="..." />
  </motion.div>
)}
```

### Gradient Border au Hover

```tsx
// bottom-nav.tsx
<Link
  className={cn(
    // ... classes existantes
    'relative overflow-hidden',
    'before:absolute before:inset-0',
    'before:bg-gradient-love before:opacity-0',
    'before:transition-opacity before:duration-300',
    'hover:before:opacity-20'
  )}
>
  {/* ... */}
</Link>
```

### Indicator avec Icône

```tsx
{isActive && (
  <motion.div
    layoutId="activeIndicator"
    className="absolute -bottom-1 left-1/2 -translate-x-1/2"
  >
    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
  </motion.div>
)}
```

---

## 🧪 Tests Unitaires

```tsx
// __tests__/bottom-nav.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BottomNav } from '../bottom-nav';

describe('BottomNav', () => {
  it('affiche tous les items de navigation', () => {
    render(<BottomNav />);

    expect(screen.getByLabelText('Retour à l\'accueil')).toBeInTheDocument();
    expect(screen.getByLabelText('Explorer les produits')).toBeInTheDocument();
    expect(screen.getByLabelText('Voir le panier')).toBeInTheDocument();
  });

  it('affiche le badge quand cartCount > 0', () => {
    render(<BottomNav cartCount={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('masque le badge quand cartCount = 0', () => {
    render(<BottomNav cartCount={0} />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('affiche "99+" quand cartCount > 99', () => {
    render(<BottomNav cartCount={150} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('appelle onCartClick quand on clique sur le panier', async () => {
    const handleCartClick = jest.fn();
    render(<BottomNav onCartClick={handleCartClick} />);

    const cartButton = screen.getByLabelText('Voir le panier');
    await userEvent.click(cartButton);

    expect(handleCartClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## 🚀 Déploiement

### Vercel Environment Variables

```bash
# .env.production
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX  # Pour analytics
```

### Vercel Config

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

---

## 📚 Ressources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Zustand Docs](https://docs.pmnd.rs/zustand)
- [Lucide Icons](https://lucide.dev/)
- [Next.js App Router](https://nextjs.org/docs/app)

---

**Créé avec 💜 pour Boutique 1885**
