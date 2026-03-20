import { pgTable, uuid, text } from "drizzle-orm/pg-core";
import { z } from "zod";

export const genders = pgTable("genders", {
  id: uuid("id").defaultRandom().primaryKey(),
  label: text("label").notNull(),
  slug: text("slug").notNull().unique(),
});

export const insertGenderSchema = z.object({
  label: z.string().min(1),
  slug: z.string().min(1),
});

export const selectGenderSchema = z.object({
  id: z.string().uuid(),
  label: z.string(),
  slug: z.string(),
});

export type Gender = typeof genders.$inferSelect;
export type NewGender = typeof genders.$inferInsert;
