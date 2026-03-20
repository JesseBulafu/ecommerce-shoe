import { pgTable, pgEnum, uuid, text, boolean, index } from "drizzle-orm/pg-core";
import { z } from "zod";
import { user } from "./user";

export const addressTypeEnum = pgEnum("address_type", ["billing", "shipping"]);

export const addresses = pgTable("addresses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  type: addressTypeEnum("type").notNull(),
  line1: text("line1").notNull(),
  line2: text("line2"),
  streetName: text("street_name"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  country: text("country").notNull().default("Uganda"),
  postalCode: text("postal_code"),
  phone: text("phone").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
}, (t) => [
  index("idx_addresses_user_id").on(t.userId),
  index("idx_addresses_user_type").on(t.userId, t.type),
  index("idx_addresses_is_default").on(t.userId, t.isDefault),
]);

export const insertAddressSchema = z.object({
  userId: z.string().uuid(),
  type: z.enum(["billing", "shipping"]),
  line1: z.string().min(1, "Address is required"),
  line2: z.string().nullable().optional(),
  streetName: z.string().nullable().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "District/State is required"),
  country: z.string().default("Uganda"),
  postalCode: z.string().nullable().optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  isDefault: z.boolean().default(false),
});

export const selectAddressSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum(["billing", "shipping"]),
  line1: z.string(),
  line2: z.string().nullable(),
  streetName: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  postalCode: z.string().nullable(),
  phone: z.string(),
  isDefault: z.boolean(),
});

export type Address = typeof addresses.$inferSelect;
export type NewAddress = typeof addresses.$inferInsert;
