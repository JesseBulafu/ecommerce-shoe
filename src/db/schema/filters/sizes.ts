import { pgTable, uuid, text, integer } from "drizzle-orm/pg-core";
import { z } from "zod";

export const sizes = pgTable("sizes", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertSizeSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  sortOrder: z.number().int().default(0),
});

export const selectSizeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  sortOrder: z.number().int(),
});

export type Size = typeof sizes.$inferSelect;
export type NewSize = typeof sizes.$inferInsert;
