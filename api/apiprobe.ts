// TEMPORARY deployment probe — loads the real api/index.ts module graph.
import { config } from "./index.ts";

export const maxDuration = 60;

export default async function handler(req: any, res: any): Promise<void> {
  const out: Record<string, unknown> = { ok: false, probe: "graph" };
  try {
    const mod: any = await import("./index.ts");
    out.imported = true;
    out.keys = Object.keys(mod);
    req.url = "/api/health";
    req.method = "GET";
    req.headers = req.headers ?? {};
    const response = await mod.default(req, res);
    if (response && typeof response.status === "number") {
      out.ok = response.status === 200;
      out.innerStatus = response.status;
      res.statusCode = 200;
      res.setHeader("content-type", "application/json");
      res.setHeader("cache-control", "no-store");
      res.end(JSON.stringify({ ...out, innerBody: await response.text() }));
      return;
    }
    return;
  } catch (e: any) {
    out.error = String(e?.message ?? e);
    out.stack = String(e?.stack ?? "").split("\n").slice(0, 6);
  }
  res.statusCode = 200;
  res.setHeader("content-type", "application/json");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify({ ...out, config }));
}
