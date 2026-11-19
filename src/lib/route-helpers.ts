import { AIError } from "./ai";
import type { Provider } from "./types";

export function keyFrom(req: Request): { key: string; provider: Provider; model?: string } {
  const key = req.headers.get("x-user-key") || "";
  const provider = (req.headers.get("x-provider") === "openai" ? "openai" : "anthropic") as Provider;
  const model = req.headers.get("x-model") || undefined;
  return { key, provider, model };
}

export function fail(e: unknown) {
  const status = e instanceof AIError ? e.status : 400;
  const message = e instanceof Error ? e.message : "Something went wrong.";
  return Response.json({ error: message }, { status });
}
