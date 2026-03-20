import { pgTable, uuid, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { z } from "zod";
import { user } from "./user";
import { products } from "./products";

export const wishlists = pgTable("wishlists", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
}, (t) => [
  uniqueIndex("idx_wishlists_user_product").on(t.userId, t.productId),
  index("idx_wishlists_user_id").on(t.userId),
  index("idx_wishlists_product_id").on(t.productId),
]);

export const insertWishlistSchema = z.object({
  userId: z.string().uuid(),
  productId: z.string().uuid(),
});

export const selectWishlistSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  productId: z.string().uuid(),
  addedAt: z.date(),
});

export type Wishlist = typeof wishlists.$inferSelect;
export type NewWishlist = typeof wishlists.$inferInsert;
