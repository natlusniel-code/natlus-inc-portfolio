// Natlus Inc. Portfolio — seed (idempotent: upserts by key / seed_key,
// never duplicates). Usage: DATABASE_URL=... node db/seed.mjs
//
// Re-running this is safe: singletons are upserted by key, and list rows
// are upserted by their stable `seed_key`. Rows the owner created in the
// admin panel have seed_key = NULL and are never touched.
import pg from "pg";
import { seed } from "./seed-data.mjs";

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

const SINGLETONS = [
  ["company", seed.company],
  ["ceo", seed.ceo],
  ["hero", seed.hero],
  ["contact", seed.contact],
  ["whatsapp", seed.whatsapp],
  ["footer", seed.footer],
  ["seo", seed.seo],
  ["settings", seed.settings],
  ["pricing", seed.pricing],
  ["portfolioCategories", seed.portfolioCategories],
];

// [sourceKey, table, slugField?]
const LISTS = [
  ["services", "services"],
  ["packages", "packages"],
  ["projects", "projects", "slug"],
  ["process", "process_steps"],
  ["benefits", "benefits"],
  ["testimonials", "testimonials"],
  ["faqs", "faqs"],
  ["socials", "socials"],
];

/** Stable identifier for a seeded row: its slug, else a slugified title/label. */
function seedKeyFor(item, index) {
  if (item.slug) return item.slug;
  const label = item.title || item.question || item.platform || item.name || item.step || "";
  const slug = String(label)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `item-${index}`;
}

try {
  for (const [key, value] of SINGLETONS) {
    await pool.query(
      `INSERT INTO content (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
      [key, JSON.stringify(value)],
    );
  }
  console.log(`Seeded ${SINGLETONS.length} singleton content items.`);

  for (const [srcKey, table, slugField] of LISTS) {
    const items = seed[srcKey];
    let inserted = 0;
    let updated = 0;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const data = JSON.stringify(item);
      const seedKey = seedKeyFor(item, i);
      const slug = slugField ? item[slugField] : null;

      const res = slug
        ? await pool.query(
            `INSERT INTO ${table} (slug, seed_key, data, position) VALUES ($1, $2, $3, $4)
             ON CONFLICT (seed_key) DO UPDATE SET slug = EXCLUDED.slug, data = EXCLUDED.data, position = EXCLUDED.position
             RETURNING (xmax = 0) AS is_new`,
            [slug, seedKey, data, i],
          )
        : await pool.query(
            `INSERT INTO ${table} (seed_key, data, position) VALUES ($1, $2, $3)
             ON CONFLICT (seed_key) DO UPDATE SET data = EXCLUDED.data, position = EXCLUDED.position
             RETURNING (xmax = 0) AS is_new`,
            [seedKey, data, i],
          );
      if (res.rows[0]?.is_new) inserted++;
      else updated++;
    }
    console.log(`Seeded ${items.length} ${srcKey} (${inserted} new, ${updated} updated).`);
  }
  console.log("Seed complete. The store is ready.");
} catch (e) {
  console.error("Seed failed:", e.message || e);
  process.exitCode = 1;
} finally {
  await pool.end();
}
