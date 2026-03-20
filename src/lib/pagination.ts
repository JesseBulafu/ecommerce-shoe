import { SQL, sql, gt, lt, and, desc, asc } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface CursorPaginationOptions {
  /** Number of items to return. Default: 20, max: 100. */
  limit?: number;
  /** Opaque cursor string returned by a previous call. */
  cursor?: string | null;
  /** Direction: newest-first (desc) or oldest-first (asc). Default: desc. */
  direction?: "asc" | "desc";
}

/**
 * Encode a cursor value (any string/uuid/date) to a base64 URL-safe token.
 * Never expose raw DB IDs in cursors — always encode them.
 */
export function encodeCursor(value: string): string {
  return Buffer.from(value).toString("base64url");
}

/**
 * Decode a cursor token back to its raw value.
 * Returns null if the cursor is invalid (tampered / malformed).
 */
export function decodeCursor(cursor: string): string | null {
  try {
    return Buffer.from(cursor, "base64url").toString("utf-8");
  } catch {
    return null;
  }
}

/**
 * Build the WHERE clause fragment for cursor-based pagination on a single
 * column (typically `created_at` or `id`).
 *
 * @example
 * const where = cursorWhere(orders.createdAt, cursor, "desc");
 * const rows = await db.select().from(orders).where(where).limit(limit + 1);
 */
export function cursorWhere(
  column: PgColumn,
  cursor: string | null | undefined,
  direction: "asc" | "desc" = "desc"
): SQL | undefined {
  if (!cursor) return undefined;
  const raw = decodeCursor(cursor);
  if (!raw) return undefined;
  return direction === "desc"
    ? lt(column, raw as unknown as SQL)
    : gt(column, raw as unknown as SQL);
}

/**
 * Slice the raw result set into a page, producing the next cursor automatically.
 * Always fetch `limit + 1` rows, then pass the full array here.
 *
 * @example
 * const raw = await db.select().from(orders)
 *   .where(and(eq(orders.userId, userId), cursorWhere(orders.createdAt, cursor, "desc")))
 *   .orderBy(desc(orders.createdAt))
 *   .limit(limit + 1);
 *
 * return buildPage(raw, limit, (row) => row.createdAt.toISOString());
 */
export function buildPage<T>(
  rows: T[],
  limit: number,
  getCursorValue: (row: T) => string
): CursorPage<T> {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const lastItem = items[items.length - 1];
  const nextCursor =
    hasMore && lastItem ? encodeCursor(getCursorValue(lastItem)) : null;

  return { items, nextCursor, hasMore };
}

/**
 * Parse & clamp pagination options from query string parameters.
 */
export function parsePaginationParams(params: {
  limit?: string | null;
  cursor?: string | null;
  direction?: string | null;
}): Required<CursorPaginationOptions> {
  const raw = parseInt(params.limit ?? "20", 10);
  const limit = isNaN(raw) ? 20 : Math.min(Math.max(raw, 1), 100);
  const direction = params.direction === "asc" ? "asc" : "desc";
  return { limit, cursor: params.cursor ?? null, direction };
}

export { and, desc, asc, gt, lt, sql };
