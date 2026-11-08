import type { ContentBundle, ContentKey, ContentListKey, ContactMessage } from "../../shared/types";

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { ...init, headers: { "content-type": "application/json", ...(init?.headers ?? {}) } });
  } catch {
    throw new Error("We can't reach the server right now — please try again shortly.");
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
    throw new Error(msg);
  }
  return body as T;
}

export async function loadBundle(): Promise<ContentBundle> {
  const r = await req<ContentBundle & { ok?: boolean; error?: string }>(`/api/content/bundle?t=${Date.now()}`);
  if (r && "ok" in r && !(r as { ok: boolean }).ok) throw new Error((r as { error: string }).error ?? "Content could not be loaded.");
  return r as ContentBundle;
}

export async function saveSingleton(key: ContentKey, value: unknown): Promise<void> {
  await req(`/api/content/${key}`, { method: "PUT", body: JSON.stringify({ value }) });
}

export async function createItem(list: ContentListKey, data: unknown): Promise<number> {
  const r = await req<{ id: number }>(`/api/content/${list}`, { method: "POST", body: JSON.stringify(data) });
  return r.id;
}

export async function updateItem(list: ContentListKey, id: number, data: unknown): Promise<void> {
  await req(`/api/content/${list}/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteItem(list: ContentListKey, id: number): Promise<void> {
  await req(`/api/content/${list}/${id}`, { method: "DELETE" });
}

export async function reorder(list: ContentListKey, ids: number[]): Promise<void> {
  await req(`/api/content/${list}`, { method: "PATCH", body: JSON.stringify({ ids }) });
}

export async function uploadImage(dataUrl: string): Promise<string> {
  const r = await req<{ url: string }>("/api/upload", { method: "POST", body: JSON.stringify({ data: dataUrl }) });
  return r.url;
}

export async function loadMessages(): Promise<ContactMessage[]> {
  const r = await req<{ messages: ContactMessage[] }>("/api/messages");
  return r.messages;
}

export async function setMessageRead(id: number, read: boolean): Promise<void> {
  await req(`/api/messages/${id}`, { method: "PATCH", body: JSON.stringify({ read }) });
}

export async function removeMessage(id: number): Promise<void> {
  await req(`/api/messages/${id}`, { method: "DELETE" });
}
