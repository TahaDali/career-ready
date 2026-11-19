"use client";
// Dev only: a contact sheet of one lesson. For every scene it draws the frame just before the scene
// ends (and a mid-scene frame with ?mid=1), plus a content lint (word budgets, label lengths).
// ?lesson=00 (the one-minute story) … 10
import { useEffect, useRef, useState } from "react";
import { SAMPLE } from "@/lib/sample";
import { SAMPLE_LESSONS } from "@/lib/sample-course";
import { timeLesson, wordCount } from "@/lib/timing";
import type { Lesson, Scene } from "@/lib/types";

const MIN: Record<string, number> = { opener: 12, statement: 9, org: 16, flow: 16, record: 14, cast: 12, compare: 16, stepper: 14, question: 14 };
const wc = (s?: string) => (s ? wordCount(s) : 0);

function lint(l: Lesson): string[] {
  const out: string[] = [], total = l.scenes.reduce((n, s) => n + wc(s.narration), 0), story = l.id === "00";
  const [lo, hi] = story ? [120, 170] : [220, 320], [smin, smax] = story ? [6, 7] : [8, 12];
  if (total < lo || total > hi) out.push(`total words ${total} (want ${lo}–${hi})`);
  if (l.scenes.length < smin || l.scenes.length > smax) out.push(`${l.scenes.length} scenes (want ${smin}–${smax})`);
  const recipes = new Set(l.scenes.map((s) => s.recipe));
  if (recipes.size < 4) out.push(`only ${recipes.size} recipes`);
  let fic = false;
  l.scenes.forEach((s: Scene) => {
    const d = s.data, n = wc(s.narration), id = s.id;
    if (n < MIN[s.recipe]) out.push(`${id}: ${n} words < ${MIN[s.recipe]}`);
    if (wc(s.headline) > 6) out.push(`${id}: headline > 6 words`);
    if (s.fiction && !fic) { fic = true; if (!/fictional/i.test(s.narration)) out.push(`${id}: first fiction scene lacks "fictional"`); }
    if (s.recipe === "cast" && !s.fiction) out.push(`${id}: cast scene not fiction`);
    const lab = (x: string | undefined, max: number, what: string) => { if (x && wc(x) > max) out.push(`${id}: ${what} "${x}" > ${max} words`); };
    d.around?.forEach((a) => { lab(a.label, 4, "label"); lab(a.relation, 4, "relation"); });
    d.steps?.forEach((st) => lab(st.label, s.recipe === "flow" ? 3 : 6, "step"));
    d.rows?.forEach((r) => { lab(r.field, 4, "field"); lab(r.value, 3, "value"); });
    d.left?.rows.forEach((r) => lab(r, 4, "row")); d.right?.rows.forEach((r) => lab(r, 4, "row"));
    d.options?.forEach((o) => lab(o, 4, "option"));
    lab(d.text, 14, "text"); lab(d.prompt, 12, "prompt"); lab(d.reason, 12, "reason"); lab(d.line?.text, 12, "line"); lab(d.takeaway, 12, "takeaway");
    const emph = d.emphasis;
    if (emph && !new RegExp(`\\b${emph}\\b`).test(s.narration)) out.push(`${id}: emphasis "${emph}" not in narration`);
    if (s.recipe === "question") { const q = wc(d.prompt) + (d.options || []).reduce((n, o) => n + wc(o), 0) + wc(d.reason); if (q > 24) out.push(`${id}: question ${q} words on screen`); }
    if (s.recipe === "cast" && d.line && !s.narration.includes(d.line.text.replace(/[.?!]$/, ""))) out.push(`${id}: line not spoken verbatim`);
  });
  return out;
}

export default function Sheet() {
  const ref = useRef<HTMLDivElement>(null);
  const [info, setInfo] = useState("Drawing…");
  useEffect(() => {
    (async () => {
      const q = new URLSearchParams(location.search), lid = q.get("lesson") || "00", mid = q.get("mid") === "1";
      const lesson: Lesson = lid === "00" ? SAMPLE.story : SAMPLE_LESSONS[lid];
      const m = await import("@/engine/browser");
      await m.loadEngine();
      const timed = timeLesson(lesson), big = document.createElement("canvas");
      big.width = 1280; big.height = 720;
      const g = big.getContext("2d")!, root = ref.current!;
      root.innerHTML = "";
      const words = lesson.scenes.reduce((n, s) => n + wc(s.narration), 0);
      timed.scenes.forEach((s, i) => {
        const times = mid ? [(s.start + s.end) / 2, s.end - 0.7] : [s.end - 0.7];
        for (const t of times) {
          m.drawFrame(g, lesson, timed, SAMPLE.cast, t);
          const fig = document.createElement("figure"), c = document.createElement("canvas");
          c.width = 640; c.height = 360; c.getContext("2d")!.drawImage(big, 0, 0, 640, 360);
          fig.style.margin = "0";
          const cap = document.createElement("figcaption");
          cap.style.font = "11px/1.35 var(--mono, monospace)";
          cap.textContent = `${String(i + 1).padStart(2, "0")} ${s.id} · ${s.recipe} · t=${t.toFixed(1)} · ${wc(s.narration)}w${s.fiction ? " · fiction" : ""}`;
          fig.append(c, cap); root.append(fig);
        }
      });
      const issues = lint(lesson);
      setInfo(`${lesson.id} · ${lesson.title} · ${lesson.scenes.length} scenes · ${words} words · ${timed.duration.toFixed(0)} s · recipes: ${lesson.scenes.map((s) => s.recipe).join(" → ")}\nlint: ${issues.length ? issues.join(" | ") : "clean"}`);
    })().catch((e) => setInfo("Failed: " + (e?.stack || e)));
  }, []);
  return (
    <main style={{ padding: 12 }}>
      <pre id="info" style={{ font: "12px/1.4 monospace", whiteSpace: "pre-wrap", margin: "0 0 8px" }}>{info}</pre>
      <div ref={ref} style={{ display: "grid", gridTemplateColumns: "repeat(2, 640px)", gap: "6px 8px" }} />
    </main>
  );
}
