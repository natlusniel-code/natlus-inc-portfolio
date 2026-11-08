// Natlus Inc. Portfolio — schema migration
// Usage: DATABASE_URL=... node db/migrate.mjs
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: url,
  ssl: /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(url) ? undefined : { rejectUnauthorized: false },
  max: 4,
});

// Strip full-line SQL comments BEFORE splitting, so a statement that
// follows a comment block is not mistaken for a comment itself.
const raw = readFileSync(join(__dirname, "schema.sql"), "utf8");
const sql = raw
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n");

const statements = sql
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

try {
  for (const stmt of statements) {
    await pool.query(stmt);
  }
  console.log(`Migration applied (${statements.length} statements).`);
} catch (e) {
  console.error("Migration failed:", e.message || e);
  process.exitCode = 1;
} finally {
  await pool.end();
}
