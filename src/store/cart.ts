import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  variantId?: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  handle: string;
  quantity: number;
  sku?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    variantId?: string
  ) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.productId === item.productId && i.variantId === item.variantId
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(i.productId === productId && i.variantId === variantId)
          ),
        }));
      },

      updateQuantity: (productId, quantity, variantId) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: "elektropolis-cart" }
  )
);
