"use server";

import { db, dbRead } from "@/db";
import { orders, orderItems, payments } from "@/db/schema/orders";
import { products } from "@/db/schema/products";
import { productVariants, productImages } from "@/db/schema/variants";
import { addresses } from "@/db/schema/addresses";
import { user } from "@/db/schema/user";
import { colors } from "@/db/schema/filters/colors";
import { sizes } from "@/db/schema/filters/sizes";
import { brands } from "@/db/schema/brands";
import { categories } from "@/db/schema/categories";
import { genders } from "@/db/schema/filters/genders";
import { eq, desc, count, sql, and, isNull } from "drizzle-orm";
import { getSession } from "@/lib/auth/actions";
import { revalidatePath } from "next/cache";

// ── Auth Guard ────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await getSession();
  if (!session?.user) throw new Error("Not authenticated");

  const [u] = await dbRead
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (u?.role !== "admin") throw new Error("Not authorized");
  return session.user;
}

// ── Dashboard Stats ───────────────────────────────────────────────────────────

export type DashboardStats = {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  pendingCodOrders: number;
  completedOrders: number;
  totalRevenue: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAdmin();

  const [
    [usersResult],
    [productsResult],
    [ordersResult],
    [pendingCodResult],
    [completedResult],
    [revenueResult],
  ] = await Promise.all([
    dbRead.select({ count: count() }).from(user).where(isNull(user.deletedAt)),
    dbRead.select({ count: count() }).from(products).where(isNull(products.deletedAt)),
    dbRead.select({ count: count() }).from(orders),
    dbRead
      .select({ count: count() })
      .from(payments)
      .where(and(eq(payments.method, "cod"), eq(payments.status, "initiated"))),
    dbRead
      .select({ count: count() })
      .from(payments)
      .where(eq(payments.status, "completed")),
    dbRead
      .select({ total: sql<string>`COALESCE(SUM(${orders.totalAmount}::numeric), 0)` })
      .from(orders)
      .innerJoin(payments, eq(payments.orderId, orders.id))
      .where(eq(payments.status, "completed")),
  ]);

  return {
    totalUsers: usersResult.count,
    totalProducts: productsResult.count,
    totalOrders: ordersResult.count,
    pendingCodOrders: pendingCodResult.count,
    completedOrders: completedResult.count,
    totalRevenue: Number(revenueResult.total ?? 0),
  };
}

// ── Admin Orders ──────────────────────────────────────────────────────────────

export type AdminOrder = {
  id: string;
  status: string;
  totalAmount: string;
  createdAt: Date;
  customerName: string | null;
  customerEmail: string;
  paymentMethod: string;
  paymentStatus: string;
  phone: string | null;
  address: string | null;
  itemCount: number;
};

export async function getAdminOrders(): Promise<AdminOrder[]> {
  await requireAdmin();

  const allOrders = await dbRead
    .select({
      id: orders.id,
      status: orders.status,
      totalAmount: orders.totalAmount,
      createdAt: orders.createdAt,
      customerName: user.name,
      customerEmail: user.email,
      shippingAddressId: orders.shippingAddressId,
    })
    .from(orders)
    .innerJoin(user, eq(user.id, orders.userId))
    .orderBy(desc(orders.createdAt));

  const result: AdminOrder[] = [];

  for (const order of allOrders) {
    const [payment] = await dbRead
      .select({ method: payments.method, status: payments.status })
      .from(payments)
      .where(eq(payments.orderId, order.id))
      .limit(1);

    // Get item count
    const [itemCount] = await dbRead
      .select({ count: count() })
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    // Get shipping address info
    let phone: string | null = null;
    let address: string | null = null;
    if (order.shippingAddressId) {
      const [addr] = await dbRead
        .select({
          line1: addresses.line1,
          streetName: addresses.streetName,
          city: addresses.city,
          phone: addresses.phone,
        })
        .from(addresses)
        .where(eq(addresses.id, order.shippingAddressId))
        .limit(1);
      if (addr) {
        phone = addr.phone;
        address = [addr.line1, addr.streetName, addr.city].filter(Boolean).join(", ");
      }
    }

    result.push({
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      paymentMethod: payment?.method ?? "unknown",
      paymentStatus: payment?.status ?? "unknown",
      phone,
      address,
      itemCount: itemCount.count,
    });
  }

  return result;
}

// ── Update Order Status (COD complete) ────────────────────────────────────────

export async function markCodComplete(orderId: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  // Verify the order exists and uses COD
  const [payment] = await dbRead
    .select({ id: payments.id, method: payments.method, status: payments.status })
    .from(payments)
    .where(eq(payments.orderId, orderId))
    .limit(1);

  if (!payment) return { success: false, error: "Order not found." };
  if (payment.method !== "cod") return { success: false, error: "This order doesn't use Cash on Delivery." };
  if (payment.status === "completed") return { success: false, error: "Already marked as complete." };

  // Update payment status
  await db
    .update(payments)
    .set({ status: "completed", paidAt: new Date() })
    .where(eq(payments.id, payment.id));

  // Update order status to delivered
  await db
    .update(orders)
    .set({ status: "delivered" })
    .where(eq(orders.id, orderId));

  revalidatePath("/admin/orders");
  revalidatePath(`/orders/${orderId}`);

  return { success: true };
}

// ── Admin Products ────────────────────────────────────────────────────────────

export type AdminProduct = {
  id: string;
  name: string;
  brandName: string | null;
  categoryName: string | null;
  isPublished: boolean;
  variantCount: number;
  createdAt: Date;
  image: string | null;
};

export async function getAdminProducts(): Promise<AdminProduct[]> {
  await requireAdmin();

  const allProducts = await dbRead
    .select({
      id: products.id,
      name: products.name,
      brandName: brands.name,
      categoryName: categories.name,
      isPublished: products.isPublished,
      createdAt: products.createdAt,
    })
    .from(products)
    .leftJoin(brands, eq(brands.id, products.brandId))
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(isNull(products.deletedAt))
    .orderBy(desc(products.createdAt));

  return Promise.all(
    allProducts.map(async (p) => {
      const [vc] = await dbRead
        .select({ count: count() })
        .from(productVariants)
        .where(eq(productVariants.productId, p.id));

      const [img] = await dbRead
        .select({ url: productImages.url })
        .from(productImages)
        .where(eq(productImages.productId, p.id))
        .limit(1);

      return {
        ...p,
        variantCount: vc.count,
        image: img?.url ?? null,
      };
    }),
  );
}

// ── Toggle Product Published ──────────────────────────────────────────────────

export async function toggleProductPublished(
  productId: string,
): Promise<{ success: boolean }> {
  await requireAdmin();

  const [product] = await dbRead
    .select({ isPublished: products.isPublished })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product) return { success: false };

  await db
    .update(products)
    .set({ isPublished: !product.isPublished, updatedAt: new Date() })
    .where(eq(products.id, productId));

  revalidatePath("/admin/products");
  revalidatePath("/products");

  return { success: true };
}

// ── Check if user is admin (for middleware/layouts) ───────────────────────────

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  if (!session?.user) return false;

  const [u] = await dbRead
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  return u?.role === "admin";
}
