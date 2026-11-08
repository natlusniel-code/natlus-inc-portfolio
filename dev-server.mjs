// Local development API server.
// Runs the same handler as the Vercel function (api/index.ts) on port 3001,
// so `npm run dev` (Vite on 5173) can proxy /api/* to it.
// Usage: npm run dev:api
import { createServer } from "node:http";
import handler from "./api/index.ts";

const PORT = Number(process.env.API_PORT || 3001);

const server = createServer(async (req, res) => {
  try {
    const url = `http://${req.headers.host ?? `localhost:${PORT}`}${req.url}`;
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const body = chunks.length ? Buffer.concat(chunks) : undefined;

    const request = new Request(url, {
      method: req.method,
      headers: req.headers,
      body: req.method === "GET" || req.method === "HEAD" ? undefined : body,
    });

    const response = await handler(request);
    res.statusCode = response.status;
    response.headers.forEach((v, k) => res.setHeader(k, v));
    const buf = Buffer.from(await response.arrayBuffer());
    res.end(buf);
  } catch (e) {
    console.error("[dev-api]", e);
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: false, error: "Dev API error." }));
  }
});

server.listen(PORT, () => {
  console.log(`Dev API listening on http://localhost:${PORT}`);
});
