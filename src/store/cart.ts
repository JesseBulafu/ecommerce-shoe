import { create } from "zustand";

/** Enriched cart line item — contains all display info so the UI never needs
 *  extra DB lookups. Populated by the server actions in lib/actions/cart.ts. */
export type CartLineItem = {
  cartItemId: string;
  variantId:  string;
  productId:  string;
  name:       string;
  description: string;
  price:      number;
  salePrice:  number | null;
  image:      string | null;
  sizeName:   string;
  colorName:  string;
  quantity:   number;
};

interface CartStore {
  items: CartLineItem[];
  /** Replace the entire cart (used by CartProvider on initial hydration and after every mutation). */
  setItems: (items: CartLineItem[]) => void;
  /** Optimistic quantity update — also removes the item when quantity < 1. */
  updateItemQuantity: (cartItemId: string, quantity: number) => void;
  removeItem: (cartItemId: string) => void;
  clearItems: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  setItems: (items) => set({ items }),

  updateItemQuantity: (cartItemId, quantity) =>
    set((state) => ({
      items:
        quantity < 1
          ? state.items.filter((i) => i.cartItemId !== cartItemId)
          : state.items.map((i) =>
              i.cartItemId === cartItemId ? { ...i, quantity } : i,
            ),
    })),

  removeItem: (cartItemId) =>
    set((state) => ({
      items: state.items.filter((i) => i.cartItemId !== cartItemId),
    })),

  clearItems: () => set({ items: [] }),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  totalPrice: () =>
    get().items.reduce(
      (sum, i) => sum + (i.salePrice ?? i.price) * i.quantity,
      0,
    ),
}));
