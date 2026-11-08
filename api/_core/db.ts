import pg from "pg";
import { HttpError } from "./errors.js";

let pool: pg.Pool | null = null;

export function databaseUrlPresent(): boolean {
  return !!(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);
}

export function getPool(): pg.Pool {
  if (pool) return pool;
  const url = (process.env.DATABASE_URL || "").trim();
  if (!url) {
    throw new HttpError(
      503,
      "DATABASE_URL is not set. Add it in Vercel -> Settings -> Environment Variables (Production and Preview), then redeploy.",
      ["DATABASE_URL"],
    );
  }
  const local = /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(url);
  pool = new pg.Pool({
    connectionString: url,
    ssl: local ? undefined : { rejectUnauthorized: false },
    max: 4,
    connectionTimeoutMillis: 8000,
    idleTimeoutMillis: 20000,
  });
  return pool;
}

/** Run a query, mapping connection failures to a readable 503. */
export async function q<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]> {
  try {
    const client = await getPool().connect();
    try {
      const r = await client.query(text, params);
      return r.rows as T[];
    } finally {
      client.release();
    }
  } catch (e) {
    if (e instanceof HttpError) throw e;
    throw new HttpError(
      503,
      "The database could not be reached. Check that DATABASE_URL is set correctly and the database is running.",
      databaseUrlPresent() ? [] : ["DATABASE_URL"],
    );
  }
}
