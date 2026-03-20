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
import { eq, desc, count, sql, and, isNull, ne, asc } from "drizzle-orm";
import { getSession } from "@/lib/auth/actions";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

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

// ── Admin Users Management ────────────────────────────────────────────────────

export type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  adminKey: string | null;
  createdAt: Date;
};

export async function getAdminUsers(): Promise<AdminUser[]> {
  await requireAdmin();

  return dbRead
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      adminKey: user.adminKey,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(isNull(user.deletedAt))
    .orderBy(asc(user.createdAt));
}

export async function promoteToAdmin(
  targetUserId: string,
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();

  // Prevent promoting yourself (already admin)
  if (targetUserId === admin.id) {
    return { success: false, error: "You are already an admin." };
  }

  const [target] = await dbRead
    .select({ id: user.id, role: user.role })
    .from(user)
    .where(eq(user.id, targetUserId))
    .limit(1);

  if (!target) return { success: false, error: "User not found." };
  if (target.role === "admin") return { success: false, error: "User is already an admin." };

  // Generate admin key and promote
  await db
    .update(user)
    .set({
      role: "admin",
      adminKey: crypto.randomUUID(),
      updatedAt: new Date(),
    })
    .where(eq(user.id, targetUserId));

  revalidatePath("/admin/users");
  return { success: true };
}

export async function revokeAdmin(
  targetUserId: string,
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();

  // Cannot revoke yourself
  if (targetUserId === admin.id) {
    return { success: false, error: "You cannot revoke your own admin access." };
  }

  const [target] = await dbRead
    .select({ id: user.id, role: user.role, createdAt: user.createdAt })
    .from(user)
    .where(eq(user.id, targetUserId))
    .limit(1);

  if (!target) return { success: false, error: "User not found." };
  if (target.role !== "admin") return { success: false, error: "User is not an admin." };

  // Protect the first user — they can never be demoted
  const [firstUser] = await dbRead
    .select({ id: user.id })
    .from(user)
    .where(isNull(user.deletedAt))
    .orderBy(asc(user.createdAt))
    .limit(1);

  if (firstUser && firstUser.id === targetUserId) {
    return { success: false, error: "The original admin cannot be revoked." };
  }

  await db
    .update(user)
    .set({
      role: "customer",
      adminKey: null,
      updatedAt: new Date(),
    })
    .where(eq(user.id, targetUserId));

  revalidatePath("/admin/users");
  return { success: true };
}

// ── Product Form Options ──────────────────────────────────────────────────────

export type ProductFormOptions = {
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  genders: { id: string; label: string }[];
  colors: { id: string; name: string; hexCode: string }[];
  sizes: { id: string; name: string; sortOrder: number }[];
};

export async function getProductFormOptions(): Promise<ProductFormOptions> {
  await requireAdmin();

  const [allBrands, allCategories, allGenders, allColors, allSizes] = await Promise.all([
    dbRead.select({ id: brands.id, name: brands.name }).from(brands),
    dbRead.select({ id: categories.id, name: categories.name }).from(categories),
    dbRead.select({ id: genders.id, label: genders.label }).from(genders),
    dbRead.select({ id: colors.id, name: colors.name, hexCode: colors.hexCode }).from(colors),
    dbRead.select({ id: sizes.id, name: sizes.name, sortOrder: sizes.sortOrder }).from(sizes).orderBy(asc(sizes.sortOrder)),
  ]);

  return {
    brands: allBrands,
    categories: allCategories,
    genders: allGenders,
    colors: allColors,
    sizes: allSizes,
  };
}

// ── Create Product ────────────────────────────────────────────────────────────

export async function createProduct(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const categoryId = formData.get("categoryId") as string;
  const brandId = formData.get("brandId") as string;
  const genderId = formData.get("genderId") as string;
  const price = (formData.get("price") as string)?.trim();
  const salePrice = (formData.get("salePrice") as string)?.trim() || null;
  const colorId = formData.get("colorId") as string;
  const stock = formData.get("stock") as string;
  const publish = formData.get("publish") === "true";
  const sizeIds = formData.getAll("sizeIds") as string[];
  const imageFile = formData.get("image") as File | null;

  // Validation
  if (!name || name.length < 2) return { success: false, error: "Product name is required (min 2 characters)." };
  if (!description || description.length < 10) return { success: false, error: "Description is required (min 10 characters)." };
  if (!categoryId || !brandId || !genderId || !colorId) return { success: false, error: "Please select brand, category, gender, and color." };
  if (!price || isNaN(Number(price)) || Number(price) <= 0) return { success: false, error: "Enter a valid price." };
  if (salePrice && (isNaN(Number(salePrice)) || Number(salePrice) <= 0)) return { success: false, error: "Sale price must be a positive number." };
  if (sizeIds.length === 0) return { success: false, error: "Select at least one size." };

  // Handle image upload
  let imageUrl: string | null = null;
  if (imageFile && imageFile.size > 0) {
    const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!ALLOWED.includes(imageFile.type)) return { success: false, error: "Only JPEG, PNG, WebP, or AVIF images allowed." };
    if (imageFile.size > 5 * 1024 * 1024) return { success: false, error: "Image must be under 5 MB." };

    const { writeFile, mkdir } = await import("fs/promises");
    const path = await import("path");
    const dir = path.join(process.cwd(), "public", "uploads", "products");
    await mkdir(dir, { recursive: true });
    const ext = imageFile.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") ?? "jpg";
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    await writeFile(path.join(dir, fileName), buffer);
    imageUrl = `/uploads/products/${fileName}`;
  }

  // Generate a base SKU from product name
  const skuBase = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 8) + "-" + Date.now().toString(36).toUpperCase();

  // Insert product
  const [newProduct] = await db
    .insert(products)
    .values({
      name,
      description,
      categoryId,
      brandId,
      genderId,
      isPublished: publish,
    })
    .returning({ id: products.id });

  // Insert one variant per size
  let firstVariantId: string | null = null;
  for (let i = 0; i < sizeIds.length; i++) {
    const sku = `${skuBase}-${i + 1}`;
    const [variant] = await db
      .insert(productVariants)
      .values({
        productId: newProduct.id,
        sku,
        price,
        salePrice,
        colorId,
        sizeId: sizeIds[i],
        inStock: stock ? parseInt(stock, 10) : 0,
      })
      .returning({ id: productVariants.id });

    if (i === 0) firstVariantId = variant.id;
  }

  // Set default variant
  if (firstVariantId) {
    await db.update(products).set({ defaultVariantId: firstVariantId }).where(eq(products.id, newProduct.id));
  }

  // Insert product image
  if (imageUrl) {
    await db.insert(productImages).values({
      productId: newProduct.id,
      url: imageUrl,
      sortOrder: 0,
      isPrimary: true,
    });
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");

  return { success: true };
}
