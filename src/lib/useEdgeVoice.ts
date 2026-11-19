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
  // Clips arrive one by one (first scenes first); `ready` once the first is in (or after 12 s).
  const [clips, setClips] = useState<Record<number, VoiceClip | undefined>>({});
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    setClips({}); setProgress(0); setReady(!voice);
    if (!voice) return;
    let alive = true;
    const n = lesson.scenes.length, need = Math.min(1, n);
    let done = 0, next = 0, firstDone = 0;
    const out: Record<number, VoiceClip | undefined> = {};
    const worker = async () => {
      while (next < n && alive) {
        const i = next++;
        const c = await fetchClip(lesson.scenes[i].narration, voice);
        if (!alive) return;
        if (c) out[i] = c;
        done++; if (i < need) firstDone++;
        setClips({ ...out }); setProgress(done / n);
        if (firstDone >= need) setReady(true);
      }
    };
    Array.from({ length: 4 }, worker);
    const timer = setTimeout(() => { if (alive) setReady(true); }, 12000);
    return () => { alive = false; clearTimeout(timer); };
  }, [lesson, voice]);
  return { clips, ready, progress };
}
