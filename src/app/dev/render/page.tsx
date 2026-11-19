"use client";
// Dev only: draws a saved job's story frame by frame at 1920×1080 (the 1280×720 world scaled 1.5×),
// with the player's caption, for offline video export. Driven from a script through window.__render:
//   await __render.setup(clips, pick?)  // clips: { [sceneIndex]: { duration, words } } from /api/voice
//   __render.frame(t)            // → PNG data URL of the frame at time t
// ?id=<job id saved in dev-data>
import { useEffect, useRef, useState } from "react";
import { captionAt, timeLesson, type TimedLesson, type VoiceClip } from "@/lib/timing";
import type { CastMember, Lesson } from "@/lib/types";


export default function DevRender() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState("loading");
  const [S] = useState(() => (typeof location !== "undefined" && new URLSearchParams(location.search).get("scale") === "1" ? 1 : 1.5));
  useEffect(() => {
    const id = new URLSearchParams(location.search).get("id");
    let lesson: Lesson, cast: CastMember[], timed: TimedLesson;
    let m: typeof import("@/engine/browser");
    const ready = (async () => {
      const rec = await fetch(`/api/dev/jobs?id=${id}`).then((r) => r.json());
      lesson = rec.story.story; cast = rec.story.cast;
      m = await import("@/engine/browser");
      await m.loadEngine();
      await document.fonts.load("600 36px Inter");
      timed = timeLesson(lesson);
      setStatus("ready");
    })();
    const g = ref.current!.getContext("2d")!;
    // The engine resets the transform to identity for full-frame layers: keep the 1.5× base under it.
    // (React dev runs this effect twice: always wrap the context's original setTransform, once.)
    const gx = g as unknown as { __origSet?: CanvasRenderingContext2D["setTransform"] };
    gx.__origSet ??= g.setTransform.bind(g);
    const set = gx.__origSet as (a: number, b: number, c: number, d: number, e: number, f: number) => void;
    (g as unknown as { setTransform: unknown }).setTransform = (...a: unknown[]) => {
      if (a.length === 6) { const [p, q, r, s, t, u] = a as number[]; set(p * S, q * S, r * S, s * S, t * S, u * S); }
      else { const d = a[0] as DOMMatrix2DInit; set((d.a ?? 1) * S, (d.b ?? 0) * S, (d.c ?? 0) * S, (d.d ?? 1) * S, (d.e ?? 0) * S, (d.f ?? 0) * S); }
    };
    (g as unknown as { resetTransform: unknown }).resetTransform = () => set(S, 0, 0, S, 0, 0);
    // …and report transforms in world units, since the engine checks layout bounds with getTransform().
    const gg = g as unknown as { __origGet?: () => DOMMatrix; getTransform: () => DOMMatrix };
    gg.__origGet ??= g.getTransform.bind(g);
    gg.getTransform = () => { const m = gg.__origGet!(); return new DOMMatrix([m.a / S, m.b / S, m.c / S, m.d / S, m.e / S, m.f / S]); };
    const w = window as unknown as { __render: unknown };
    w.__render = {
      ready,
      // pick: optional scene indices for a shorter cut (the engine times and transitions the cut itself).
      async setup(clips: Record<number, Omit<VoiceClip, "url">>, pick?: number[]) {
        await ready;
        if (pick?.length) lesson = { ...lesson, scenes: pick.map((i) => lesson.scenes[i]) };
        const c: Record<number, VoiceClip> = {};
        for (const [k, v] of Object.entries(clips)) c[+k] = { url: "", ...v };
        timed = timeLesson(lesson, 1, c);
        return timed.scenes.map((s) => ({ id: s.id, recipe: s.recipe, start: s.start, end: s.end, speechStart: s.speechStart, speechEnd: s.speechEnd, fiction: !!s.fiction }));
      },
      frame(t: number) {
        g.resetTransform();
        m.drawFrame(g, lesson, timed, cast, t);
        // The player's caption (CanvasPlayer.module.css .caption): Inter 600, ink, centred near the bottom.
        let k = 0;
        for (let i = timed.scenes.length - 1; i >= 0; i--) if (t >= timed.scenes[i].start) { k = i; break; }
        const text = t > 0.05 ? captionAt(timed.scenes[k], t) : "";
        set(1, 0, 0, 1, 0, 0);
        g.globalAlpha = 1; g.filter = "none"; g.letterSpacing = "0px";
        if (text) {
          g.font = "600 36px Inter"; g.fillStyle = "#0d0f13"; g.textAlign = "center"; g.textBaseline = "alphabetic";
          const W = 1280 * S, H = 720 * S, fs = Math.round(24 * S);
          g.font = `600 ${fs}px Inter`;
          const words = text.split(/\s+/), maxW = W * 0.88, lines: string[] = [];
          let line = "";
          for (const wd of words) { const tryL = line ? line + " " + wd : wd; if (g.measureText(tryL).width > maxW && line) { lines.push(line); line = wd; } else line = tryL; }
          if (line) lines.push(line);
          // Balance two lines like text-wrap: balance.
          if (lines.length === 2) {
            let best = lines, bestD = Infinity;
            for (let i = 1; i < words.length; i++) {
              const a = words.slice(0, i).join(" "), b = words.slice(i).join(" ");
              const wa = g.measureText(a).width, wb = g.measureText(b).width;
              if (wa <= maxW && wb <= maxW && Math.abs(wa - wb) < bestD) { bestD = Math.abs(wa - wb); best = [a, b]; }
            }
            lines.splice(0, 2, ...best);
          }
          const lh = fs * 1.35, bottom = H * (1 - 0.032) - 7 * S;
          lines.forEach((l, i) => g.fillText(l, W / 2, bottom - (lines.length - 1 - i) * lh));
        }
        return ref.current!.toDataURL("image/png");
      },
    };
  }, [S]);
  return (
    <main style={{ margin: 0, padding: 0 }}>
      <canvas ref={ref} width={1280 * S} height={720 * S} style={{ display: "block", width: 960, height: 540, border: "1px solid #ccc" }} />
      <p id="status">{status}</p>
    </main>
  );
}
