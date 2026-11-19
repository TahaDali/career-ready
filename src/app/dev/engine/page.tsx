"use client";
// Dev only: draw any lesson at a chosen time. ?id=<job id saved in dev-data>&lesson=00
import { useEffect, useMemo, useState } from "react";
import CanvasPlayer from "@/components/CanvasPlayer";
import { SAMPLE } from "@/lib/sample";
import { SAMPLE_LESSONS } from "@/lib/sample-course";
import { timeLesson } from "@/lib/timing";
import type { CastMember, Lesson } from "@/lib/types";

export default function DevEngine() {
  const [t, setT] = useState<number | null>(null);
  const [data, setData] = useState<{ lesson: Lesson; cast: CastMember[] }>({ lesson: SAMPLE.story, cast: SAMPLE.cast });
  useEffect(() => {
    const q = new URLSearchParams(location.search), id = q.get("id"), lid = q.get("lesson") || "00";
    if (q.get("t")) setT(Number(q.get("t")));
    if (!id && lid !== "00") setData({ lesson: SAMPLE_LESSONS[lid], cast: SAMPLE.cast });
    if (id) fetch(`/api/dev/jobs?id=${id}`).then((r) => r.json()).then((rec) => setData({ cast: rec.story.cast, lesson: lid === "00" ? rec.story.story : rec.lessons[lid] }));
  }, []);
  const timed = useMemo(() => timeLesson(data.lesson), [data]);
  return (
    <main className="wrap" style={{ padding: "32px 0" }}>
      <p className="kicker">Dev · engine test</p>
      <h1 style={{ margin: "8px 0 20px" }}>{data.lesson.title}</h1>
      <CanvasPlayer lesson={data.lesson} cast={data.cast} freezeAt={t} />
      <input id="scrub" type="range" min={0} max={timed.duration} step={0.05} value={t ?? 0} style={{ width: "100%", marginTop: 16 }}
        onChange={(e) => setT(Number(e.target.value))} />
      <p className="kicker" id="scenes">t = {t?.toFixed(2)} · scenes: {timed.scenes.map((s) => `${s.id}/${s.recipe} ${s.start.toFixed(1)}–${s.end.toFixed(1)}`).join(" · ")}</p>
    </main>
  );
}
