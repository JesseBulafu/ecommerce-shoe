import {
  pgTable,
  pgEnum,
  uuid,
  numeric,
  integer,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { z } from "zod";
import { user } from "./user";
import { addresses } from "./addresses";
import { productVariants } from "./variants";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "stripe",
  "paypal",
  "flutterwave",
  "cod",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "initiated",
  "completed",
  "failed",
]);

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id, { onDelete: "set null" })
    .notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  shippingAddressId: uuid("shipping_address_id").references(
    () => addresses.id,
    { onDelete: "set null" }
  ),
  billingAddressId: uuid("billing_address_id").references(
    () => addresses.id,
    { onDelete: "set null" }
  ),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("idx_orders_user_id").on(t.userId),
  index("idx_orders_status").on(t.status),
  index("idx_orders_user_status").on(t.userId, t.status),
  index("idx_orders_created_at").on(t.createdAt),
]);

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  productVariantId: uuid("product_variant_id")
    .references(() => productVariants.id, { onDelete: "set null" })
    .notNull(),
  quantity: integer("quantity").notNull(),
  priceAtPurchase: numeric("price_at_purchase", {
    precision: 10,
    scale: 2,
  }).notNull(),
}, (t) => [
  index("idx_order_items_order_id").on(t.orderId),
  index("idx_order_items_variant_id").on(t.productVariantId),
]);

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  method: paymentMethodEnum("method").notNull(),
  status: paymentStatusEnum("status").notNull().default("initiated"),
  paidAt: timestamp("paid_at"),
  transactionId: text("transaction_id"),
}, (t) => [
  index("idx_payments_order_id").on(t.orderId),
  index("idx_payments_status").on(t.status),
  index("idx_payments_transaction_id").on(t.transactionId),
]);

export const insertOrderSchema = z.object({
  userId: z.string().uuid(),
  status: z
    .enum(["pending", "paid", "shipped", "delivered", "cancelled"])
    .default("pending"),
  totalAmount: z.string(),
  shippingAddressId: z.string().uuid().nullable().optional(),
  billingAddressId: z.string().uuid().nullable().optional(),
});

export const selectOrderSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]),
  totalAmount: z.string(),
  shippingAddressId: z.string().uuid().nullable(),
  billingAddressId: z.string().uuid().nullable(),
  createdAt: z.date(),
});

export const insertOrderItemSchema = z.object({
  orderId: z.string().uuid(),
  productVariantId: z.string().uuid(),
  quantity: z.number().int().min(1),
  priceAtPurchase: z.string(),
});

export const selectOrderItemSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  productVariantId: z.string().uuid(),
  quantity: z.number().int(),
  priceAtPurchase: z.string(),
});

export const insertPaymentSchema = z.object({
  orderId: z.string().uuid(),
  method: z.enum(["stripe", "paypal", "flutterwave", "cod"]),
  status: z.enum(["initiated", "completed", "failed"]).default("initiated"),
  paidAt: z.date().nullable().optional(),
  transactionId: z.string().nullable().optional(),
});

export const selectPaymentSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  method: z.enum(["stripe", "paypal", "flutterwave", "cod"]),
  status: z.enum(["initiated", "completed", "failed"]),
  paidAt: z.date().nullable(),
  transactionId: z.string().nullable(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
