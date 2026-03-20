import { pgTable, uuid, text, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const user = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: text("role").notNull().default("customer"), // "customer" | "admin"
  adminKey: text("admin_key"), // generated UUID when promoted to admin, null for customers
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // Soft-delete: set instead of destroying user data
  deletedAt: timestamp("deleted_at"),
}, (t) => [
  // Partial index: only index active (non-deleted) users
  index("idx_user_active").on(t.id).where(sql`deleted_at IS NULL`),
  index("idx_user_created_at").on(t.createdAt),
  index("idx_user_role").on(t.role),
]);

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
