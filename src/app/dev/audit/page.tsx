"use client";
// Dev only: steps through a lesson frame by frame and reports layout faults from the engine's own
// registry: overlapping labels, labels over objects they don't belong to, objects cut by the frame,
// and the stage's failed checks (type floors, edge guard, word budget). ?id=<job id>&lesson=00
import { useEffect, useState } from "react";
import { SAMPLE } from "@/lib/sample";
import { SAMPLE_LESSONS } from "@/lib/sample-course";
import { timeLesson } from "@/lib/timing";
import type { CastMember, Lesson } from "@/lib/types";

type Box = { x: number; y: number; w: number; h: number };
type Item = { id: string; kind: string; owner: string | null; bounds: Box; alpha: number };
const VIEW = { x: 32, y: 80, w: 1216, h: 515 };
const inter = (a: Box, b: Box) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));

export default function Audit() {
  const [out, setOut] = useState<string>("Running…");
  useEffect(() => {
    (async () => {
      const q = new URLSearchParams(location.search), id = q.get("id"), lid = q.get("lesson") || "00";
      let lesson: Lesson = SAMPLE.story, cast: CastMember[] = SAMPLE.cast;
      if (!id && lid !== "00") lesson = SAMPLE_LESSONS[lid];
      if (id) {
        const rec = await (await fetch(`/api/dev/jobs?id=${id}`)).json();
        cast = rec.story.cast; lesson = lid === "00" ? rec.story.story : rec.lessons[lid];
      }
      const m = await import("@/engine/browser");
      await m.loadEngine();
      const c = document.createElement("canvas"); c.width = 1280; c.height = 720;
      const g = c.getContext("2d")!;
      const timed = timeLesson(lesson);
      const found = new Map<string, { scene: string; recipe: string; kind: string; what: string; first: number; n: number }>();
      const add = (scene: string, recipe: string, kind: string, what: string, t: number) => {
        const k = `${scene}|${kind}|${what}`, f = found.get(k);
        if (f) f.n++; else found.set(k, { scene, recipe, kind, what, first: +t.toFixed(2), n: 1 });
      };
      for (let t = 0.05; t < timed.duration; t += 0.2) {
        const si = timed.scenes.findLastIndex((s) => t >= s.start), sc = timed.scenes[Math.max(0, si)];
        const res = m.drawFrame(g, lesson, timed, cast, t) as { items: Item[]; transition: boolean; invariants: { checks: { id: string; passed: boolean; actual: unknown }[] } };
        if (res.transition) continue;
        for (const ch of res.invariants.checks) if (!ch.passed) add(sc.id, sc.recipe, "check", `${ch.id} (${String(ch.actual)})`, t);
        const vis = res.items.filter((i) => i.alpha > 0.5 && i.bounds.w > 2 && i.bounds.h > 2);
        const labels = vis.filter((i) => i.kind === "label");
        // Ownership chains (a word owned by a highlighter band owned by a card belongs to the card).
        const byId = new Map(res.items.map((i) => [i.id, i]));
        const chain = (x: Item) => { const out = new Set<string>([x.id]); let o = x.owner; for (let k = 0; o && k < 6; k++) { out.add(o); o = byId.get(o)?.owner ?? null; } return out; };
        // Parts of the same numbered card (fl-c4, fl-g4, fl-g4-s, fl-n4) belong together.
        const slot = (id: string) => { const m = /^([a-z]+)-[a-z]+(\d+)/.exec(id); return m ? m[1] + m[2] : null; };
        const related = (a: Item, b: Item) => { const ca = chain(a), cb = chain(b); return ca.has(b.id) || cb.has(a.id) || [...ca].some((x) => x !== a.id && cb.has(x)) ||
          a.id.startsWith(b.id + "-") || b.id.startsWith(a.id + "-") || (slot(a.id) !== null && slot(a.id) === slot(b.id)); };
        for (let i = 0; i < labels.length; i++) for (let j = i + 1; j < labels.length; j++) {
          const a = labels[i], b = labels[j], o = inter(a.bounds, b.bounds);
          if (o > 0.15 * Math.min(a.bounds.w * a.bounds.h, b.bounds.w * b.bounds.h) && !related(a, b)) add(sc.id, sc.recipe, "label overlap", `${a.id} × ${b.id}`, t);
        }
        for (const a of labels) for (const b of vis) {
          if (b.kind !== "actor" || related(a, b)) continue;
          const o = inter(a.bounds, b.bounds);
          if (o > 0.25 * a.bounds.w * a.bounds.h) add(sc.id, sc.recipe, "label over object", `${a.id} on ${b.id}`, t);
        }
        for (const a of vis) {
          const b = a.bounds, cut = b.x < VIEW.x - 4 || b.y < VIEW.y - 4 || b.x + b.w > VIEW.x + VIEW.w + 4 || b.y + b.h > VIEW.y + VIEW.h + 4;
          if (cut) add(sc.id, sc.recipe, "cut by frame", `${a.id} [${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.w)}×${Math.round(b.h)}]`, t);
        }
      }
      const rows = [...found.values()].sort((a, b) => a.first - b.first);
      (window as unknown as { __audit: unknown }).__audit = rows;
      setOut(`${lesson.title} · ${timed.scenes.length} scenes · ${rows.length} findings\n\n` + rows.map((r) => `${r.first.toFixed(1).padStart(5)}s  ${r.scene.padEnd(14)} ${r.recipe.padEnd(9)} ${r.kind.padEnd(18)} ×${String(r.n).padEnd(4)} ${r.what}`).join("\n"));
    })().catch((e) => setOut("Failed: " + (e?.stack || e)));
  }, []);
  return <main className="shell" style={{ padding: "24px 0" }}><p className="kicker">Dev · layout audit</p><pre style={{ font: "12px/1.5 var(--mono)", whiteSpace: "pre-wrap" }}>{out}</pre></main>;
}
