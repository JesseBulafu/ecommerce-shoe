import { neon, Pool } from "@neondatabase/serverless";
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzlePool } from "drizzle-orm/neon-serverless";
import * as schema from "./schema/index";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

/** Strip wrapping quotes that some .env editors add around values. */
const stripQuotes = (s: string) => s.replace(/^["']|["']$/g, "");

const DATABASE_URL = stripQuotes(process.env.DATABASE_URL ?? "");
const DATABASE_URL_REPLICA = process.env.DATABASE_URL_REPLICA
  ? stripQuotes(process.env.DATABASE_URL_REPLICA)
  : DATABASE_URL;

/**
 * PRIMARY: HTTP client used in edge / serverless functions (no persistent sockets).
 * Drizzle wraps each query in its own Neon HTTP request — zero connection overhead.
 */
const httpSql = neon(DATABASE_URL);
export const db = drizzleHttp(httpSql, { schema });

/**
 * POOLED: WebSocket-based pool for long-running Node.js processes (e.g. cron
 * jobs, batch workers, migrations) that need real connection reuse.
 * Re-uses up to `max` connections from Neon's built-in PgBouncer pooler.
 */
const writePool = new Pool({
  connectionString: DATABASE_URL,
  max: 10,
});
export const dbPool = drizzlePool(writePool, { schema });

/**
 * READ REPLICA: Route all read-only queries here when DATABASE_URL_REPLICA is
 * set (Neon read replica endpoint). Falls back to the primary if not configured.
 * Usage: import { dbRead } from "@/db"  — use for all SELECT operations.
 */
const readPool = new Pool({
  connectionString: DATABASE_URL_REPLICA,
  max: 20, // reads can saturate more connections
});
export const dbRead = drizzlePool(readPool, { schema });
