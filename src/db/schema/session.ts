import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./user";

export const session = pgTable("session", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  token: text("token").unique().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  // Better Auth looks up sessions by token on every request
  index("idx_session_token").on(t.token),
  index("idx_session_user_id").on(t.userId),
  // Efficient purging of expired sessions
  index("idx_session_expires_at").on(t.expiresAt),
]);

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;
