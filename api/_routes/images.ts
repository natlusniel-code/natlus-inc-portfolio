import { errorResponse, json } from "../_core/http.ts";
import { getImage, storeImage } from "../_core/images.ts";

/** POST /api/upload { data: "data:image/png;base64,..." } -> { url }
 *  GET  /api/images/:id -> image bytes (long-cached) */
export async function imagesRouter(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (url.pathname === "/api/upload") {
    if (req.method !== "POST") return json({ ok: false, error: "Use POST." }, "no-store", 405);
    try {
      const body = await req.json().catch(() => null);
      if (!body || typeof body.data !== "string") return json({ ok: false, error: "Expected { data: <base64 data URL> }." }, "no-store", 400);
      const { url: imgUrl } = await storeImage(body.data);
      return json({ ok: true, url: imgUrl });
    } catch (e) {
      return errorResponse(e);
    }
  }

  const m = url.pathname.match(/^\/api\/images\/(\d+)$/);
  if (!m) return json({ ok: false, error: "Not found." }, "no-store", 404);
  if (req.method !== "GET") return json({ ok: false, error: "Method not allowed." }, "no-store", 405);

  try {
    const img = await getImage(Number(m[1]));
    if (!img) return json({ ok: false, error: "Image not found." }, "no-store", 404);
    const buf = Buffer.from(img.data, "base64");
    return new Response(new Uint8Array(buf), {
      headers: {
        "content-type": `image/${img.content_type}`,
        "cache-control": "public, max-age=31536000, immutable",
        "x-content-type-options": "nosniff",
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
