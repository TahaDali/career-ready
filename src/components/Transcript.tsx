"use client";
import { timeLesson } from "@/lib/timing";
import type { Lesson } from "@/lib/types";

export default function Transcript({ lesson, current, onJump }: { lesson: Lesson; current: number; onJump: (i: number) => void }) {
  const timed = timeLesson(lesson);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  return (
    <div id="transcript">
      {timed.scenes.map((s, i) => (
        <button key={s.id} onClick={() => onJump(i)} aria-current={i === current ? "true" : undefined}
          style={i === current ? { background: "var(--signal-soft)" } : undefined}>
          <span className="scene-time">{fmt(s.start)}</span>
          <span className="scene-body">
            <strong>{s.headline}{s.fiction && <> <span className="tag fiction">Fictional example</span></>}</strong>
            <span className="scene-copy">{s.narration}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
