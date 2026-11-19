"use client";
import type { KeySettings } from "./store";

export async function api<T>(path: string, body: unknown, s?: KeySettings): Promise<T> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (s) { headers["x-user-key"] = s.key; headers["x-provider"] = s.provider; if (s.model) headers["x-model"] = s.model; }
  let res: Response;
  try { res = await fetch(path, { method: "POST", headers, body: JSON.stringify(body) }); }
  catch { throw new Error("Network problem. Check your connection and try again."); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status}).`);
  return data as T;
}
