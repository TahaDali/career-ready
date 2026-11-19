import { generate } from "@/lib/ai";
import { storySystem, storyUser } from "@/lib/prompts";
import { fail, keyFrom } from "@/lib/route-helpers";
import { StorySchema } from "@/lib/schemas";
import { repairStory } from "@/lib/validate";
import type { StoryResult } from "@/lib/types";

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { key, provider, model } = keyFrom(req);
    const { job } = await req.json();
    if (!job?.text) throw new Error("No job text to read.");
    const t0 = Date.now();
    const raw = await generate({ provider, key, model, system: storySystem(), user: storyUser(job), schema: StorySchema, maxTokens: 16000, effort: "low" });
    const story = repairStory(raw as unknown as StoryResult);
    return Response.json({ story, ms: Date.now() - t0 });
  } catch (e) { return fail(e); }
}
