"use server";

import { db, dbRead } from "@/db";
import { carts, cartItems } from "@/db/schema/carts";
import { productVariants } from "@/db/schema/variants";
import { products } from "@/db/schema/products";
import { sizes } from "@/db/schema/filters/sizes";
import { colors } from "@/db/schema/filters/colors";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  getSession,
  guestSession,
  createGuestSession,
} from "@/lib/auth/actions";
import type { CartLineItem } from "@/store/cart";

// ──────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ──────────────────────────────────────────────────────────────────────────────

async function getOrCreateCart(): Promise<{ id: string }> {
  const session = await getSession();
  const userId = session?.user?.id ?? null;

  if (userId) {
    const [existing] = await dbRead
      .select({ id: carts.id })
      .from(carts)
      .where(eq(carts.userId, userId))
      .limit(1);

    if (existing) return existing;

    const [created] = await db
      .insert(carts)
      .values({ userId })
      .returning({ id: carts.id });

    return created;
  }

  // Guest path
  let guestRecord = await guestSession();
  if (!guestRecord) {
    guestRecord = await createGuestSession();
  }

  const [existing] = await dbRead
    .select({ id: carts.id })
    .from(carts)
    .where(eq(carts.guestId, guestRecord.id))
    .limit(1);

  if (existing) return existing;

  const [created] = await db
    .insert(carts)
    .values({ guestId: guestRecord.id })
    .returning({ id: carts.id });

  return created;
}

async function fetchCartItems(cartId: string): Promise<CartLineItem[]> {
  const rows = await dbRead
    .select({
      cartItemId:  cartItems.id,
      variantId:   productVariants.id,
      productId:   products.id,
      name:        products.name,
      description: products.description,
      price:       productVariants.price,
      salePrice:   productVariants.salePrice,
      sizeName:    sizes.name,
      colorName:   colors.name,
      quantity:    cartItems.quantity,
      image: sql<string | null>`(
        SELECT url FROM product_images
        WHERE product_id = ${products.id}
          AND is_primary = true
        LIMIT 1
      )`,
    })
    .from(cartItems)
    .innerJoin(
      productVariants,
      eq(productVariants.id, cartItems.productVariantId),
    )
    .innerJoin(products, eq(products.id, productVariants.productId))
    .innerJoin(sizes, eq(sizes.id, productVariants.sizeId))
    .innerJoin(colors, eq(colors.id, productVariants.colorId))
    .where(eq(cartItems.cartId, cartId));

  return rows.map((r) => ({
    cartItemId:  r.cartItemId,
    variantId:   r.variantId,
    productId:   r.productId,
    name:        r.name,
    description: r.description,
    price:       Number(r.price),
    salePrice:   r.salePrice ? Number(r.salePrice) : null,
    sizeName:    r.sizeName,
    colorName:   r.colorName,
    quantity:    r.quantity,
    image:       r.image,
  }));
}

// ──────────────────────────────────────────────────────────────────────────────
// Public server actions
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Returns all enriched cart items for the current session (user or guest).
 * Safe to call from Server Components — no guest session is created if one
 * does not already exist (returns [] gracefully for anonymous visitors).
 */
export async function getCart(): Promise<CartLineItem[]> {
  try {
    const session = await getSession();
    const userId = session?.user?.id ?? null;

    let cartId: string | null = null;

    if (userId) {
      const [row] = await dbRead
        .select({ id: carts.id })
        .from(carts)
        .where(eq(carts.userId, userId))
        .limit(1);
      cartId = row?.id ?? null;
    } else {
      const guestRecord = await guestSession();
      if (guestRecord) {
        const [row] = await dbRead
          .select({ id: carts.id })
          .from(carts)
          .where(eq(carts.guestId, guestRecord.id))
          .limit(1);
        cartId = row?.id ?? null;
      }
    }

    if (!cartId) return [];
    return fetchCartItems(cartId);
  } catch {
    return [];
  }
}

/**
 * Adds a product variant to the cart (incrementing quantity if it already exists).
 * Creates a guest session + cart when called by unauthenticated visitors.
 * Returns the full updated cart so the client can sync its local state.
 */
export async function addCartItem(
  variantId: string,
  quantity: number = 1,
): Promise<CartLineItem[]> {
  const cart = await getOrCreateCart();

  const [existing] = await dbRead
    .select({ id: cartItems.id, quantity: cartItems.quantity })
    .from(cartItems)
    .where(
      and(
        eq(cartItems.cartId, cart.id),
        eq(cartItems.productVariantId, variantId),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(cartItems)
      .set({ quantity: existing.quantity + quantity })
      .where(eq(cartItems.id, existing.id));
  } else {
    await db.insert(cartItems).values({
      cartId:           cart.id,
      productVariantId: variantId,
      quantity,
    });
  }

  revalidatePath("/cart");
  return fetchCartItems(cart.id);
}

/**
 * Updates the quantity of an existing cart item.
 * Removes the item when quantity < 1.
 * Returns the full updated cart.
 */
export async function updateCartItem(
  cartItemId: string,
  quantity: number,
): Promise<CartLineItem[]> {
  const cart = await getOrCreateCart();

  if (quantity < 1) {
    await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
  } else {
    await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, cartItemId));
  }

  revalidatePath("/cart");
  return fetchCartItems(cart.id);
}

/**
 * Removes a single item from the cart by its cart_item ID.
 * Returns the full updated cart.
 */
export async function removeCartItem(
  cartItemId: string,
): Promise<CartLineItem[]> {
  const cart = await getOrCreateCart();
  await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
  revalidatePath("/cart");
  return fetchCartItems(cart.id);
}

/**
 * Empties the cart entirely.
 */
export async function clearCart(): Promise<void> {
  const cart = await getOrCreateCart();
  await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
  revalidatePath("/cart");
}
