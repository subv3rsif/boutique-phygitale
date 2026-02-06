'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCart } from '@/store/cart';
import { CreditCard, Loader2 } from 'lucide-react';

type CheckoutButtonProps = {
  disabled?: boolean;
};

export function CheckoutButton({ disabled }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { items, fulfillmentMode, gdprConsent, customerPhone } = useCart();

  const handleCheckout = async () => {
    if (!gdprConsent) {
      toast.error('Veuillez accepter la politique de confidentialité');
      return;
    }

    if (items.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }

    setIsLoading(true);

    try {
      // Call checkout API
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map((item) => ({ id: item.id, qty: item.qty })),
          fulfillmentMode,
          pickupLocationId: fulfillmentMode === 'pickup' ? 'la-fabrik' : undefined,
          gdprConsent,
          customerPhone: customerPhone || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de paiement manquante');
      }

    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erreur lors du paiement'
      );
      setIsLoading(false);
    }
  };

  const isDisabled = disabled || isLoading || items.length === 0 || !gdprConsent;

  return (
    <Button
      onClick={handleCheckout}
      disabled={isDisabled}
      size="lg"
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm hover:shadow-md transition-all duration-200"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          <span>Redirection...</span>
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-5 w-5" />
          <span>Procéder au paiement</span>
        </>
      )}
    </Button>
  );
}
