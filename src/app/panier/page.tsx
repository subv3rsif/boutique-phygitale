'use client';

import Link from 'next/link';
import { useCart } from '@/store/cart';
import { CartItem } from '@/components/cart/cart-item';
import { CheckoutButton } from '@/components/cart/checkout-button';
import { FulfillmentSelector } from '@/components/cart/fulfillment-selector';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { calculateCartTotals, formatCurrency } from '@/lib/catalogue';
import { ShoppingBag, ArrowLeft, Package, Info } from 'lucide-react';

export default function CartPage() {
  const { items, fulfillmentMode, gdprConsent, setGdprConsent, totalItems } = useCart();

  // Calculate totals
  const calculation = calculateCartTotals(
    items.map((item) => ({ id: item.id, qty: item.qty })),
    fulfillmentMode
  );

  const { itemsTotal, shippingTotal, grandTotal } =
    'error' in calculation
      ? { itemsTotal: 0, shippingTotal: 0, grandTotal: 0 }
      : calculation;

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100">
            <ShoppingBag className="h-10 w-10 text-slate-400" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Votre panier est vide
          </h1>
          <p className="text-slate-600 mb-8">
            Découvrez nos produits et ajoutez vos articles préférés
          </p>
          <Link href="/">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Package className="mr-2 h-5 w-5" />
              Découvrir les produits
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
            Panier
          </h1>
          <p className="text-slate-600">
            {totalItems()} {totalItems() === 1 ? 'article' : 'articles'}
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left column: Cart items (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart items card */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">
                  Articles ({items.length})
                </h2>
              </div>
              <div className="divide-y divide-slate-200">
                {items.map((item) => (
                  <div key={item.id} className="p-6">
                    <CartItem id={item.id} qty={item.qty} />
                  </div>
                ))}
              </div>
            </div>

            {/* Continue shopping link */}
            <Link href="/">
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continuer mes achats
              </Button>
            </Link>
          </div>

          {/* Right column: Order summary (1/3 width, sticky) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6 space-y-6">
              {/* Summary card */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Récapitulatif
                  </h2>
                </div>

                <div className="p-6 space-y-6">
                  {/* Fulfillment selector */}
                  <FulfillmentSelector />

                  {/* Divider */}
                  <div className="border-t border-slate-200" />

                  {/* Price breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Sous-total</span>
                      <span className="font-medium text-slate-900">
                        {formatCurrency(itemsTotal)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Livraison</span>
                      <span className={`font-medium ${shippingTotal === 0 ? 'text-green-600' : 'text-slate-900'}`}>
                        {shippingTotal === 0 ? 'Gratuit' : formatCurrency(shippingTotal)}
                      </span>
                    </div>

                    {/* Info about delivery costs */}
                    {fulfillmentMode === 'delivery' && (
                      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-md">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-900">
                          Les frais de livraison sont calculés en fonction du poids et de la quantité
                        </p>
                      </div>
                    )}

                    {/* Total */}
                    <div className="border-t border-slate-200 pt-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-base font-semibold text-slate-900">
                          Total TTC
                        </span>
                        <span className="text-2xl font-bold text-slate-900">
                          {formatCurrency(grandTotal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-200" />

                  {/* GDPR Consent */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="gdpr"
                        checked={gdprConsent}
                        onCheckedChange={(checked) => setGdprConsent(checked as boolean)}
                        className="mt-0.5"
                      />
                      <Label
                        htmlFor="gdpr"
                        className="text-sm text-slate-700 cursor-pointer leading-relaxed"
                      >
                        J'accepte la{' '}
                        <Link
                          href="/politique-confidentialite"
                          target="_blank"
                          className="text-blue-600 underline hover:text-blue-700"
                        >
                          politique de confidentialité
                        </Link>{' '}
                        et les{' '}
                        <Link
                          href="/cgv"
                          target="_blank"
                          className="text-blue-600 underline hover:text-blue-700"
                        >
                          conditions générales de vente
                        </Link>
                      </Label>
                    </div>

                    {/* Checkout button */}
                    <CheckoutButton />
                  </div>
                </div>
              </div>

              {/* Security badge */}
              <div className="bg-slate-100 rounded-lg p-4 text-center">
                <p className="text-xs text-slate-600">
                  Paiement sécurisé par Stripe
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
