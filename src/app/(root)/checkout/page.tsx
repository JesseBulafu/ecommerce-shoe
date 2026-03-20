import type { Metadata } from "next";
import { getCart } from "@/lib/actions/cart";
import { getSession } from "@/lib/auth/actions";
import { redirect } from "next/navigation";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout — Ecommerce Shoe Store",
};

export default async function CheckoutPage() {
  const [cartItems, session] = await Promise.all([getCart(), getSession()]);

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/checkout");
  }

  if (cartItems.length === 0) {
    redirect("/cart");
  }

  return (
    <CheckoutClient
      items={cartItems}
      user={{ name: session.user.name, email: session.user.email }}
    />
  );
}
