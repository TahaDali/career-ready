"use client";
// Dev only: stores a fake 10-lesson course built from the sample lesson, to test the course page UI.
import Link from "next/link";
import { useEffect, useState } from "react";
import { SAMPLE } from "@/lib/sample";
import { saveJob } from "@/lib/store";

export default function Fixture() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const parts = ["Part I · The organization", "Part I · The organization", "Part II · The work", "Part II · The work", "Part III · The role", "Part III · The role", "Part IV · Getting hired", "Part IV · Getting hired", "Part V · The first 90 days", "Part V · The first 90 days"];
    const lessons = parts.map((part, i) => ({ id: String(i + 1).padStart(2, "0"), part, title: `Sample lesson ${i + 1}`, goal: "A UI fixture.", requirementIds: [] }));
    const written = Object.fromEntries(lessons.slice(0, 4).map((l) => [l.id, { ...SAMPLE.story, id: l.id, part: l.part, title: l.title }]));
    saveJob({ id: "fixture", createdAt: Date.now(), job: { text: "fixture", source: "pasted" }, story: SAMPLE,
      outline: { title: "Becoming a Patient Access Coordinator", tagline: "From the front desk to the whole hospital.", lessons, exclusions: [] }, lessons: written });
    setOk(true);
  }, []);
  return <main className="shell" style={{ padding: 40 }}>{ok ? <Link href="/job/fixture/course">Open fixture course</Link> : "…"}</main>;
}
