// Node module-resolution hook for LOCAL development.
//
// The api/ and shared/ sources use `.js` extensions in their relative import
// specifiers (e.g. `import { q } from "./db.js"`). That is what Vercel's
// per-file TypeScript transpilation requires at runtime, and it is also the
// correct form for Node ESM. But locally the files on disk are still `.ts`,
// so Node cannot find `./db.js`.
//
// This hook maps a relative `./x.js` specifier back to `./x.ts` when that
// file exists, so `npm run dev:api` runs the very same sources Vercel builds.
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

export async function resolve(specifier, context, nextResolve) {
  if (
    specifier.endsWith(".js") &&
    (specifier.startsWith("./") || specifier.startsWith("../")) &&
    context.parentURL
  ) {
    const asTs = specifier.slice(0, -3) + ".ts";
    try {
      if (existsSync(fileURLToPath(new URL(asTs, context.parentURL)))) {
        return nextResolve(asTs, context);
      }
    } catch {
      /* fall through to the default resolution */
    }
  }
  return nextResolve(specifier, context);
}
