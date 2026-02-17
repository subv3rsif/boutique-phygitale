'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/store/cart';
import { CartItem } from '@/components/cart/cart-item';
import { CheckoutButton } from '@/components/cart/checkout-button';
import { FulfillmentSelector } from '@/components/cart/fulfillment-selector';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { calculateCartTotals, formatCurrency } from '@/lib/catalogue';
import { ShoppingBag, ArrowLeft, Package, Info, Shield, Lock } from 'lucide-react';

export default function CartPage() {
  const { items, fulfillmentMode, gdprConsent, setGdprConsent, totalItems } = useCart();

  const calculation = calculateCartTotals(
    items.map((item) => ({ id: item.id, qty: item.qty })),
    fulfillmentMode
  );

  const { itemsTotal, shippingTotal, grandTotal } =
    'error' in calculation
      ? { itemsTotal: 0, shippingTotal: 0, grandTotal: 0 }
      : calculation;

  // ── Empty cart state ────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-md"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full glass-love love-glow-sm"
          >
            <ShoppingBag className="h-10 w-10 text-primary" strokeWidth={1.5} />
          </motion.div>

          <h1 className="font-display text-3xl md:text-4xl font-light italic text-foreground mb-3">
            Votre panier est{' '}
            <span className="font-semibold not-italic text-gradient-love">vide</span>
          </h1>
          <p className="text-muted-foreground font-sans font-light text-lg mb-10 leading-relaxed">
            Découvrez nos créations et ajoutez vos articles préférés
          </p>

          <Link href="/#collection">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 h-14 px-8 bg-gradient-love text-primary-foreground rounded-2xl shadow-vibrant font-sans font-semibold text-sm tracking-wide hover-glow transition-vibrant"
            >
              <Package className="h-5 w-5" />
              Découvrir la collection
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // ── Filled cart ─────────────────────────────────────────────────────────────
  return (
    <div className="bg-background min-h-screen">
      {/* Subtle background texture */}
      <div className="fixed inset-0 grid-lines opacity-[0.15] pointer-events-none" />
      <div className="fixed top-0 left-0 right-0 h-[40vh] radial-gradient-overlay pointer-events-none" />

      <div className="relative container max-w-7xl mx-auto py-10 lg:py-16 px-4">

        {/* ── Page header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-block h-[1px] w-6 bg-primary/50" />
            <span className="text-xs tracking-[0.35em] uppercase text-muted-foreground font-sans font-medium">
              Votre sélection
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-light italic text-foreground">
            Mon{' '}
            <span className="font-semibold not-italic text-gradient-love">Panier</span>
          </h1>
          <p className="text-muted-foreground font-sans font-light mt-2">
            {totalItems()} {totalItems() === 1 ? 'article' : 'articles'}
          </p>
        </motion.div>

        {/* ── Two-column layout ── */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">

          {/* ── Left: Cart items (2/3) ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Items card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="glass-vibrant rounded-3xl border border-border/60 overflow-hidden shadow-vibrant"
            >
              {/* Card header */}
              <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Articles
                </h2>
                <span className="text-sm text-muted-foreground font-sans">
                  {items.length} {items.length === 1 ? 'produit' : 'produits'}
                </span>
              </div>

              {/* Items list */}
              <AnimatePresence initial={false}>
                <div className="divide-y divide-border/40">
                  {items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="px-6 py-5"
                    >
                      <CartItem id={item.id} qty={item.qty} />
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            </motion.div>

            {/* Continue shopping */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Link href="/#collection">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground hover:bg-muted/60 gap-2 rounded-xl transition-all duration-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Continuer mes achats
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* ── Right: Order summary (1/3, sticky) ── */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">

              {/* Summary card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="glass-vibrant rounded-3xl border border-border/60 overflow-hidden shadow-vibrant"
              >
                {/* Card header */}
                <div className="px-6 py-5 border-b border-border/50">
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    Récapitulatif
                  </h2>
                </div>

                <div className="p-6 space-y-6">
                  {/* Fulfillment selector */}
                  <FulfillmentSelector />

                  <div className="h-px bg-border/50" />

                  {/* Price breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-sans">Sous-total</span>
                      <span className="font-medium text-foreground font-sans">
                        {formatCurrency(itemsTotal)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-sans">Livraison</span>
                      <span className={`font-semibold font-sans ${shippingTotal === 0 ? 'text-emerald-500' : 'text-foreground'}`}>
                        {shippingTotal === 0 ? 'Gratuit' : formatCurrency(shippingTotal)}
                      </span>
                    </div>

                    {/* Info livraison */}
                    {fulfillmentMode === 'delivery' && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-2.5 p-3.5 glass-love rounded-xl border border-primary/15"
                      >
                        <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Les frais de livraison sont calculés par article selon le tarif La Poste
                        </p>
                      </motion.div>
                    )}

                    {/* Total */}
                    <div className="border-t border-border/50 pt-4">
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm font-semibold text-foreground font-sans">
                          Total TTC
                        </span>
                        <motion.span
                          key={grandTotal}
                          initial={{ scale: 1.1, opacity: 0.7 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.25 }}
                          className="font-display text-3xl font-bold text-gradient-love"
                        >
                          {formatCurrency(grandTotal)}
                        </motion.span>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-border/50" />

                  {/* GDPR Consent */}
                  <div className="space-y-5">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="gdpr"
                        checked={gdprConsent}
                        onCheckedChange={(checked) => setGdprConsent(checked as boolean)}
                        className="mt-0.5 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <Label
                        htmlFor="gdpr"
                        className="text-xs text-muted-foreground cursor-pointer leading-relaxed font-sans"
                      >
                        J'accepte la{' '}
                        <Link
                          href="/politique-confidentialite"
                          target="_blank"
                          className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                        >
                          politique de confidentialité
                        </Link>{' '}
                        et les{' '}
                        <Link
                          href="/cgv"
                          target="_blank"
                          className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                        >
                          CGV
                        </Link>
                      </Label>
                    </div>

                    {/* Checkout button */}
                    <CheckoutButton />
                  </div>
                </div>
              </motion.div>

              {/* Security badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="glass-love rounded-2xl border border-primary/10 p-4 flex items-center justify-center gap-3"
              >
                <Lock className="h-4 w-4 text-primary/70 shrink-0" />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground font-sans">
                    Paiement 100% sécurisé
                  </p>
                  <p className="text-xs font-semibold text-primary/80 font-sans">
                    Propulsé par Stripe
                  </p>
                </div>
                <Shield className="h-4 w-4 text-primary/70 shrink-0" />
              </motion.div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
