import { generate } from "@/lib/ai";
import { outlineSystem, outlineUser } from "@/lib/prompts";
import { fail, keyFrom } from "@/lib/route-helpers";
import { OutlineSchema } from "@/lib/schemas";
import { repairOutline } from "@/lib/validate";

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { key, provider, model } = keyFrom(req);
    const { job, brief } = await req.json();
    const raw = await generate({ provider, key, model, system: outlineSystem(), user: outlineUser(job, brief), schema: OutlineSchema, maxTokens: 8000, effort: "low" });
    return Response.json({ outline: repairOutline(raw) });
  } catch (e) { return fail(e); }
}
