import {
  pgTable,
  uuid,
  text,
  numeric,
  integer,
  real,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { z } from "zod";
import { products } from "./products";
import { colors } from "./filters/colors";
import { sizes } from "./filters/sizes";

export const productVariants = pgTable("product_variants", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  sku: text("sku").notNull().unique(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  salePrice: numeric("sale_price", { precision: 10, scale: 2 }),
  colorId: uuid("color_id")
    .references(() => colors.id, { onDelete: "set null" })
    .notNull(),
  sizeId: uuid("size_id")
    .references(() => sizes.id, { onDelete: "set null" })
    .notNull(),
  inStock: integer("in_stock").notNull().default(0),
  weight: real("weight"),
  dimensions: jsonb("dimensions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productImages = pgTable("product_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  variantId: uuid("variant_id").references(() => productVariants.id, {
    onDelete: "set null",
  }),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isPrimary: boolean("is_primary").notNull().default(false),
});

const dimensionsSchema = z.object({
  length: z.number(),
  width: z.number(),
  height: z.number(),
});

export const insertProductVariantSchema = z.object({
  productId: z.string().uuid(),
  sku: z.string().min(1),
  price: z.string(),
  salePrice: z.string().nullable().optional(),
  colorId: z.string().uuid(),
  sizeId: z.string().uuid(),
  inStock: z.number().int().default(0),
  weight: z.number().nullable().optional(),
  dimensions: dimensionsSchema.nullable().optional(),
});

export const selectProductVariantSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  sku: z.string(),
  price: z.string(),
  salePrice: z.string().nullable(),
  colorId: z.string().uuid(),
  sizeId: z.string().uuid(),
  inStock: z.number().int(),
  weight: z.number().nullable(),
  dimensions: dimensionsSchema.nullable(),
  createdAt: z.date(),
});

export const insertProductImageSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().nullable().optional(),
  url: z.string().min(1),
  sortOrder: z.number().int().default(0),
  isPrimary: z.boolean().default(false),
});

export const selectProductImageSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  variantId: z.string().uuid().nullable(),
  url: z.string(),
  sortOrder: z.number().int(),
  isPrimary: z.boolean(),
});

export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;
