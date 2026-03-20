import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";
import { products } from "./products";

export const collections = pgTable("collections", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productCollections = pgTable("product_collections", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  collectionId: uuid("collection_id")
    .references(() => collections.id, { onDelete: "cascade" })
    .notNull(),
});

export const insertCollectionSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
});

export const selectCollectionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.date(),
});

export const insertProductCollectionSchema = z.object({
  productId: z.string().uuid(),
  collectionId: z.string().uuid(),
});

export const selectProductCollectionSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  collectionId: z.string().uuid(),
});

export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;
export type ProductCollection = typeof productCollections.$inferSelect;
export type NewProductCollection = typeof productCollections.$inferInsert;
