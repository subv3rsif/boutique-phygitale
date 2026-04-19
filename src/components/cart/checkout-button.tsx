'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useCart } from '@/store/cart';
import { CreditCard, Loader2, ArrowRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

type CheckoutButtonProps = {
  disabled?: boolean;
};

export function CheckoutButton({ disabled }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { items, fulfillmentMode, gdprConsent, customerEmail, customerPhone } = useCart();

  const handleCheckout = async () => {
    if (!gdprConsent) {
      toast.error('Veuillez accepter la politique de confidentialité');
      return;
    }
    if (items.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }
    if (!customerEmail || !customerEmail.includes('@')) {
      toast.error('Veuillez saisir une adresse email valide');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({ id: item.id, qty: item.qty, size: item.size })),
          fulfillmentMode,
          pickupLocationId: fulfillmentMode === 'pickup' ? 'la-fabrik' : undefined,
          gdprConsent,
          customerEmail,
          customerPhone: customerPhone || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle PayFiP-specific errors with friendly messages
        const errorMessage = data.error || 'Une erreur est survenue lors du paiement';
        throw new Error(errorMessage);
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de paiement manquante');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du paiement';
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  const isDisabled = disabled || isLoading || items.length === 0 || !gdprConsent || !customerEmail;

  return (
    <motion.button
      onClick={handleCheckout}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.97 } : {}}
      className={cn(
        'relative w-full h-14 rounded-2xl overflow-hidden',
        'font-sans font-semibold text-sm tracking-wide',
        'transition-all duration-300',
        !isDisabled
          ? 'bg-gradient-love text-primary-foreground shadow-vibrant hover:shadow-vibrant-lg hover-glow cursor-pointer'
          : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
      )}
    >
      {/* Shimmer on active */}
      {!isDisabled && (
        <div className="absolute inset-0 shimmer-auto pointer-events-none opacity-40" />
      )}

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center gap-2"
          >
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Redirection vers le paiement sécurisé…</span>
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center gap-3"
          >
            <Lock className="h-4 w-4 opacity-70" />
            <span>Procéder au paiement</span>
            <ArrowRight className="h-4 w-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
