import { q } from "../_core/db.ts";
import { errorResponse, json } from "../_core/http.ts";

export async function infoRouter(req: Request): Promise<Response> {
  const url = new URL(req.url);
  if (url.pathname !== "/api/health") return json({ ok: false, error: "Not found." }, "no-store", 404);

  try {
    await q("SELECT 1");
    return json({ ok: true, status: "ok", db: "connected" });
  } catch (e) {
    return errorResponse(e);
  }
}
