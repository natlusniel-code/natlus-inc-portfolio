// TEMPORARY deployment probe — zero imports, Node handler signature.
export const config = {};

export default function handler(_req: unknown, res: any): void {
  res.statusCode = 200;
  res.setHeader("content-type", "application/json");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify({
    ok: true,
    probe: "ping",
    node: process.version,
    hasFetch: typeof fetch === "function",
    hasRequest: typeof Request === "function",
  }));
}
