import { generate } from "@/lib/ai";
import { lessonSystem, lessonUser } from "@/lib/prompts";
import { fail, keyFrom } from "@/lib/route-helpers";
import { LessonSchema } from "@/lib/schemas";
import { repairLesson } from "@/lib/validate";
import type { Lesson } from "@/lib/types";

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { key, provider, model } = keyFrom(req);
    const { job, brief, cast, outline, id } = await req.json();
    const raw = await generate({ provider, key, model, system: lessonSystem(), user: lessonUser(job, brief, cast, outline, id), schema: LessonSchema, maxTokens: 16000, effort: "low" });
    return Response.json({ lesson: repairLesson(raw as unknown as Lesson, id, cast) });
  } catch (e) { return fail(e); }
}
