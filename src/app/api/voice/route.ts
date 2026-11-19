import { synthesize } from "@/lib/tts";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { text, voice } = await req.json();
    if (typeof text !== "string" || !text.trim() || text.length > 2500) return Response.json({ error: "Bad text" }, { status: 400 });
    const clip = await synthesize(text, String(voice || ""));
    return Response.json({ audio: clip.audio.toString("base64"), words: clip.words });
  } catch {
    return Response.json({ error: "The voice service did not answer." }, { status: 502 });
  }
}
