export type { Scene, Lesson, Brief, CastMember, StoryResult, Outline } from "./schemas";

export interface JobInput {
  url?: string;
  text: string;
  title?: string;
  company?: string;
  source: "jsonld" | "html" | "pasted";
}

export type Provider = "anthropic" | "openai";

// Everything saved for one job in localStorage (key "cr:job:<id>").
export interface JobRecord {
  id: string;
  createdAt: number;
  job: JobInput;
  story: import("./schemas").StoryResult;
  outline?: import("./schemas").Outline;
  lessons?: Record<string, import("./schemas").Lesson>;
  progress?: Record<string, { done?: boolean; answer?: number }>;
}
