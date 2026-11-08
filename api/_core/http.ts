import { getPublicBundle } from "./bundle.ts";
import { HttpError } from "./errors.ts";

const publicCache = "public, max-age=45, stale-while-revalidate=300";

export async function handleHealth(): Promise<Response> {
  return json({ ok: true, service: "natlus-portfolio" });
}

export async function handleBundle(): Promise<Response> {
  try {
    const bundle = await getPublicBundle();
    return json(bundle, publicCache);
  } catch (e) {
    if (e instanceof HttpError && e.status === 404 && e.message.includes("not initialized")) {
      return json({
        ok: false,
        error:
          "Content store is not initialized. Run `npm run db:migrate` and `npm run db:seed` against the production database, then reload.",
      }, "no-store", 503);
    }
    if (e instanceof HttpError && e.status === 503) {
      return json({ ok: false, error: e.message, missingEnv: e.missingEnv }, "no-store", 503);
    }
    throw e;
  }
}

export async function handleNotAllowed(): Promise<Response> {
  return json({ ok: false, error: "Method not allowed." }, "no-store", 405);
}

export function json(body: unknown, cacheControl = "no-store", status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": cacheControl,
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY",
      "referrer-policy": "strict-origin-when-cross-origin",
    },
  });
}

export function errorResponse(e: unknown): Response {
  if (e instanceof HttpError) {
    return json({ ok: false, error: e.message, missingEnv: e.missingEnv }, "no-store", e.status);
  }
  console.error("[natlus-api]", e);
  return json({ ok: false, error: "An unexpected server error occurred." }, "no-store", 500);
}
