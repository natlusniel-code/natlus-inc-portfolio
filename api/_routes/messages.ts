import { errorResponse, json } from "../_core/http.js";
import { listMessages, saveMessage, markMessageRead, deleteMessage } from "../_core/messages.js";

export async function messagesRouter(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const m = url.pathname.match(/^\/api\/messages(?:\/(\d+))?$/);
  if (!m) return json({ ok: false, error: "Not found." }, "no-store", 404);
  const id = m[1] ? Number(m[1]) : null;

  try {
    if (req.method === "GET") {
      return json({ ok: true, messages: await listMessages() });
    }
    if (req.method === "POST") {
      const body = await readJson(req);
      if (body === null) return json({ ok: false, error: "Expected a JSON body." }, "no-store", 400);
      return json({ ok: true, id: (await saveMessage(body)).id });
    }
    if (req.method === "PATCH" && id != null) {
      const body = (await readJson(req)) as Record<string, unknown> | null;
      await markMessageRead(id, body?.read === true);
      return json({ ok: true });
    }
    if (req.method === "DELETE" && id != null) {
      await deleteMessage(id);
      return json({ ok: true });
    }
    return json({ ok: false, error: "Method not allowed." }, "no-store", 405);
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
