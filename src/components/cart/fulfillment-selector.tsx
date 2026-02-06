'use client';

import { useCart, type FulfillmentMode } from '@/store/cart';
import { Truck, MapPin } from 'lucide-react';

export function FulfillmentSelector() {
  const { fulfillmentMode, setFulfillmentMode } = useCart();

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
      label: 'Livraison à domicile',
      description: 'Délai : 5-7 jours ouvrés',
      icon: Truck,
      priceLabel: 'Frais calculés',
      details: 'Par La Poste',
    },
    {
      value: 'pickup',
      label: 'Retrait sur place',
      description: 'Prêt sous 24h',
      icon: MapPin,
      priceLabel: 'Gratuit',
      details: 'À La Fabrik',
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-900">Mode de livraison</h3>

      {/* Side-by-side cards on desktop, stack on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = fulfillmentMode === mode.value;

          return (
            <button
              key={mode.value}
              type="button"
              onClick={() => setFulfillmentMode(mode.value)}
              aria-label={`${mode.label} - ${mode.priceLabel}`}
              aria-pressed={isSelected}
              className={`
                relative flex flex-col gap-3 p-4 rounded-lg border-2 text-left
                transition-all duration-200 ease-in-out
                hover:border-blue-400 hover:shadow-sm
                focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2
                ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600'
                    : 'border-slate-200 bg-white'
                }
              `}
            >
              {/* Icon and Label */}
              <div className="flex items-start gap-3">
                <div
                  className={`
                    mt-0.5 transition-colors duration-200
                    ${isSelected ? 'text-blue-600' : 'text-slate-600'}
                  `}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                    {mode.label}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {mode.details}
                  </div>
                </div>
              </div>

              {/* Details and Price */}
              <div className="flex items-end justify-between gap-2 pt-1 border-t border-slate-100">
                <div className="text-xs text-slate-600">
                  {mode.description}
                </div>
                <div className={`text-sm font-semibold whitespace-nowrap ${
                  mode.value === 'pickup' ? 'text-green-600' : 'text-slate-700'
                }`}>
                  {mode.priceLabel}
                </div>
              </div>

              {/* Selected indicator - subtle checkmark */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Pickup location details - show when pickup selected */}
      {fulfillmentMode === 'pickup' && (
        <div className="mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
            <div className="text-sm">
              <div className="font-semibold text-slate-900 mb-1">
                {process.env.NEXT_PUBLIC_PICKUP_LOCATION_NAME || 'La Fabrik'}
              </div>
              <div className="text-slate-600">
                {process.env.NEXT_PUBLIC_PICKUP_LOCATION_ADDRESS ||
                  '123 Rue de la République, 75001 Paris'}
              </div>
              <div className="text-slate-600 mt-1">
                <span className="font-medium">Horaires :</span>{' '}
                {process.env.NEXT_PUBLIC_PICKUP_LOCATION_HOURS ||
                  'Lundi-Vendredi 9h-18h'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
