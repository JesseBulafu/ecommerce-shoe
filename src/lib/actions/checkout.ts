"use server";

import { db, dbRead } from "@/db";
import { orders, orderItems, payments } from "@/db/schema/orders";
import { carts, cartItems } from "@/db/schema/carts";
import { productVariants } from "@/db/schema/variants";
import { products } from "@/db/schema/products";
import { addresses } from "@/db/schema/addresses";
import { sizes } from "@/db/schema/filters/sizes";
import { colors } from "@/db/schema/filters/colors";
import { eq, and, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/actions";
import { initializePayment } from "@/lib/flutterwave";
import { z } from "zod";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CheckoutResult = {
  success: boolean;
  error?: string;
  paymentUrl?: string;
  orderId?: string;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const DELIVERY_FEE = 7200;
const CURRENCY = "UGX";

// ── Validation ────────────────────────────────────────────────────────────────

const shippingAddressSchema = z.object({
  line1: z.string().min(1, "Address is required"),
  streetName: z.string().min(1, "Street name is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "District is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;

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

// ── Initiate Checkout (Flutterwave) ───────────────────────────────────────────

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

// ── Initiate Cash on Delivery ─────────────────────────────────────────────────

export async function initiateCodCheckout(
  addressData: ShippingAddressInput,
): Promise<CheckoutResult> {
  const session = await getSession();
  if (!session?.user) {
    return { success: false, error: "You must be signed in to checkout." };
  }

  // Validate address
  const parsed = shippingAddressSchema.safeParse(addressData);
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { success: false, error: firstError ?? "Invalid address." };
  }

  const { user } = session;
  const items = await getUserCart(user.id);

  if (items.length === 0) {
    return { success: false, error: "Your cart is empty." };
  }

  const subtotal = items.reduce((sum, item) => {
    const price = item.salePrice ? Number(item.salePrice) : Number(item.price);
    return sum + price * item.quantity;
  }, 0);
  const totalAmount = subtotal + DELIVERY_FEE;

  // Save shipping address
  const [address] = await db
    .insert(addresses)
    .values({
      userId: user.id,
      type: "shipping",
      line1: parsed.data.line1,
      streetName: parsed.data.streetName,
      city: parsed.data.city,
      state: parsed.data.state,
      country: "Uganda",
      phone: parsed.data.phone,
      isDefault: true,
    })
    .returning({ id: addresses.id });

  // Create order with shipping address
  const [order] = await db
    .insert(orders)
    .values({
      userId: user.id,
      status: "pending",
      totalAmount: totalAmount.toFixed(2),
      shippingAddressId: address.id,
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

  // Create COD payment record (initiated = pending cash collection)
  await db.insert(payments).values({
    orderId: order.id,
    method: "cod",
    status: "initiated",
    transactionId: `COD-${order.id}`,
  });

  // Clear cart
  await clearCartAfterPayment();

  return { success: true, orderId: order.id };
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
