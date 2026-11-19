// The data contract (docs/ARCHITECTURE.md §4) as zod schemas. They double as the structured-output
// schemas sent to Claude / ChatGPT, so field descriptions are written for the model.
import { z } from "zod";

export const GLYPHS = [
  "doc", "folder", "card", "building", "campus", "hall", "clock", "calendar", "gate", "magnifier", "lock",
  "envelope", "megaphone", "bubble", "pin", "ballot", "table", "sheet", "form", "coin", "idCard", "person",
  "phonePost", "poster", "ai",
] as const;
export const RECIPES = ["opener", "statement", "org", "flow", "record", "cast", "compare", "stepper", "question"] as const;

// Plain strings (not enums): repeated enums made the structured-output grammar too large. The engine
// checks every value and falls back to a default, so an unknown value can't break a scene.
const Glyph = z.string().describe(`one of: ${GLYPHS.join(", ")}`);
const Label = z.string().describe("At most 4 words; should appear in this scene's narration");
const Step = z.object({ label: z.string(), glyph: Glyph });

// One schema per recipe, every field required: Claude's structured outputs allow only 24 optional
// parameters per request, so the scene is a union on `recipe` instead of one object of optionals.
const base = {
  id: z.string().describe("kebab-case, unique in the lesson"),
  headline: z.string().describe("≤ 6 words"),
  narration: z.string(),
  fiction: z.boolean(),
};
const scene = <R extends string, D extends z.ZodRawShape>(recipe: R, data: D) =>
  z.object({ ...base, recipe: z.literal(recipe), data: z.object(data) });

export const SceneSchema = z.discriminatedUnion("recipe", [
  scene("opener", { kicker: z.string(), title: z.string().describe("≤ 7 words"), subtitle: z.string().describe("≤ 8 words; last two words get the highlighter"), glyph: Glyph }),
  scene("statement", { text: z.string().describe("one sentence ≤ 14 words, also spoken"), emphasis: z.string().describe("one word of text") }),
  scene("org", { center: z.object({ label: Label, glyph: Glyph }), around: z.array(z.object({ label: Label, relation: z.string().describe("≤ 4 words"), glyph: Glyph })).describe("3–5 stakeholders") }),
  scene("flow", { steps: z.array(Step).describe("3–5 steps, labels ≤ 3 words"), active: z.number().int().describe("0-based index of the step where this role sits") }),
  scene("record", { header: z.string(), title: z.string().describe("≤ 6 words"), rows: z.array(z.object({ field: z.string(), value: z.string().describe("≤ 3 words") })).describe("2–4 rows"), state: z.string().describe("proposed | confirmed | decided") }),
  scene("cast", { people: z.array(z.string()).describe("1–3 cast keys"), line: z.object({ who: z.string().describe("cast key"), text: z.string().describe("≤ 12 words, also spoken") }) }),
  scene("compare", { title: z.string(), left: z.object({ title: z.string(), rows: z.array(z.string()) }).describe("the weaker approach, 2–3 rows ≤ 4 words"), right: z.object({ title: z.string(), rows: z.array(z.string()) }).describe("the stronger approach, 2–3 rows ≤ 4 words"), takeaway: z.string().describe("≤ 12 words") }),
  scene("stepper", { title: z.string(), steps: z.array(Step).describe("3–5 steps, labels ≤ 6 words") }),
  scene("question", { prompt: z.string().describe("≤ 16 words"), options: z.array(z.string()).describe("3 options ≤ 6 words"), correct: z.number().int().describe("0-based"), reason: z.string().describe("≤ 14 words") }),
]);

const Question = z.object({
  question: z.string(),
  options: z.array(z.string()).describe("4 options"),
  answer: z.number().int().describe("0-based index of the correct option"),
  explanation: z.string(),
  optionFeedback: z.array(z.string()).describe("one line per option: why it is right or wrong"),
});

