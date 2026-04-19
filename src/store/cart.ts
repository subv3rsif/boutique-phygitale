import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Shopping cart store using Zustand
 * Persisted to localStorage for better UX
 */

export type CartItem = {
  id: string; // Product ID
  qty: number;
  size?: string; // Selected size (S, M, L, XL, XXL) - undefined if product has no sizes
};

export type FulfillmentMode = 'delivery' | 'pickup';

type CartStore = {
  items: CartItem[];
  fulfillmentMode: FulfillmentMode;
  gdprConsent: boolean;
  customerEmail: string;
  customerPhone: string;

  // Actions
  addItem: (id: string, qty: number, size?: string) => void;
  removeItem: (id: string, size?: string) => void;
  updateQty: (id: string, qty: number, size?: string) => void;
  setFulfillmentMode: (mode: FulfillmentMode) => void;
  setGdprConsent: (consent: boolean) => void;
  setCustomerEmail: (email: string) => void;
  setCustomerPhone: (phone: string) => void;
  clear: () => void;

  // Computed
  totalItems: () => number;
  getItem: (id: string, size?: string) => CartItem | undefined;
};

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      fulfillmentMode: 'delivery',
      gdprConsent: false,
      customerEmail: '',
      customerPhone: '',

      addItem: (id: string, qty: number, size?: string) =>
        set((state) => {
          // Find existing item with same id AND size (or both without size)
          const existingItem = state.items.find(
            (i) => i.id === id && i.size === size
          );

          if (existingItem) {
            // Update existing item quantity (max 10)
            return {
              items: state.items.map((i) =>
                i.id === id && i.size === size
                  ? { ...i, qty: Math.min(i.qty + qty, 10) }
                  : i
              ),
            };
          }

          // Add new item (max 10)
          return {
            items: [...state.items, { id, qty: Math.min(qty, 10), size }],
          };
        }),

      removeItem: (id: string, size?: string) =>
        set((state) => ({
          items: state.items.filter((i) => !(i.id === id && i.size === size)),
        })),

      updateQty: (id: string, qty: number, size?: string) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id && i.size === size
              ? { ...i, qty: Math.max(1, Math.min(qty, 10)) }
              : i
          ),
        })),

      setFulfillmentMode: (mode: FulfillmentMode) =>
        set({ fulfillmentMode: mode }),

      setGdprConsent: (consent: boolean) =>
        set({ gdprConsent: consent }),

      setCustomerEmail: (email: string) =>
        set({ customerEmail: email }),

      setCustomerPhone: (phone: string) =>
        set({ customerPhone: phone }),

      clear: () =>
        set({
          items: [],
          fulfillmentMode: 'delivery',
          gdprConsent: false,
          customerEmail: '',
          customerPhone: '',
        }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),

      getItem: (id: string, size?: string) =>
        get().items.find((i) => i.id === id && i.size === size),
    }),
    {
      name: 'cart-storage', // localStorage key
      partialize: (state) => ({
        // Only persist these fields
        items: state.items,
        fulfillmentMode: state.fulfillmentMode,
        customerEmail: state.customerEmail,
        customerPhone: state.customerPhone,
        // Don't persist gdprConsent (must be re-accepted each session)
      }),
    }
  )
);
