import { HttpError } from "./errors.js";

export function str(v: unknown, max = 10000): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function strArr(v: unknown, max = 200): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const x of v) {
    const s = str(x, max);
    if (s && !out.includes(s)) out.push(s);
  }
  return out;
}

export function requiredStr(v: unknown, field: string, max = 10000): string {
  const s = str(v, max);
  if (!s) throw new HttpError(400, `"${field}" is required.`);
  return s;
}

export function bool(v: unknown): boolean {
  return v === true || v === "true" || v === 1;
}

export function slugify(s: string): string {
  const out = s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return out || "item";
}

export function isHexColor(v: unknown): boolean {
  return typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v);
}

export function isSafeUrl(v: unknown, allowEmpty = true): boolean {
  if (typeof v !== "string") return false;
  const s = v.trim();
  if (s === "") return allowEmpty;
  return /^https?:\/\//i.test(s) || s.startsWith("/") || s.startsWith("#") || s.startsWith("data:image/");
}
