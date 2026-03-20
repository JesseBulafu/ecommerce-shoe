import { pgTable, uuid, text, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { categories } from "./categories";
import { genders } from "./filters/genders";
import { brands } from "./brands";

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  categoryId: uuid("category_id")
    .references(() => categories.id, { onDelete: "set null" })
    .notNull(),
  genderId: uuid("gender_id")
    .references(() => genders.id, { onDelete: "set null" })
    .notNull(),
  brandId: uuid("brand_id")
    .references(() => brands.id, { onDelete: "set null" })
    .notNull(),
  isPublished: boolean("is_published").notNull().default(false),
  defaultVariantId: uuid("default_variant_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // Soft-delete: products are never hard-deleted to preserve order history
  deletedAt: timestamp("deleted_at"),
}, (t) => [
  index("idx_products_category_id").on(t.categoryId),
  index("idx_products_gender_id").on(t.genderId),
  index("idx_products_brand_id").on(t.brandId),
  index("idx_products_is_published").on(t.isPublished),
  index("idx_products_created_at").on(t.createdAt),
  // Partial index: only published, non-deleted products are queried in storefront
  index("idx_products_storefront").on(t.categoryId, t.genderId).where(sql`is_published = true AND deleted_at IS NULL`),
]);

export const insertProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  categoryId: z.string().uuid(),
  genderId: z.string().uuid(),
  brandId: z.string().uuid(),
  isPublished: z.boolean().default(false),
  defaultVariantId: z.string().uuid().nullable().optional(),
});

export const selectProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  categoryId: z.string().uuid(),
  genderId: z.string().uuid(),
  brandId: z.string().uuid(),
  isPublished: z.boolean(),
  defaultVariantId: z.string().uuid().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
