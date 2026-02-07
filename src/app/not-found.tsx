'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, Home, ShoppingBag, Package, Sparkles, TrendingUp } from 'lucide-react';
import { useCart } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const categories = [
  { label: 'Nouveautés', href: '/nouveautes', icon: Sparkles },
  { label: 'Best-sellers', href: '/best-sellers', icon: TrendingUp },
  { label: 'Collections', href: '/collections', icon: Package },
  { label: 'Tous les produits', href: '/', icon: Home },
];

const mockBestSellers = [
  {
    id: '1',
    name: 'Mug Édition 1885',
    price: '12,00',
    image: '/images/products/mug.jpg',
    badge: 'Populaire',
  },
  {
    id: '2',
    name: 'Tote Bag Premium',
    price: '15,00',
    image: '/images/products/tote.jpg',
    badge: null,
  },
  {
    id: '3',
    name: 'Carnet de notes',
    price: '8,00',
    image: '/images/products/notebook.jpg',
    badge: null,
  },
  {
    id: '4',
    name: 'Pin\'s Collection',
    price: '5,00',
    image: '/images/products/pin.jpg',
    badge: 'Nouveau',
  },
];

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState('');
  const totalItems = useCart((state) => state.totalItems());

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="container py-8 px-4 max-w-4xl mx-auto">
      {/* Above the fold - Mobile optimized */}
      <div className="text-center space-y-6 mb-12">
        {/* Hero Message */}
        <div className="space-y-3">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Oups.
          </h1>
          <p className="text-lg text-muted-foreground">
            Cette page s'est éclipsée.
          </p>
        </div>

        {/* Primary CTA */}
        <Link href="/">
          <Button
            size="lg"
            className={cn(
              'bg-primary text-primary-foreground hover:bg-primary/90',
              'dark:magenta-glow transition-smooth',
              'font-medium px-8'
            )}
          >
            <Home className="h-5 w-5 mr-2" />
            Retour à la boutique
          </Button>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'pl-10 h-12 bg-card border-border',
                'focus-visible:ring-primary',
                'dark:bg-surface'
              )}
            />
          </div>
        </form>

        {/* Category Chips */}
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link key={cat.href} href={cat.href}>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'gap-2 transition-smooth',
                    'hover:bg-primary hover:text-primary-foreground hover:border-primary',
                    'focus-magenta'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {cat.label}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Cart Resume CTA */}
        {totalItems > 0 && (
          <Link href="/panier">
            <Button
              variant="secondary"
              size="lg"
              className={cn(
                'gap-2 mt-4',
                'bg-secondary text-secondary-foreground',
                'hover:bg-secondary/90'
              )}
            >
              <ShoppingBag className="h-5 w-5" />
              Reprendre mon panier
              <Badge className="ml-2 bg-primary text-primary-foreground">
                {totalItems}
              </Badge>
            </Button>
          </Link>
        )}
      </div>

      {/* Below the fold - Product Suggestions */}
      <div className="space-y-12">
        {/* Best Sellers */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Produits populaires
            </h2>
            <Link
              href="/"
              className="text-sm text-primary hover:underline focus-magenta rounded px-2 py-1"
            >
              Voir tout
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mockBestSellers.map((product) => (
              <Link
                key={product.id}
                href={`/produit/${product.id}`}
                className={cn(
                  'group block bg-card border border-border rounded-lg overflow-hidden',
                  'hover:border-primary transition-smooth focus-magenta',
                  'card-shadow hover:card-shadow-lg'
                )}
              >
                <div className="aspect-square bg-muted relative">
                  {product.badge && (
                    <Badge
                      className={cn(
                        'absolute top-2 right-2 z-10',
                        'bg-primary text-primary-foreground text-xs'
                      )}
                    >
                      {product.badge}
                    </Badge>
                  )}
                  {/* Placeholder for product image */}
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Package className="h-12 w-12" />
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm font-bold text-foreground">
                    {product.price} €
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Reassurance */}
        <section className="border-t border-border pt-8">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-2">
                <Package className="h-6 w-6" />
              </div>
              <h3 className="font-medium text-foreground">Livraison soignée</h3>
              <p className="text-sm text-muted-foreground">
                Envoi sous 2-3 jours ouvrés
              </p>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-2">
                <Home className="h-6 w-6" />
              </div>
              <h3 className="font-medium text-foreground">Retrait sur place</h3>
              <p className="text-sm text-muted-foreground">
                Gratuit à La Fabrik
              </p>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-2">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="font-medium text-foreground">Besoin d'aide ?</h3>
              <p className="text-sm text-muted-foreground">
                <a href="mailto:contact@ville.fr" className="hover:text-primary transition-colors">
                  contact@ville.fr
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
