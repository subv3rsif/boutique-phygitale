import {
  Home,
  Compass,
  ShoppingBag,
  Bookmark,
  User,
  type LucideIcon
} from 'lucide-react';

/**
 * Navigation item configuration
 * Inspired by Iconly – Shop Market design
 */
export type NavItem = {
  /** Display label */
  label: string;
  /** Navigation href */
  href: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Is this the cart button? */
  isCart?: boolean;
  /** Aria label for accessibility */
  ariaLabel: string;
};

/**
 * Bottom navigation items
 * Order: Home | Explore | Cart (central) | Saved | Profile
 */
export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Accueil',
    href: '/',
    icon: Home,
    ariaLabel: 'Retour à l\'accueil',
  },
  {
    label: 'Explorer',
    href: '/explorer',
    icon: Compass,
    ariaLabel: 'Explorer les produits',
  },
  {
    label: 'Panier',
    href: '/panier',
    icon: ShoppingBag,
    isCart: true,
    ariaLabel: 'Voir le panier',
  },
  {
    label: 'Favoris',
    href: '/favoris',
    icon: Bookmark,
    ariaLabel: 'Voir mes favoris',
  },
  {
    label: 'Profil',
    href: '/profil',
    icon: User,
    ariaLabel: 'Accéder à mon profil',
  },
];

/**
 * Routes where the bottom nav should be hidden
 * Exclude checkout flow, admin, auth pages
 */
export const EXCLUDED_ROUTES = [
  '/login',
  '/register',
  '/checkout',
  '/commande/success',
  '/admin',
  '/retrait',
];

/**
 * Helper to check if bottom nav should be shown
 */
export function shouldShowBottomNav(pathname: string): boolean {
  return !EXCLUDED_ROUTES.some(route => pathname.startsWith(route));
}
