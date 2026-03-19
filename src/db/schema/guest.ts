import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const guest = pgTable("guest", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionToken: text("session_token").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export type Guest = typeof guest.$inferSelect;
export type NewGuest = typeof guest.$inferInsert;
