import type { ContentBundle } from "../../shared/types";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 0,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ApiError("We can't reach the server right now — please try again shortly.", 0);
  }

  const text = await res.text();
  const ct = res.headers.get("content-type") ?? "";
  let body: unknown = null;
  if (ct.includes("application/json") && text.trim()) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }
  if (!res.ok) {
    const msg = body && typeof body === "object" && "error" in body ? String((body as { error: unknown }).error) : `Request failed (${res.status}).`;
    throw new ApiError(msg, res.status);
  }
  return body as T;
}

let cache: ContentBundle | null = null;

/** Load the public content bundle (cached in memory for the session, revalidated on demand). */
export async function fetchBundle(force = false): Promise<ContentBundle> {
  if (cache && !force) return cache;
  const url = `/api/content/bundle?t=${Date.now()}`;
  const res = await request<ContentBundle & { ok?: boolean; error?: string }>(url);
  if (res && "ok" in res && !(res as { ok: boolean }).ok) {
    throw new ApiError((res as { error: string }).error ?? "Content could not be loaded.");
  }
  cache = res as ContentBundle;
  return cache as ContentBundle;
}

export function clearBundleCache(): void {
  cache = null;
}

export { request };
