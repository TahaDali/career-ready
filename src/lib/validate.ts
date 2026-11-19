// Server-side repair (docs/methodology/07 §1): the model's JSON is shape-checked by the schema; this
// fixes what a schema can't, so the engine never receives a scene it can't draw.
import type { Brief, CastMember, Lesson, Outline, Scene, StoryResult } from "./types";

const words = (s: string) => String(s || "").split(/\s+/).filter(Boolean);
const kebab = (s: string) => String(s || "scene").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "scene";
const clampIdx = (i: unknown, n: number) => (Number.isInteger(i) ? Math.max(0, Math.min(n - 1, i as number)) : 0);

function asStatement(s: Scene): Scene {
  const first = (s.narration.match(/[^.!?]+[.!?]?/) ?? [s.headline])[0].trim();
  const text = words(first).slice(0, 12).join(" ").replace(/[,;:]$/, "");
  const emphasis = words(text).map((w) => w.replace(/[^\w$%]/g, "")).sort((a, b) => b.length - a.length)[0] ?? "";
  return { ...s, recipe: "statement", data: { text, emphasis } };
}

function repairScene(s: Scene, castKeys: string[]): Scene {
  const d = s.data ?? {};
  const has = (a: unknown, n: number) => Array.isArray(a) && a.length >= n;
  switch (s.recipe) {
    case "opener": if (!d.title) return { ...s, data: { ...d, title: s.headline } }; return s;
    case "statement": if (!d.text) return asStatement(s); return s;
    case "org": if (!d.center || !has(d.around, 2)) return asStatement(s); return s;
    case "flow": if (!has(d.steps, 2)) return asStatement(s);
      return { ...s, data: { ...d, active: clampIdx(d.active, d.steps!.length) } };
    case "record": if (!has(d.rows, 1)) return asStatement(s); return s;
    case "cast": {
      const people = (d.people ?? []).filter((k) => castKeys.includes(k));
      if (!castKeys.length) return asStatement(s);
      const who = d.line?.who && castKeys.includes(d.line.who) ? d.line.who : people[0] ?? castKeys[0];
      return { ...s, data: { ...d, people: people.length ? people : [who], line: d.line ? { ...d.line, who } : undefined } };
    }
    case "compare": if (!d.left || !d.right || !has(d.left.rows, 1) || !has(d.right.rows, 1)) return asStatement(s); return s;
    case "stepper": if (!has(d.steps, 2)) return asStatement(s); return s;
    case "question": if (!has(d.options, 2) || !d.prompt) return asStatement(s);
      return { ...s, data: { ...d, correct: clampIdx(d.correct, d.options!.length) } };
  }
  return asStatement(s);
}

export function repairLesson(lin: Lesson, id: string, cast: CastMember[]): Lesson {
  const RECIPE_NAMES = ["opener", "statement", "org", "flow", "record", "cast", "compare", "stepper", "question"];
  const l: Lesson = { ...lin, title: str(lin?.title, `Lesson ${id}`), goal: str(lin?.goal), part: str(lin?.part),
    question: str(lin?.question, "Which statement best fits this lesson?"), explanation: str(lin?.explanation),
    options: arr<string>(lin?.options).map((o) => String(o)), optionFeedback: arr<string>(lin?.optionFeedback).map((o) => String(o ?? "")),
    keyTerms: arr<{ term: string; definition: string }>(lin?.keyTerms).filter((k) => k?.term),
    extraQuestions: arr(lin?.extraQuestions),
    scenes: arr<Scene>(lin?.scenes).filter((s) => s && typeof s === "object").map((s) => ({
      ...s, narration: str(s.narration), headline: str(s.headline), fiction: s.fiction === true,
      recipe: (RECIPE_NAMES.includes(s.recipe) ? s.recipe : "statement") as Scene["recipe"],
      data: s.data && typeof s.data === "object" ? s.data : {} })) };
  const keys = cast.map((c) => c.key);
  const seen = new Set<string>();
  const scenes = (l.scenes ?? []).filter((s) => s && s.narration && words(s.narration).length >= 3).map((s) => {
    let sid = kebab(s.id || s.headline);
    while (seen.has(sid)) sid += "-2";
    seen.add(sid);
    return repairScene({ ...s, id: sid, headline: words(s.headline || sid).slice(0, 7).join(" ") }, keys);
  });
  if (!scenes.length) throw new Error("The model returned a lesson with no scenes. Please try again.");
  if (scenes[0].recipe !== "opener") {
    scenes.unshift({ id: "open", headline: l.title, narration: l.goal || l.title, fiction: false, recipe: "opener",
      data: { kicker: `Lesson ${id}`, title: l.title, subtitle: words(l.goal).slice(0, 8).join(" "), glyph: "doc" } });
  }
  const options = (l.options ?? []).filter(Boolean);
  while (options.length < 2) options.push("None of these");
  const fb = (l.optionFeedback ?? []).slice(0, options.length);
  while (fb.length < options.length) fb.push("");
  return {
    ...l, id, scenes, options, optionFeedback: fb, answer: clampIdx(l.answer, options.length),
    part: l.part || "Part I · The organization",
    extraQuestions: (l.extraQuestions ?? []).filter((q) => q?.options?.length >= 2).slice(0, 2).map((q) => ({
      ...q, answer: clampIdx(q.answer, q.options.length),
      optionFeedback: q.options.map((_, i) => q.optionFeedback?.[i] ?? ""),
    })),
    keyTerms: (l.keyTerms ?? []).slice(0, 6),
  };
}

