"use client";
// Fetches every scene's narration in a Microsoft Edge neural voice (via /api/voice) before playback,
// so the lesson can be timed by measured words. Scenes that fail fall back to the browser voice.
import { useEffect, useState } from "react";
import type { VoiceClip } from "./timing";
import type { Lesson } from "./types";

export const EDGE_VOICES = [
  { id: "en-US-AvaMultilingualNeural", label: "Ava (US)" },
  { id: "en-US-AndrewMultilingualNeural", label: "Andrew (US)" },
  { id: "en-US-EmmaMultilingualNeural", label: "Emma (US)" },
  { id: "en-US-BrianMultilingualNeural", label: "Brian (US)" },
  { id: "en-GB-SoniaNeural", label: "Sonia (UK)" },
];

const memo = new Map<string, Promise<VoiceClip | null>>();

function durationOf(url: string): Promise<number> {
  return new Promise((res) => {
    const a = new Audio();
    a.preload = "metadata";
    a.onloadedmetadata = () => res(Number.isFinite(a.duration) ? a.duration : 0);
    a.onerror = () => res(0);
    a.src = url;
  });
}

function fetchClip(text: string, voice: string): Promise<VoiceClip | null> {
  const key = voice + "|" + text;
  if (!memo.has(key)) {
    memo.set(key, (async () => {
      try {
        const r = await fetch("/api/voice", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text, voice }), signal: AbortSignal.timeout(30000) });
        if (!r.ok) return null;
        const { audio, words } = await r.json();
        const bytes = Uint8Array.from(atob(audio), (c) => c.charCodeAt(0));
        const url = URL.createObjectURL(new Blob([bytes], { type: "audio/mpeg" }));
        const duration = await durationOf(url);
        const last = words?.length ? words[words.length - 1].end : 0;
        return { url, duration: Math.max(duration, last), words: words ?? [] };
      } catch { return null; }
    })());
  }
  const p = memo.get(key)!;
  p.then((c) => { if (!c) memo.delete(key); });
  return p;
}

export function useEdgeVoice(lesson: Lesson, voice: string | null) {
  // Clips arrive one by one (first scenes first); `ready` once all are in (or after 90 s).
  // A clip that fails is tried once more; only then is the scene marked `failed` (browser voice).
  const [clips, setClips] = useState<Record<number, VoiceClip | undefined>>({});
  const [failed, setFailed] = useState<Record<number, true>>({});
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    setClips({}); setFailed({}); setProgress(0); setReady(!voice);
    if (!voice) return;
    let alive = true;
    const n = lesson.scenes.length;
    let done = 0, next = 0;
    const out: Record<number, VoiceClip | undefined> = {}, bad: Record<number, true> = {};
    const worker = async () => {
      while (next < n && alive) {
        const i = next++;
        const text = lesson.scenes[i].narration;
        // Up to three tries with a short back-off: Microsoft's service is slow and sometimes errors.
        let c: VoiceClip | null = null;
        for (let k = 0; k < 3 && !c && alive; k++) { if (k) await new Promise((r) => setTimeout(r, 800 * k)); c = await fetchClip(text, voice); }
        if (!alive) return;
        if (c) out[i] = c; else bad[i] = true;
        done++;
        setClips({ ...out }); setFailed({ ...bad }); setProgress(done / n);
        // Play only once the whole narration is ready, so the video never stops for the voice.
        if (done === n) setReady(true);
      }
    };
    Array.from({ length: 4 }, worker);
    // Safety valve: after 90 s, play with whatever arrived (missing scenes are silent with captions).
    const timer = setTimeout(() => { if (alive) setReady(true); }, 90000);
    return () => { alive = false; clearTimeout(timer); };
  }, [lesson, voice]);
  return { clips, failed, ready, progress };
}

// Start fetching a lesson's clips before its player opens (e.g. while the page navigates), in scene
// order, so the first scenes are ready first. Results land in the same cache the player reads.
export function prefetchVoice(lesson: Lesson, voice?: string | null) {
  let v = voice;
  if (!v) { try { v = localStorage.getItem("cr:voice") || EDGE_VOICES[0].id; } catch { v = EDGE_VOICES[0].id; } }
  if (!v || v === "browser") return;
  const texts = lesson.scenes.map((s) => s.narration);
  let next = 0;
  const worker = async () => { while (next < texts.length) await fetchClip(texts[next++], v!); };
  Array.from({ length: 3 }, worker);
}
