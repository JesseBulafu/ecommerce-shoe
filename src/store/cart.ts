import { create } from "zustand";
import type { ProductVariant } from "@/db/schema";

interface CartItem {
  variant: ProductVariant;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (variant: ProductVariant) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (variant) =>
    set((state) => {
      const existing = state.items.find((i) => i.variant.id === variant.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.variant.id === variant.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { items: [...state.items, { variant, quantity: 1 }] };
    }),

  removeItem: (variantId) =>
    set((state) => ({
      items: state.items.filter((i) => i.variant.id !== variantId),
    })),

  clearCart: () => set({ items: [] }),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  totalPrice: () =>
    get().items.reduce(
      (sum, i) => sum + Number(i.variant.price) * i.quantity,
      0
    ),
}));
