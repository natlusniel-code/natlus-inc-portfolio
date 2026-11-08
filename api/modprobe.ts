// TEMPORARY probe — imports each api/ module individually, reporting the first failure.
export const config = {};

const MODULES: Record<string, () => Promise<unknown>> = {
  "shared/types": () => import("../shared/types.ts"),
  "core/errors": () => import("./_core/errors.ts"),
  "core/validate": () => import("./_core/validate.ts"),
  "core/db": () => import("./_core/db.ts"),
  "core/schemas": () => import("./_core/schemas.ts"),
  "core/content": () => import("./_core/content.ts"),
  "core/bundle": () => import("./_core/bundle.ts"),
  "core/http": () => import("./_core/http.ts"),
  "core/images": () => import("./_core/images.ts"),
  "core/messages": () => import("./_core/messages.ts"),
  "routes/smtp": () => import("./_routes/smtp.ts"),
  "routes/info": () => import("./_routes/info.ts"),
  "routes/content": () => import("./_routes/content.ts"),
  "routes/messages": () => import("./_routes/messages.ts"),
  "routes/contact": () => import("./_routes/contact.ts"),
  "routes/images": () => import("./_routes/images.ts"),
  "routes/index": () => import("./_routes/index.ts"),
  "index": () => import("./index.ts"),
};

export default async function handler(_req: any, res: any): Promise<void> {
  const results: Record<string, string> = {};
  for (const [name, load] of Object.entries(MODULES)) {
    try {
      await load();
      results[name] = "ok";
    } catch (e: any) {
      results[name] = `FAIL: ${e?.constructor?.name ?? "Error"}: ${e?.message ?? e}`;
    }
  }
  res.statusCode = 200;
  res.setHeader("content-type", "application/json");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify({ node: process.version, results }, null, 2));
}
