import { handleBundle, json, errorResponse } from "./_core/http.ts";
import { contentRouter } from "./_routes/content.ts";
import { infoRouter } from "./_routes/info.ts";
import { messagesRouter } from "./_routes/messages.ts";
import { contactRouter } from "./_routes/contact.ts";
import { imagesRouter } from "./_routes/images.ts";

// Vercel serverless function entry point (also usable locally with
// `npx vercel dev`). Static assets are served by Vercel before this
// function runs; this handles only /api/* paths.

export const config = {
  runtime: "nodejs20.x",
  maxDuration: 60,
};

export default async function handler(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const p = url.pathname;

    if (p === "/api/health") return await infoRouter(req);
    if (p === "/api/content/bundle") return await handleBundle();
    if (p.startsWith("/api/content")) return await contentRouter(req);
    if (p.startsWith("/api/messages")) return await messagesRouter(req);
    if (p.startsWith("/api/contact")) return await contactRouter(req);
    if (p.startsWith("/api/upload") || p.startsWith("/api/images")) return await imagesRouter(req);

    return json({ ok: false, error: "Not found." }, "no-store", 404);
  } catch (e) {
    return errorResponse(e);
  }
}
