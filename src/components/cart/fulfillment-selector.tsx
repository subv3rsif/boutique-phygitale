'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCart, type FulfillmentMode } from '@/store/cart';
import { Truck, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const modes: Array<{
  value: FulfillmentMode;
  label: string;
  description: string;
  icon: typeof Truck;
  priceLabel: string;
  details: string;
}> = [
  {
    value: 'delivery',
    label: 'Livraison',
    description: '5-7 jours ouvrés',
    icon: Truck,
    priceLabel: 'Frais calculés',
    details: 'La Poste',
  },
  {
    value: 'pickup',
    label: 'Retrait',
    description: 'Prêt sous 24h',
    icon: MapPin,
    priceLabel: 'Gratuit',
    details: 'La Fabrik',
  },
];

export function FulfillmentSelector() {
  const { fulfillmentMode, setFulfillmentMode } = useCart();

  return (
    <div className="space-y-3">
      <h3 className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-sans font-medium">
        Mode de livraison
      </h3>

      {/* Toggle cards */}
      <div className="grid grid-cols-2 gap-3">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = fulfillmentMode === mode.value;

          return (
            <motion.button
              key={mode.value}
              type="button"
              onClick={() => setFulfillmentMode(mode.value)}
              aria-label={`${mode.label} — ${mode.priceLabel}`}
              aria-pressed={isSelected}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'relative flex flex-col gap-2.5 p-4 rounded-2xl border-2 text-left',
                'transition-all duration-300 ease-out',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
                isSelected
                  ? 'border-primary/60 glass-love shadow-vibrant'
                  : 'border-border/60 glass-vibrant hover:border-primary/30'
              )}
            >
              {/* Selected indicator */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-3 right-3"
                  >
                    <CheckCircle2 className="h-4 w-4 text-primary" strokeWidth={2} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Icon */}
              <div
                className={cn(
                  'inline-flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300',
                  isSelected
                    ? 'bg-gradient-love text-primary-foreground shadow-vibrant'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
              </div>

              {/* Label */}
              <div>
                <p className={cn(
                  'font-sans font-semibold text-sm transition-colors',
                  isSelected ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {mode.label}
                </p>
                <p className="text-xs text-muted-foreground font-sans font-light mt-0.5">
                  {mode.details}
                </p>
              </div>

              {/* Price + timing */}
              <div className="flex items-center justify-between pt-1 border-t border-border/40">
                <span className="text-xs text-muted-foreground font-sans flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {mode.description}
                </span>
                <span className={cn(
                  'text-xs font-bold font-sans',
                  mode.value === 'pickup' ? 'text-emerald-500' : 'text-muted-foreground'
                )}>
                  {mode.priceLabel}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Pickup details panel */}
      <AnimatePresence>
        {fulfillmentMode === 'pickup' && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="p-4 glass-love rounded-2xl border border-primary/15">
              <div className="flex items-start gap-3">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-love text-primary-foreground shrink-0 mt-0.5">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <div className="text-sm space-y-1">
                  <p className="font-sans font-semibold text-foreground">
                    {process.env.NEXT_PUBLIC_PICKUP_LOCATION_NAME || 'La Fabrik'}
                  </p>
                  <p className="text-muted-foreground font-sans font-light text-xs leading-relaxed">
                    {process.env.NEXT_PUBLIC_PICKUP_LOCATION_ADDRESS ||
                      '123 Rue de la République, 75001 Paris'}
                  </p>
                  <p className="text-muted-foreground font-sans font-light text-xs">
                    <span className="font-medium text-foreground">Horaires : </span>
                    {process.env.NEXT_PUBLIC_PICKUP_LOCATION_HOURS || 'Lun-Ven 9h–18h'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
