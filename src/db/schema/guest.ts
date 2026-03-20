import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";

export const guest = pgTable("guest", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionToken: text("session_token").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
}, (t) => [
  // Efficient guest session resolution and expiry cleanup
  index("idx_guest_session_token").on(t.sessionToken),
  index("idx_guest_expires_at").on(t.expiresAt),
]);

export type Guest = typeof guest.$inferSelect;
export type NewGuest = typeof guest.$inferInsert;
