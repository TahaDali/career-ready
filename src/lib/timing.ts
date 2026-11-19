// Estimated timing for a lesson (docs/methodology/05 §2): each scene lasts its spoken words at
// 2.5 words/s × speed, at least the recipe's minimum, plus a 0.6 s pause; a question holds 3 s more
// for the answer. The speech clock in the player then holds or speeds up to match the real voice.
import type { Lesson, Scene } from "./types";

export const WORDS_PER_SECOND = 2.5;
const MIN_SPAN: Record<string, number> = {
  opener: 5, statement: 3.5, org: 6, flow: 6, record: 6, cast: 5, compare: 6.5, stepper: 5.5, question: 6,
};

export interface TimedScene extends Scene {
  start: number; end: number; speechStart: number; speechEnd: number;
}
export interface TimedLesson extends Omit<Lesson, "scenes"> {
  scenes: TimedScene[];
  duration: number;
}

export const wordCount = (s: string) => s.split(/\s+/).filter(Boolean).length;

export function timeLesson(lesson: Lesson, speed = 1): TimedLesson {
  let t = 0;
  const scenes = lesson.scenes.map((s) => {
    const speak = wordCount(s.narration) / (WORDS_PER_SECOND * speed);
    const extra = s.recipe === "question" ? 3 : 0;
    const span = Math.max(MIN_SPAN[s.recipe] ?? 4, speak + 0.6) + extra;
    const scene: TimedScene = {
      ...s, start: t, end: t + span, speechStart: t + 0.25, speechEnd: t + 0.25 + speak,
    };
    t += span;
    return scene;
  });
  return { ...lesson, scenes, duration: t };
}

// The sentence of a scene being spoken at time t (estimated), for captions.
export function captionAt(scene: TimedScene, t: number): string {
  const sentences = scene.narration.match(/[^.!?]+[.!?]+["”’)]*|[^.!?]+$/g) ?? [scene.narration];
  const total = wordCount(scene.narration) || 1;
  const p = (t - scene.speechStart) / Math.max(0.1, scene.speechEnd - scene.speechStart);
  let acc = 0;
  for (const s of sentences) {
    acc += wordCount(s);
    if (p <= acc / total) return s.trim();
  }
  return sentences[sentences.length - 1].trim();
}
