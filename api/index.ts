import { handleBundle, json, errorResponse } from "./_core/http.js";
import { contentRouter } from "./_routes/content.js";
import { infoRouter } from "./_routes/info.js";
import { messagesRouter } from "./_routes/messages.js";
import { contactRouter } from "./_routes/contact.js";
import { imagesRouter } from "./_routes/images.js";

// Vercel serverless function entry point (also usable locally with
// `npx vercel dev`). Static assets are served by Vercel before this
// function runs; this handles only /api/* paths.
//
// NOTE ON THE RUNTIME: we deliberately do NOT declare `runtime` here.
// Versioned strings such as "nodejs20.x" are rejected by current Vercel
// CLI versions ("unsupported runtime value in config"). Omitting it lets
// Vercel auto-detect the Node.js runtime from the project settings, which
// is the supported modern approach. `maxDuration` is still honoured.
export const config = {
  maxDuration: 60,
};

/**
 * Restore the ORIGINAL request path.
 *
 * vercel.json rewrites every `/api/*` request to the single function entry
 * `/api/index?__path=:path*` (see the comment there for why). A rewrite
 * changes the path the function sees, so the real path travels in the
 * `__path` query parameter and is restored here — ONCE, before routing —
 * so every router downstream sees the path the client actually requested.
 */
function normalizeUrl(rawUrl: string): string {
  const parsed = new URL(rawUrl);
  const viaQuery = parsed.searchParams.get("__path");
  if (viaQuery !== null) {
    const clean = viaQuery.replace(/^\/+/, "");
    parsed.pathname = clean ? `/api/${clean}` : "/api";
    parsed.searchParams.delete("__path");
  }
  return parsed.toString();
}

/** Route an already-normalised Web `Request` to the right handler. */
async function route(req: Request): Promise<Response> {
  const p = new URL(req.url).pathname;

  if (p === "/api/health") return await infoRouter(req);
  if (p === "/api/content/bundle") return await handleBundle();
  if (p.startsWith("/api/content")) return await contentRouter(req);
  if (p.startsWith("/api/messages")) return await messagesRouter(req);
  if (p.startsWith("/api/contact")) return await contactRouter(req);
  if (p.startsWith("/api/upload") || p.startsWith("/api/images")) return await imagesRouter(req);

  return json({ ok: false, error: "Not found." }, "no-store", 404);
}

/* ------------------------------------------------------------------ *
 * Signature adaptation
 *
 * Vercel's Node.js runtime calls `(req, res)`; the Edge runtime (and
 * `vercel dev` in some modes) calls `(request)` and expects a `Response`.
 * Supporting both means the function keeps working whichever runtime
 * Vercel auto-detects, so removing the explicit `runtime` cannot break it.
 * ------------------------------------------------------------------ */

function isWebRequest(value: unknown): value is Request {
  return typeof Request !== "undefined" && value instanceof Request;
}

async function readNodeBody(req: any): Promise<BodyInit | undefined> {
  const method = String(req.method || "GET").toUpperCase();
  if (method === "GET" || method === "HEAD") return undefined;

  // Vercel's Node runtime may pre-parse JSON bodies onto req.body.
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === "string") return req.body;
    if (Buffer.isBuffer(req.body)) return new Uint8Array(req.body);
    if (typeof req.body === "object") return JSON.stringify(req.body);
  }

  // Otherwise drain the raw stream.
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  if (chunks.length === 0) return undefined;
  return new Uint8Array(Buffer.concat(chunks));
}

async function toWebRequest(req: any): Promise<Request> {
  if (isWebRequest(req)) {
    const normalized = normalizeUrl(req.url);
    return normalized === req.url ? req : new Request(normalized, req);
  }

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers || {})) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) value.forEach((v) => headers.append(key, String(v)));
    else headers.set(key, String(value));
  }

  const proto = headers.get("x-forwarded-proto") || "https";
  const host = headers.get("x-forwarded-host") || headers.get("host") || "localhost";
  const rawUrl: string = req.url || "/";
  const url = normalizeUrl(rawUrl.startsWith("http") ? rawUrl : `${proto}://${host}${rawUrl}`);

  const method = String(req.method || "GET").toUpperCase();
  const body = await readNodeBody(req);

  return new Request(url, { method, headers, body });
}

async function sendNodeResponse(res: any, response: Response): Promise<void> {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    try {
      res.setHeader(key, value);
    } catch {
      /* ignore invalid header names */
    }
  });
  const buffer = Buffer.from(await response.arrayBuffer());
  res.end(buffer);
}

export default async function handler(req: any, res?: any): Promise<Response | void> {
  let response: Response;
  try {
    const webReq = await toWebRequest(req);
    response = await route(webReq);
  } catch (e) {
    response = errorResponse(e);
  }

  // Node-style invocation: write the response onto `res`.
  if (res && typeof res.end === "function") {
    await sendNodeResponse(res, response);
    return;
  }

  // Web-style invocation: return the Response directly.
  return response;
}
