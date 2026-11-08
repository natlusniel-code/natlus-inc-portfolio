import { HttpError } from "../_core/errors.ts";
import { errorResponse, json } from "../_core/http.ts";
import { getSingleton, listItems, createItem, updateItem, deleteItem, reorderItems, upsertSingleton } from "../_core/content.ts";
import type { ContentKey, ContentListKey } from "../../shared/types.ts";

const SINGLETON_KEYS = new Set<ContentKey>([
  "company", "ceo", "hero", "contact", "whatsapp", "footer", "seo", "settings", "pricing", "portfolioCategories",
]);

const LIST_KEYS = new Set<ContentListKey>([
  "services", "packages", "projects", "process", "benefits", "testimonials", "faqs", "socials",
]);

export async function contentRouter(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const m = url.pathname.match(/^\/api\/content\/([^/]+)(?:\/(\d+))?$/);
  if (!m) return json({ ok: false, error: "Not found." }, "no-store", 404);

  const what = m[1];
  const id = m[2] ? Number(m[2]) : null;

  try {
    // ---- GET a singleton or list (public reads + admin previews) ----
    if (req.method === "GET") {
      if (SINGLETON_KEYS.has(what as ContentKey)) {
        const value = await getSingleton(what as ContentKey);
        return json({ ok: true, value });
      }
      if (LIST_KEYS.has(what as ContentListKey)) {
        const items = await listItems(what as ContentListKey);
        return json({ ok: true, items });
      }
      return json({ ok: false, error: `Unknown content "${what}".` }, "no-store", 404);
    }

    // ---- Admin mutations ----
    if (!SINGLETON_KEYS.has(what as ContentKey) && !LIST_KEYS.has(what as ContentListKey)) {
      return json({ ok: false, error: `Unknown content "${what}".` }, "no-store", 404);
    }

    // DELETE needs no body — handle it before parsing.
    if (req.method === "DELETE") {
      if (!LIST_KEYS.has(what as ContentListKey)) return json({ ok: false, error: "Only list items can be deleted." }, "no-store", 400);
      if (id == null) return json({ ok: false, error: "Use DELETE with an id." }, "no-store", 400);
      await deleteItem(what as ContentListKey, id);
      return json({ ok: true });
    }

    const body = (await readJson(req)) as Record<string, unknown> | null;
    if (body === null) throw new HttpError(400, "Expected a JSON body.");

    if (SINGLETON_KEYS.has(what as ContentKey)) {
      if (req.method !== "PUT") return json({ ok: false, error: "Use PUT to update content." }, "no-store", 405);
      await upsertSingleton(what as ContentKey, body.value ?? body);
      return json({ ok: true });
    }

    const list = what as ContentListKey;
    switch (req.method) {
      case "POST":
        if (id != null) return json({ ok: false, error: "Use POST without an id to create." }, "no-store", 400);
        return json({ ok: true, id: (await createItem(list, body)).id });
      case "PUT":
        if (id == null) return json({ ok: false, error: "Use PUT with an id to update." }, "no-store", 400);
        await updateItem(list, id, body);
        return json({ ok: true });
      case "PATCH":
        if (id != null) return json({ ok: false, error: "Use PATCH without an id to reorder." }, "no-store", 400);
        if (!Array.isArray(body.ids)) throw new HttpError(400, "Expected { ids: number[] }.");
        await reorderItems(list, body.ids as number[]);
        return json({ ok: true });
      default:
        return json({ ok: false, error: "Method not allowed." }, "no-store", 405);
    }
  } catch (e) {
    return errorResponse(e);
  }
}

async function readJson(req: Request): Promise<unknown | null> {
  try {
    const text = await req.text();
    if (!text.trim()) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}
