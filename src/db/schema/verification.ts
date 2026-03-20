import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";

export const verification = pgTable("verification", {
  id: uuid("id").defaultRandom().primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  // Better Auth looks up tokens by identifier (email) + value
  index("idx_verification_identifier").on(t.identifier),
  index("idx_verification_expires_at").on(t.expiresAt),
]);

export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;
