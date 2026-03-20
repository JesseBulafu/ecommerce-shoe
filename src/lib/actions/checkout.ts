"use server";

import { db, dbRead } from "@/db";
import { orders, orderItems, payments } from "@/db/schema/orders";
import { carts, cartItems } from "@/db/schema/carts";
import { productVariants } from "@/db/schema/variants";
import { products } from "@/db/schema/products";
import { sizes } from "@/db/schema/filters/sizes";
import { colors } from "@/db/schema/filters/colors";
import { eq, and, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/actions";
import { initializePayment } from "@/lib/flutterwave";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CheckoutResult = {
  success: boolean;
  error?: string;
  paymentUrl?: string;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const DELIVERY_FEE = 2;
const CURRENCY = "USD";

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getUserCart(userId: string) {
  const [cart] = await dbRead
    .select({ id: carts.id })
    .from(carts)
    .where(eq(carts.userId, userId))
    .limit(1);

  if (!cart) return [];

  return dbRead
    .select({
      cartItemId: cartItems.id,
      variantId: productVariants.id,
      productId: products.id,
      name: products.name,
      price: productVariants.price,
      salePrice: productVariants.salePrice,
      quantity: cartItems.quantity,
    })
    .from(cartItems)
    .innerJoin(productVariants, eq(productVariants.id, cartItems.productVariantId))
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(eq(cartItems.cartId, cart.id));
}

// ── Initiate Checkout ─────────────────────────────────────────────────────────

/**
 * Creates an order from the user's cart, initiates a Flutterwave payment,
 * and returns the hosted payment URL for redirect.
 */
export async function initiateCheckout(): Promise<CheckoutResult> {
  const session = await getSession();
  if (!session?.user) {
    return { success: false, error: "You must be signed in to checkout." };
  }

  const { user } = session;
  const items = await getUserCart(user.id);

  if (items.length === 0) {
    return { success: false, error: "Your cart is empty." };
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    const price = item.salePrice ? Number(item.salePrice) : Number(item.price);
    return sum + price * item.quantity;
  }, 0);
  const totalAmount = subtotal + DELIVERY_FEE;

  // Create order
  const [order] = await db
    .insert(orders)
    .values({
      userId: user.id,
      status: "pending",
      totalAmount: totalAmount.toFixed(2),
    })
    .returning({ id: orders.id });

  // Create order items
  await db.insert(orderItems).values(
    items.map((item) => ({
      orderId: order.id,
      productVariantId: item.variantId,
      quantity: item.quantity,
      priceAtPurchase: item.salePrice ?? item.price,
    })),
  );

  // Create payment record
  const txRef = `FLW-${order.id}`;

  await db.insert(payments).values({
    orderId: order.id,
    method: "flutterwave",
    status: "initiated",
    transactionId: txRef,
  });

  // Initialize Flutterwave payment
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  try {
    const flwResponse = await initializePayment({
      tx_ref: txRef,
      amount: totalAmount,
      currency: CURRENCY,
      redirect_url: `${baseUrl}/checkout/callback`,
      customer: {
        email: user.email,
        name: user.name,
      },
      meta: {
        order_id: order.id,
      },
      customizations: {
        title: "Ecommerce Shoe Store",
        description: "Payment for your shoe order",
      },
    });

    if (flwResponse.status !== "success") {
      // Mark payment as failed
      await db
        .update(payments)
        .set({ status: "failed" })
        .where(eq(payments.transactionId, txRef));

      return { success: false, error: "Payment initialization failed. Please try again." };
    }

    return { success: true, paymentUrl: flwResponse.data.link };
  } catch (error) {
    // Mark payment as failed
    await db
      .update(payments)
      .set({ status: "failed" })
      .where(eq(payments.transactionId, txRef));

    return { success: false, error: "Payment service is unavailable. Please try again later." };
  }
}

// ── Clear cart after successful payment ───────────────────────────────────────

export async function clearCartAfterPayment(): Promise<void> {
  const session = await getSession();
  if (!session?.user) return;

  const [cart] = await dbRead
    .select({ id: carts.id })
    .from(carts)
    .where(eq(carts.userId, session.user.id))
    .limit(1);

  if (cart) {
    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
    revalidatePath("/cart");
  }
}
