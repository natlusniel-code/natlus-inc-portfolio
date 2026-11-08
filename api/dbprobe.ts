// TEMPORARY deployment probe — imports pg and reports the real failure text.
import pg from "pg";

export const config = {};

export default async function handler(_req: unknown, res: any): Promise<void> {
  const out: Record<string, unknown> = {
    ok: false,
    probe: "db",
    pgVersion: (pg as any)?.version ?? "n/a",
    hasDatabaseUrl: !!process.env.DATABASE_URL,
  };
  try {
    const url = (process.env.DATABASE_URL || "").trim();
    if (!url) {
      out.error = "DATABASE_URL missing";
    } else {
      const local = /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(url);
      const pool = new pg.Pool({
        connectionString: url,
        ssl: local ? undefined : { rejectUnauthorized: false },
        max: 1,
        connectionTimeoutMillis: 8000,
      });
      const r = await pool.query("select 1 as one");
      out.ok = true;
      out.rows = r.rows;
      await pool.end();
    }
  } catch (e: any) {
    out.error = String(e?.message ?? e);
    out.code = e?.code;
  }
  res.statusCode = 200;
  res.setHeader("content-type", "application/json");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(out));
}
