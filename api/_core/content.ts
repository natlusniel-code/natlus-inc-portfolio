import { q } from "./db.ts";
import { HttpError } from "./errors.ts";
import { validateSingleton, validateItem } from "./schemas.ts";
import type { ContentKey, ContentListKey, SingletonValue, ItemData } from "../../shared/types.ts";

// ---------------------------------------------------------------
// Singleton content: generic `content(key, value)` table.
// ---------------------------------------------------------------

export async function getSingleton<T extends SingletonValue>(key: ContentKey): Promise<T> {
  const rows = await q<{ value: unknown }>("SELECT value FROM content WHERE key = $1", [key]);
  if (!rows.length) throw new HttpError(404, `Content "${key}" is not initialized. Run the seed first (npm run db:seed).`);
  return rows[0].value as unknown as T;
}

export async function upsertSingleton(key: ContentKey, raw: unknown): Promise<void> {
  const value = validateSingleton(key, raw);
  await q(
    `INSERT INTO content (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [key, JSON.stringify(value)],
  );
}

// ---------------------------------------------------------------
// List content: one table per list.
// ---------------------------------------------------------------

const LIST_TABLE: Record<ContentListKey, string> = {
  services: "services",
  packages: "packages",
  projects: "projects",
  process: "process_steps",
  benefits: "benefits",
  testimonials: "testimonials",
  faqs: "faqs",
  socials: "socials",
};

export async function listItems<T extends ItemData>(list: ContentListKey): Promise<T[]> {
  const rows = await q<{ id: number; data: unknown; position: number; created_at: string }>(
    `SELECT id, data, position, created_at FROM ${LIST_TABLE[list]} ORDER BY position ASC, id ASC`,
  );
  return rows.map((r) => ({ id: r.id, ...(r.data as object) }) as unknown as T);
}

export async function getItem<T extends ItemData>(list: ContentListKey, id: number): Promise<T> {
  const rows = await q<{ id: number; data: unknown }>(`SELECT id, data FROM ${LIST_TABLE[list]} WHERE id = $1`, [id]);
  if (!rows.length) throw new HttpError(404, `${list} item ${id} not found.`);
  return { id: rows[0].id, ...(rows[0].data as object) } as unknown as T;
}

export async function nextPosition(list: ContentListKey): Promise<number> {
  const rows = await q<{ m: number | null }>(`SELECT COALESCE(MAX(position), -1) + 1 AS m FROM ${LIST_TABLE[list]}`);
  return rows[0].m ?? 0;
}

export async function createItem(list: ContentListKey, raw: unknown): Promise<{ id: number }> {
  const data = validateItem(list, raw);
  const pos = await nextPosition(list);
  const rows = await q<{ id: number }>(
    `INSERT INTO ${LIST_TABLE[list]} (data, position) VALUES ($1, $2) RETURNING id`,
    [JSON.stringify(data), pos],
  );
  return { id: rows[0].id };
}

export async function updateItem(list: ContentListKey, id: number, raw: unknown): Promise<void> {
  const data = validateItem(list, raw);
  await q(`UPDATE ${LIST_TABLE[list]} SET data = $2 WHERE id = $1`, [id, JSON.stringify(data)]);
}

export async function deleteItem(list: ContentListKey, id: number): Promise<void> {
  await q(`DELETE FROM ${LIST_TABLE[list]} WHERE id = $1`, [id]);
}

export async function reorderItems(list: ContentListKey, ids: number[]): Promise<void> {
  const table = LIST_TABLE[list];
  await q(`UPDATE ${table} SET position = -1`);
  for (let i = 0; i < ids.length; i++) {
    const id = Number(ids[i]);
    if (!Number.isInteger(id)) continue;
    await q(`UPDATE ${table} SET position = $2 WHERE id = $1`, [id, i]);
  }
}
