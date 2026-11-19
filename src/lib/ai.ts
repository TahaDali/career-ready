// Bring-your-own-key AI layer (server only). The user's key arrives in the x-user-key header, is used
// for this one request and is never logged or stored. Claude uses structured outputs
// (messages.parse + zodOutputFormat); ChatGPT uses a JSON-schema response format. Both results are
// validated with the same zod schema.
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import OpenAI from "openai";
import { z } from "zod";
import type { Provider } from "./types";

export const CLAUDE_MODELS = ["claude-opus-5-5", "claude-sonnet-5-5", "claude-haiku-5-5"] as const;
export const DEFAULT_MODEL: Record<Provider, string> = { anthropic: "claude-opus-5-5", openai: "gpt-5" };

export class AIError extends Error {
  constructor(message: string, public status = 502) { super(message); }
}

export interface GenerateOptions<T extends z.ZodType> {
  provider: Provider;
  key: string;
  model?: string;
  system: string;
  user: string;
  schema: T;
  maxTokens?: number;
  effort?: "low" | "medium" | "high";
}

export async function generate<T extends z.ZodType>(o: GenerateOptions<T>): Promise<z.infer<T>> {
  if (!o.key || o.key.length < 20) throw new AIError("Add your API key first.", 400);
  return o.provider === "openai" ? viaOpenAI(o) : viaClaude(o);
}

async function viaClaude<T extends z.ZodType>(o: GenerateOptions<T>): Promise<z.infer<T>> {
  const model = o.model && (CLAUDE_MODELS as readonly string[]).includes(o.model) ? o.model : DEFAULT_MODEL.anthropic;
  const client = new Anthropic({ apiKey: o.key, maxRetries: 2, timeout: 280_000 });
  try {
    const res = await client.messages.parse({
      model,
      max_tokens: o.maxTokens ?? 16000,
      // The method preamble is identical across calls, so it is cached for the story, outline and lessons.
      system: [{ type: "text", text: o.system, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: o.user }],
      output_config: { format: zodOutputFormat(o.schema), effort: o.effort ?? "low" },
    });
    if (res.stop_reason === "refusal") throw new AIError("Claude declined this posting. Try another job link.", 422);
    if (res.stop_reason === "max_tokens") throw new AIError("The answer was cut off (too long). Please try again.", 502);
    if (!res.parsed_output) throw new AIError("Claude returned an answer we could not read. Please try again.", 502);
    return res.parsed_output as z.infer<T>;
  } catch (e) {
    if (e instanceof AIError) throw e;
    if (e instanceof Anthropic.AuthenticationError) throw new AIError("That Claude API key was rejected. Check it and try again.", 401);
    if (e instanceof Anthropic.PermissionDeniedError) throw new AIError("This key can't use that model. Try another model.", 403);
    if (e instanceof Anthropic.RateLimitError) throw new AIError("Your key hit its rate limit. Wait a minute and try again.", 429);
    if (e instanceof Anthropic.BadRequestError) throw new AIError("Claude rejected the request: " + e.message.slice(0, 200), 400);
    if (e instanceof Anthropic.APIError) throw new AIError(`Claude API error (${e.status ?? "network"}). Please try again.`, 502);
    throw new AIError("Could not reach Claude. Check your connection and try again.", 502);
  }
}

async function viaOpenAI<T extends z.ZodType>(o: GenerateOptions<T>): Promise<z.infer<T>> {
  const client = new OpenAI({ apiKey: o.key, maxRetries: 2, timeout: 280_000 });
  const schema = z.toJSONSchema(o.schema, { target: "draft-7" }) as Record<string, unknown>;
  delete schema.$schema;
  try {
    const res = await client.chat.completions.create({
      model: o.model || DEFAULT_MODEL.openai,
      messages: [{ role: "system", content: o.system }, { role: "user", content: o.user }],
      response_format: { type: "json_schema", json_schema: { name: "result", schema, strict: false } },
    });
    const choice = res.choices[0];
    if (choice?.message?.refusal) throw new AIError("ChatGPT declined this posting. Try another job link.", 422);
    if (choice?.finish_reason === "length") throw new AIError("The answer was cut off (too long). Please try again.", 502);
    const text = choice?.message?.content ?? "";
    let json: unknown;
    try { json = JSON.parse(text); } catch { throw new AIError("ChatGPT returned an answer we could not read. Please try again.", 502); }
    const parsed = o.schema.safeParse(json);
    if (!parsed.success) throw new AIError("ChatGPT's answer was missing some parts. Please try again.", 502);
    return parsed.data;
  } catch (e) {
    if (e instanceof AIError) throw e;
    if (e instanceof OpenAI.AuthenticationError) throw new AIError("That OpenAI API key was rejected. Check it and try again.", 401);
    if (e instanceof OpenAI.RateLimitError) throw new AIError("Your key hit its rate limit or has no credit. Try again shortly.", 429);
    if (e instanceof OpenAI.NotFoundError) throw new AIError("That OpenAI model isn't available to this key.", 404);
    if (e instanceof OpenAI.APIError) throw new AIError(`OpenAI API error (${e.status ?? "network"}). Please try again.`, 502);
    throw new AIError("Could not reach OpenAI. Check your connection and try again.", 502);
  }
}
