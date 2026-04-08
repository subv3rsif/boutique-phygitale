'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCart } from '@/store/cart';
import { Trash2, Minus, Plus, Loader2 } from 'lucide-react';

type CartItemProps = {
  id: string;
  qty: number;
};

// Format currency helper
function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}

// Product type from DB
type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  images: Array<{ url: string; isPrimary?: boolean }>;
};

export function CartItem({ id, qty }: CartItemProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { updateQty, removeItem } = useCart();

  // Fetch product from DB API
  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError(false);
        const response = await fetch(`/api/products/by-id/${id}`);

        if (!response.ok) {
          throw new Error('Product not found');
        }

        const data = await response.json();
        setProduct(data.product);
      } catch (err) {
        console.error('Failed to load product:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="flex gap-4 sm:gap-5 items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Chargement...</span>
      </div>
    );
  }

  // Error state or product not found
  if (error || !product) {
    return (
      <div className="flex gap-4 sm:gap-5 items-center justify-between py-4">
        <span className="text-sm text-muted-foreground">Produit introuvable</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeItem(id)}
          className="text-destructive hover:text-destructive hover:bg-destructive/8"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  const itemTotal = product.priceCents * qty;

  const handleDecrement = () => {
    if (qty > 1) updateQty(id, qty - 1);
  };

  const handleIncrement = () => {
    if (qty < 10) updateQty(id, qty + 1);
  };

  return (
    <div className="flex gap-4 sm:gap-5">
      {/* ── Image ── */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-muted">
        {/* Skeleton shimmer */}
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted to-muted/50" />
        <Image
          src={product.images?.[0]?.url || 'https://placehold.co/96x96/503B64/F3EFEA?text=No+Image'}
          alt={product.name}
          fill
          className="object-cover relative z-10"
          sizes="96px"
          onLoad={(e) => {
            const img = e.currentTarget;
            const skeleton = img.previousElementSibling as HTMLElement;
            if (skeleton) skeleton.style.display = 'none';
          }}
        />
      </div>

      {/* ── Details ── */}
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Name */}
          <h3 className="font-display text-base sm:text-lg font-normal text-foreground line-clamp-1 mb-0.5">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground font-sans font-light">
            {formatCurrency(product.priceCents)} l'unité
          </p>

          {/* ── Qty + Remove ── */}
          <div className="flex items-center gap-3 mt-3">
            {/* Stepper */}
            <div className="inline-flex items-center rounded-xl border border-border/70 glass-vibrant overflow-hidden">
              <button
                onClick={handleDecrement}
                disabled={qty <= 1}
                aria-label="Diminuer la quantité"
                className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>

              <motion.span
                key={qty}
                initial={{ scale: 1.2, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="w-10 text-center text-sm font-semibold text-foreground font-sans border-x border-border/50"
                style={{ lineHeight: '2.25rem' }}
              >
                {qty}
              </motion.span>

              <button
                onClick={handleIncrement}
                disabled={qty >= 10}
                aria-label="Augmenter la quantité"
                className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Remove */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeItem(id)}
              aria-label="Retirer du panier"
              className="h-9 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/8 gap-1.5 rounded-xl transition-all duration-200"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="text-xs font-medium font-sans">Retirer</span>
            </Button>
          </div>
        </div>

        {/* ── Total ── */}
        <div className="text-left sm:text-right shrink-0">
          <motion.p
            key={itemTotal}
            initial={{ opacity: 0.6, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="font-display text-xl font-semibold text-foreground"
          >
            {formatCurrency(itemTotal)}
          </motion.p>
          {qty > 1 && (
            <p className="text-xs text-muted-foreground font-sans mt-0.5">
              {qty} × {formatCurrency(product.priceCents)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
