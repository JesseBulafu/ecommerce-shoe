import { pgTable, uuid, integer, text, timestamp, index } from "drizzle-orm/pg-core";
import { z } from "zod";
import { products } from "./products";
import { user } from "./user";

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("idx_reviews_product_id").on(t.productId),
  index("idx_reviews_user_id").on(t.userId),
  index("idx_reviews_rating").on(t.productId, t.rating),
  index("idx_reviews_created_at").on(t.createdAt),
]);

export const insertReviewSchema = z.object({
  productId: z.string().uuid(),
  userId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable().optional(),
});

export const selectReviewSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  userId: z.string().uuid(),
  rating: z.number().int(),
  comment: z.string().nullable(),
  createdAt: z.date(),
});

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
