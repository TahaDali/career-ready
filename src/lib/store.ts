"use client";
// Browser storage for Career Ready. Jobs live in localStorage on this device only. The API key lives
// in sessionStorage (cleared when the tab closes) unless the user ticks "remember on this device".
import type { JobRecord, Provider } from "./types";

const J = (id: string) => `cr:job:${id}`;
const safe = <T,>(fn: () => T, fallback: T): T => { try { return fn(); } catch { return fallback; } };

export function saveJob(rec: JobRecord) {
  safe(() => {
    localStorage.setItem(J(rec.id), JSON.stringify(rec));
    const ids: string[] = JSON.parse(localStorage.getItem("cr:jobs") || "[]").filter((x: string) => x !== rec.id);
    localStorage.setItem("cr:jobs", JSON.stringify([rec.id, ...ids].slice(0, 20)));
  }, undefined);
}
export const loadJob = (id: string): JobRecord | null => safe(() => JSON.parse(localStorage.getItem(J(id)) || "null"), null);
export const listJobs = (): JobRecord[] =>
  safe(() => (JSON.parse(localStorage.getItem("cr:jobs") || "[]") as string[]).map(loadJob).filter(Boolean) as JobRecord[], []);
export function updateJob(id: string, fn: (r: JobRecord) => JobRecord) {
  const r = loadJob(id);
  if (r) saveJob(fn(r));
}
export function deleteJob(id: string) {
  safe(() => {
    localStorage.removeItem(J(id));
    const ids: string[] = JSON.parse(localStorage.getItem("cr:jobs") || "[]").filter((x: string) => x !== id);
    localStorage.setItem("cr:jobs", JSON.stringify(ids));
  }, undefined);
}

export interface KeySettings { provider: Provider; model: string; key: string; remember: boolean }
export function loadSettings(): KeySettings {
  return safe(() => {
    const s = JSON.parse(localStorage.getItem("cr:settings") || "{}");
    const key = sessionStorage.getItem("cr:key") || localStorage.getItem("cr:key") || "";
    return { provider: s.provider === "openai" ? "openai" : "anthropic", model: s.model || "", key, remember: !!localStorage.getItem("cr:key") };
  }, { provider: "anthropic", model: "", key: "", remember: false });
}
export function saveSettings(s: KeySettings) {
  safe(() => {
    localStorage.setItem("cr:settings", JSON.stringify({ provider: s.provider, model: s.model }));
    sessionStorage.setItem("cr:key", s.key);
    if (s.remember) localStorage.setItem("cr:key", s.key); else localStorage.removeItem("cr:key");
  }, undefined);
}

export const newId = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