export const LessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  part: z.string().describe("e.g. 'Part I · The organization'"),
  goal: z.string(),
  scenes: z.array(SceneSchema),
  ...Question.shape,
  extraQuestions: z.array(Question).describe("0–2 more questions"),
  keyTerms: z.array(z.object({ term: z.string(), definition: z.string() })),
});

const Basis = z.enum(["posting", "general-knowledge"]);
export const BriefSchema = z.object({
  employer: z.string(),
  title: z.string(),
  location: z.string().describe("empty if unknown"),
  seniority: z.string().describe("empty if unknown"),
  oneLiner: z.string(),
  orgContext: z.array(z.object({ text: z.string(), basis: Basis })),
  responsibilities: z.array(z.object({ id: z.string(), text: z.string() })),
  required: z.array(z.object({ id: z.string(), text: z.string() })),
  preferred: z.array(z.object({ id: z.string(), text: z.string() })),
  keywords: z.array(z.string()),
  interviewQuestions: z.array(z.object({ question: z.string(), strongAnswerHas: z.array(z.string()) })),
  unknowns: z.array(z.string()),
});

export const CastSchema = z.object({
  key: z.string().describe("lowercase letters only, e.g. 'maya'"),
  name: z.string().nullable(),
  role: z.string().nullable(),
  skin: z.string().describe("skin1 | skin2 | skin3 | skin4 | skin5"),
  hair: z.string().describe("hairBlack | hairDark | hairBrown | hairAuburn | hairSand | hairGrey"),
  style: z.string().describe("short | side | crop | wavy | curly | puff | bun | bob | long | ponytail | bald"),
  top: z.string().describe("blazer | shirt | sweater | cardigan | tee"),
  topColor: z.string().describe("charcoal | navy | slate | denim | sage | olive | sand | stone | oat"),
  bottom: z.string().describe("charcoal | navy | slate | denim | sand | stone"),
  lower: z.string().describe("trousers | skirt"),
  glasses: z.boolean(),
});

export const StorySchema = z.object({ brief: BriefSchema, cast: z.array(CastSchema), story: LessonSchema });

export const OutlineSchema = z.object({
  title: z.string(),
  tagline: z.string(),
  lessons: z.array(z.object({
    id: z.string().describe("'01'…'10'"),
    part: z.string(),
    title: z.string(),
    goal: z.string(),
    requirementIds: z.array(z.string()),
  })),
  exclusions: z.array(z.object({ requirementId: z.string(), reason: z.string() })),
});

// App-side types: one loose `data` shape, because recipes and repairs read fields defensively.
export type Recipe = (typeof RECIPES)[number];
export interface SceneData {
  kicker?: string; title?: string; subtitle?: string; glyph?: string; text?: string; emphasis?: string;
  center?: { label: string; glyph: string }; around?: { label: string; relation: string; glyph: string }[];
  steps?: { label: string; glyph: string }[]; active?: number; header?: string; rows?: { field: string; value: string }[];
  state?: "proposed" | "confirmed" | "decided"; people?: string[]; line?: { who: string; text: string }; prop?: string;
  left?: { title: string; rows: string[] }; right?: { title: string; rows: string[] }; takeaway?: string;
  prompt?: string; options?: string[]; correct?: number; reason?: string;
}
export interface Scene { id: string; headline: string; narration: string; fiction: boolean; recipe: Recipe; data: SceneData }
type Q = z.infer<typeof Question>;
export interface Lesson extends Q {
  id: string; title: string; part: string; goal: string; scenes: Scene[];
  extraQuestions?: Q[]; keyTerms: { term: string; definition: string }[];
}
export type Brief = Omit<z.infer<typeof BriefSchema>, "location" | "seniority"> & { location?: string; seniority?: string };
export type CastMember = z.infer<typeof CastSchema>;
export interface StoryResult { brief: Brief; cast: CastMember[]; story: Lesson }
export type Outline = z.infer<typeof OutlineSchema>;
