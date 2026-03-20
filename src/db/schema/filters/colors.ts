import { pgTable, uuid, text } from "drizzle-orm/pg-core";
import { z } from "zod";

export const colors = pgTable("colors", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  hexCode: text("hex_code").notNull(),
});

export const insertColorSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export const selectColorSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  hexCode: z.string(),
});

export type Color = typeof colors.$inferSelect;
export type NewColor = typeof colors.$inferInsert;
