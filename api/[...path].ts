// Catch-all API entry point.
//
// Vercel's filesystem routing maps `/api/<anything>` (including nested
// paths such as `/api/content/bundle`) to this file, while `/api` itself
// maps to `api/index.ts`. Both re-export the same handler, so every API
// route reaches the function with its ORIGINAL pathname intact — which is
// what the router inside `api/index.ts` relies on.
//
// This replaces the old `{ "source": "/api/(.*)", "destination": "/api/index" }`
// rewrite, which collapsed every API path to `/api/index` and broke routing.
export { default, config } from "./index.js";
