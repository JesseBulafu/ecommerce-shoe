"use server";

import { db, dbRead } from "@/db";
import { orders, orderItems, payments } from "@/db/schema/orders";
import { productVariants } from "@/db/schema/variants";
import { products } from "@/db/schema/products";
import { productImages } from "@/db/schema/variants";
import { addresses } from "@/db/schema/addresses";
import { user } from "@/db/schema/user";
import { colors } from "@/db/schema/filters/colors";
import { sizes } from "@/db/schema/filters/sizes";
import { eq, desc, count, sql, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/actions";
import { revalidatePath } from "next/cache";

// ── Types ─────────────────────────────────────────────────────────────────────

export type OrderWithDetails = {
  id: string;
  status: string;
  totalAmount: string;
  createdAt: Date;
  payment: {
    method: string;
    status: string;
    transactionId: string | null;
  } | null;
  shippingAddress: {
    line1: string;
    streetName: string | null;
    city: string;
    state: string;
    phone: string;
  } | null;
  items: {
    id: string;
    quantity: number;
    priceAtPurchase: string;
    productName: string;
    colorName: string | null;
    sizeName: string | null;
    image: string | null;
  }[];
};

// ── Get User Orders ───────────────────────────────────────────────────────────

export async function getUserOrders(): Promise<OrderWithDetails[]> {
  const session = await getSession();
  if (!session?.user) return [];

  const userOrders = await dbRead
    .select({
      id: orders.id,
      status: orders.status,
      totalAmount: orders.totalAmount,
      createdAt: orders.createdAt,
      shippingAddressId: orders.shippingAddressId,
    })
    .from(orders)
    .where(eq(orders.userId, session.user.id))
    .orderBy(desc(orders.createdAt));

  if (userOrders.length === 0) return [];

  const result: OrderWithDetails[] = [];

  for (const order of userOrders) {
    // Get payment info
    const [payment] = await dbRead
      .select({
        method: payments.method,
        status: payments.status,
        transactionId: payments.transactionId,
      })
      .from(payments)
      .where(eq(payments.orderId, order.id))
      .limit(1);

    // Get shipping address
    let shippingAddress = null;
    if (order.shippingAddressId) {
      const [addr] = await dbRead
        .select({
          line1: addresses.line1,
          streetName: addresses.streetName,
          city: addresses.city,
          state: addresses.state,
          phone: addresses.phone,
        })
        .from(addresses)
        .where(eq(addresses.id, order.shippingAddressId))
        .limit(1);
      shippingAddress = addr ?? null;
    }

    // Get order items with product details
    const items = await dbRead
      .select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        priceAtPurchase: orderItems.priceAtPurchase,
        productName: products.name,
        colorName: colors.name,
        sizeName: sizes.name,
      })
      .from(orderItems)
      .innerJoin(productVariants, eq(productVariants.id, orderItems.productVariantId))
      .innerJoin(products, eq(products.id, productVariants.productId))
      .leftJoin(colors, eq(colors.id, productVariants.colorId))
      .leftJoin(sizes, eq(sizes.id, productVariants.sizeId))
      .where(eq(orderItems.orderId, order.id));

    // Get first image for each item's product
    const itemsWithImages = await Promise.all(
      items.map(async (item) => {
        const [img] = await dbRead
          .select({ url: productImages.url })
          .from(productImages)
          .innerJoin(productVariants, eq(productVariants.id, orderItems.productVariantId))
          .innerJoin(orderItems, eq(orderItems.id, item.id))
          .where(eq(productImages.productId, productVariants.productId))
          .limit(1);

        return { ...item, image: img?.url ?? null };
      }),
    );

    result.push({
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      payment: payment ?? null,
      shippingAddress,
      items: itemsWithImages,
    });
  }

  return result;
}

// ── Get Single Order ──────────────────────────────────────────────────────────

export async function getOrder(orderId: string): Promise<OrderWithDetails | null> {
  const session = await getSession();
  if (!session?.user) return null;

  const [order] = await dbRead
    .select({
      id: orders.id,
      status: orders.status,
      totalAmount: orders.totalAmount,
      createdAt: orders.createdAt,
      shippingAddressId: orders.shippingAddressId,
      userId: orders.userId,
    })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) return null;

  // Regular users can only see their own orders
  if (order.userId !== session.user.id) {
    // Check if admin
    const [u] = await dbRead
      .select({ role: user.role })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);
    if (u?.role !== "admin") return null;
  }

  // Get payment
  const [payment] = await dbRead
    .select({
      method: payments.method,
      status: payments.status,
      transactionId: payments.transactionId,
    })
    .from(payments)
    .where(eq(payments.orderId, order.id))
    .limit(1);

  // Get shipping address
  let shippingAddress = null;
  if (order.shippingAddressId) {
    const [addr] = await dbRead
      .select({
        line1: addresses.line1,
        streetName: addresses.streetName,
        city: addresses.city,
        state: addresses.state,
        phone: addresses.phone,
      })
      .from(addresses)
      .where(eq(addresses.id, order.shippingAddressId))
      .limit(1);
    shippingAddress = addr ?? null;
  }

  // Get order items
  const rawItems = await dbRead
    .select({
      id: orderItems.id,
      quantity: orderItems.quantity,
      priceAtPurchase: orderItems.priceAtPurchase,
      productName: products.name,
      productId: products.id,
      colorName: colors.name,
      sizeName: sizes.name,
    })
    .from(orderItems)
    .innerJoin(productVariants, eq(productVariants.id, orderItems.productVariantId))
    .innerJoin(products, eq(products.id, productVariants.productId))
    .leftJoin(colors, eq(colors.id, productVariants.colorId))
    .leftJoin(sizes, eq(sizes.id, productVariants.sizeId))
    .where(eq(orderItems.orderId, order.id));

  const itemsWithImages = await Promise.all(
    rawItems.map(async (item) => {
      const [img] = await dbRead
        .select({ url: productImages.url })
        .from(productImages)
        .where(eq(productImages.productId, item.productId))
        .limit(1);
      return {
        id: item.id,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
        productName: item.productName,
        colorName: item.colorName,
        sizeName: item.sizeName,
        image: img?.url ?? null,
      };
    }),
  );

  return {
    id: order.id,
    status: order.status,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt,
    payment: payment ?? null,
    shippingAddress,
    items: itemsWithImages,
  };
}
