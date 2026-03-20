import {
  pgTable,
  pgEnum,
  uuid,
  text,
  numeric,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { z } from "zod";

export const discountTypeEnum = pgEnum("discount_type", [
  "percentage",
  "fixed",
]);

export const coupons = pgTable("coupons", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  discountType: discountTypeEnum("discount_type").notNull(),
  discountValue: numeric("discount_value", {
    precision: 10,
    scale: 2,
  }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  maxUsage: integer("max_usage").notNull(),
  usedCount: integer("used_count").notNull().default(0),
});

export const insertCouponSchema = z.object({
  code: z.string().min(1),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.string(),
  expiresAt: z.date(),
  maxUsage: z.number().int().min(1),
  usedCount: z.number().int().default(0),
});

export const selectCouponSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.string(),
  expiresAt: z.date(),
  maxUsage: z.number().int(),
  usedCount: z.number().int(),
});

export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;
