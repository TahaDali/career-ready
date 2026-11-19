"use client";
import { useMemo, useState } from "react";
import CanvasPlayer from "@/components/CanvasPlayer";
import { SAMPLE } from "@/lib/sample";
import { timeLesson } from "@/lib/timing";

export default function DevEngine() {
  const [t, setT] = useState<number | null>(null);
  const timed = useMemo(() => timeLesson(SAMPLE.story), []);
  return (
    <main className="wrap" style={{ padding: "32px 0" }}>
      <p className="kicker">Dev · engine test</p>
      <h1 style={{ margin: "8px 0 20px" }}>{SAMPLE.story.title}</h1>
      <CanvasPlayer lesson={SAMPLE.story} cast={SAMPLE.cast} freezeAt={t} />
      <input id="scrub" type="range" min={0} max={timed.duration} step={0.05} value={t ?? 0} style={{ width: "100%", marginTop: 16 }}
        onChange={(e) => setT(Number(e.target.value))} />
      <p className="kicker">t = {t?.toFixed(2)} · scenes: {timed.scenes.map((s) => `${s.id} ${s.start.toFixed(1)}–${s.end.toFixed(1)}`).join(" · ")}</p>
    </main>
  );
}
