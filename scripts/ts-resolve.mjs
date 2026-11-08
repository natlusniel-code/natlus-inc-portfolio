// Registers the local `.js` -> `.ts` resolution hook. Loaded via
// `node --import ./scripts/ts-resolve.mjs` (see the dev:api script).
import { register } from "node:module";

register("./ts-resolve-hooks.mjs", import.meta.url);
