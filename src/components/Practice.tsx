"use client";
// Practice question as an accessible radio group (ported behaviour of the AI Fellow page): arrow keys
// move and select, every option has its own feedback, the choice is saved per lesson.
import { useEffect, useRef, useState } from "react";

export interface Q { question: string; options: string[]; answer: number; explanation: string; optionFeedback: string[] }

export default function Practice({ q, saved, onAnswer, label = "Pause and apply" }: { q: Q; saved?: number; onAnswer?: (i: number) => void; label?: string }) {
  const [pick, setPick] = useState<number | undefined>(saved);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => setPick(saved), [saved, q]);
  const choose = (i: number) => { setPick(i); onAnswer?.(i); };
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = q.options.length;
    if (["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(e.key)) {
      e.preventDefault();
      const j = (i + (e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : n - 1)) % n;
      refs.current[j]?.focus(); choose(j);
    }
  };
  const id = useRef(`q${Math.random().toString(36).slice(2, 7)}`).current;
  const right = pick === q.answer;
  return (
    <div className="practice">
      <p className="eyebrow" style={{ marginBottom: 10 }}>{label}</p>
      <h3 id={id} className="practice-q">{q.question}</h3>
      <div role="radiogroup" aria-labelledby={id} className="answers">
        {q.options.map((o, i) => (
          <button key={i} ref={(el) => { refs.current[i] = el; }} role="radio" aria-checked={pick === i}
            tabIndex={pick === undefined ? (i === 0 ? 0 : -1) : pick === i ? 0 : -1}
            onClick={() => choose(i)} onKeyDown={(e) => onKey(e, i)}>{o}</button>
        ))}
      </div>
      <p className="feedback" role="status" aria-live="polite" aria-atomic="true">
        {pick !== undefined && (
          <>
            <strong style={{ color: right ? "var(--good)" : "var(--wrong)" }}>{right ? "Right. " : "Not quite. "}</strong>
            {q.optionFeedback[pick] || (right ? q.explanation : "")}
            {!right && <> <span>{q.explanation}</span></>}
          </>
        )}
      </p>
    </div>
  );
}
