"use client";

import { useEffect } from "react";
import { useCartStore, type CartLineItem } from "@/store/cart";

/**
 * Server-rendered layout passes the initial cart items here so the Zustand
 * store is populated immediately after client hydration — no extra client
 * fetch required and no flicker in the Navbar cart count.
 */
export default function CartProvider({ items }: { items: CartLineItem[] }) {
  const setItems = useCartStore((s) => s.setItems);

  useEffect(() => {
    setItems(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
