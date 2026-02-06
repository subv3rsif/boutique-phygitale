import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Shopping cart store using Zustand
 * Persisted to localStorage for better UX
 */

export type CartItem = {
  id: string;
  qty: number;
};

export type FulfillmentMode = 'delivery' | 'pickup';

type CartStore = {
  items: CartItem[];
  fulfillmentMode: FulfillmentMode;
  gdprConsent: boolean;
  customerPhone: string;

  // Actions
  addItem: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  setFulfillmentMode: (mode: FulfillmentMode) => void;
  setGdprConsent: (consent: boolean) => void;
  setCustomerPhone: (phone: string) => void;
  clear: () => void;

  // Computed
  totalItems: () => number;
  getItem: (id: string) => CartItem | undefined;
};

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      fulfillmentMode: 'delivery',
      gdprConsent: false,
      customerPhone: '',

      addItem: (id: string, qty: number) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.id === id);

          if (existingItem) {
            // Update existing item quantity (max 10)
            return {
              items: state.items.map((i) =>
                i.id === id ? { ...i, qty: Math.min(i.qty + qty, 10) } : i
              ),
            };
          }

          // Add new item (max 10)
          return {
            items: [...state.items, { id, qty: Math.min(qty, 10) }],
          };
        }),

      removeItem: (id: string) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQty: (id: string, qty: number) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, qty: Math.max(1, Math.min(qty, 10)) } : i
          ),
        })),

      setFulfillmentMode: (mode: FulfillmentMode) =>
        set({ fulfillmentMode: mode }),

      setGdprConsent: (consent: boolean) =>
        set({ gdprConsent: consent }),

      setCustomerPhone: (phone: string) =>
        set({ customerPhone: phone }),

      clear: () =>
        set({
          items: [],
          fulfillmentMode: 'delivery',
          gdprConsent: false,
          customerPhone: '',
        }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),

      getItem: (id: string) => get().items.find((i) => i.id === id),
    }),
    {
      name: 'cart-storage', // localStorage key
      partialize: (state) => ({
        // Only persist these fields
        items: state.items,
        fulfillmentMode: state.fulfillmentMode,
        customerPhone: state.customerPhone,
        // Don't persist gdprConsent (must be re-accepted each session)
      }),
    }
  )
);
