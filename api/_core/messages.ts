import { q } from "./db.ts";
import { HttpError } from "./errors.ts";
import { str } from "./validate.ts";
import type { ContactMessage } from "../../shared/types.ts";

export async function listMessages(): Promise<ContactMessage[]> {
  const rows = await q<ContactMessage & { created_at: string }>(
    `SELECT id, name, email, service, budget, description, "read", created_at FROM contact_messages ORDER BY id DESC`,
  );
  return rows.map((r) => ({ ...r, createdAt: r.created_at }));
}

export async function saveMessage(raw: unknown): Promise<{ id: number }> {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) throw new HttpError(400, "Invalid message.");
  const v = raw as Record<string, unknown>;
  const name = str(v.name, 120);
  const email = str(v.email, 200);
  const service = str(v.service, 160);
  const budget = str(v.budget, 120);
  const description = str(v.description, 4000);
  if (!name) throw new HttpError(400, "Please enter your name.");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, "Please enter a valid email address.");
  if (!description) throw new HttpError(400, "Please describe your project.");
  const rows = await q<{ id: number }>(
    `INSERT INTO contact_messages (name, email, service, budget, description) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [name, email, service, budget, description],
  );
  return { id: rows[0].id };
}

export async function markMessageRead(id: number, read: boolean): Promise<void> {
  await q(`UPDATE contact_messages SET "read" = $2 WHERE id = $1`, [id, read]);
}

export async function deleteMessage(id: number): Promise<void> {
  await q(`DELETE FROM contact_messages WHERE id = $1`, [id]);
}

export async function messageCounts(): Promise<{ total: number; unread: number }> {
  const rows = await q<{ total: number; unread: number }>(
    `SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE NOT "read")::int AS unread FROM contact_messages`,
  );
  return { total: rows[0]?.total ?? 0, unread: rows[0]?.unread ?? 0 };
}
