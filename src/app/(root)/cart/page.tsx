import type { Metadata } from "next";
import { getCart } from "@/lib/actions/cart";
import { getSession } from "@/lib/auth/actions";
import CartPageClient from "@/components/CartPageClient";

export const metadata: Metadata = {
  title: "Your Cart — Ecommerce Shoe Store",
};

export default async function CartPage() {
  const [cartItems, session] = await Promise.all([getCart(), getSession()]);
  const isAuthenticated = !!session?.user;

  return (
    <CartPageClient
      initialItems={cartItems}
      isAuthenticated={isAuthenticated}
    />
  );
}