// Every brief field the pages read, with a safe default (an answer can arrive incomplete).
const str = (x: unknown, d = "") => (typeof x === "string" ? x : d);
const arr = <T,>(x: unknown): T[] => (Array.isArray(x) ? (x as T[]) : []);
function coerceBrief(b: Partial<Brief> | undefined): Brief {
  const items = (x: unknown, p: string) => arr<{ id?: string; text?: string } | string>(x).map((it, i) =>
    typeof it === "string" ? { id: `${p}${i + 1}`, text: it } : { id: str(it?.id, `${p}${i + 1}`), text: str(it?.text) }).filter((it) => it.text);
  return {
    employer: str(b?.employer, "The employer"), title: str(b?.title, "The role"), location: str(b?.location), seniority: str(b?.seniority),
    oneLiner: str(b?.oneLiner),
    orgContext: arr<{ text?: string; basis?: string }>(b?.orgContext).map((o) => ({ text: str(o?.text), basis: (o?.basis === "general-knowledge" ? "general-knowledge" : "posting") as "posting" | "general-knowledge" })).filter((o) => o.text),
    responsibilities: items(b?.responsibilities, "R"), required: items(b?.required, "Q"), preferred: items(b?.preferred, "P"),
    keywords: arr<string>(b?.keywords).filter((k) => typeof k === "string"),
    interviewQuestions: arr<{ question?: string; strongAnswerHas?: string[] }>(b?.interviewQuestions).map((q) => ({ question: str(q?.question), strongAnswerHas: arr<string>(q?.strongAnswerHas) })).filter((q) => q.question),
    unknowns: arr<string>(b?.unknowns).filter((u) => typeof u === "string"),
  };
}

export function repairStory(raw: StoryResult): StoryResult {
  const r = { brief: coerceBrief(raw?.brief), cast: arr<CastMember>(raw?.cast).filter((c) => c && typeof c === "object"), story: raw?.story ?? ({} as Lesson) };
  if (!arr(r.story.scenes).length) throw new Error("Claude's story came back without scenes. Please try again.");
  r.story = { ...r.story, title: str(r.story.title, r.brief.title), goal: str(r.story.goal, r.brief.oneLiner) };
  const seen = new Set<string>();
  const cast = (r.cast ?? []).slice(0, 3).map((c, i) => {
    let key = String(c.key || c.name || `p${i}`).toLowerCase().replace(/[^a-z]/g, "") || `p${i}`;
    while (seen.has(key)) key += "x";
    seen.add(key);
    return { ...c, key };
  });
  // Map scene references written with the original keys or names to the cleaned keys.
  const alias = new Map<string, string>();
  (r.cast ?? []).forEach((c, i) => { if (cast[i]) { alias.set(c.key, cast[i].key); if (c.name) alias.set(c.name, cast[i].key); } });
  const story = { ...r.story, scenes: arr<Scene>(r.story.scenes).map((s) => s.recipe !== "cast" ? s : ({ ...s, data: { ...s.data,
    people: arr<string>(s.data?.people).map((k) => alias.get(k) ?? k),
    line: s.data?.line ? { ...s.data.line, who: alias.get(s.data.line.who) ?? s.data.line.who } : undefined } })) };
  return { brief: r.brief, cast, story: repairLesson({ ...story, keyTerms: story.keyTerms ?? [] }, "00", cast) };
}

export function repairOutline(o: Outline): Outline {
  const lessons = arr<Outline["lessons"][number]>(o?.lessons).filter((l) => l && typeof l === "object").map((l) => ({ ...l, title: str(l.title, "Lesson"), goal: str(l.goal), part: str(l.part, "Part I · The organization"), requirementIds: arr<string>(l.requirementIds) })).slice(0, 10).map((l, i) => ({ ...l, id: String(i + 1).padStart(2, "0") }));
  if (lessons.length < 3) throw new Error("The course outline came back too short. Please try again.");
  return { title: str(o?.title, "Your course"), tagline: str(o?.tagline), exclusions: arr(o?.exclusions), lessons };
}
