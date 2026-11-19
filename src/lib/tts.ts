// Microsoft Edge neural voices (the same voices as our course pipeline's narrate.py, e.g.
// en-US-AvaMultilingualNeural at -3%), through the msedge-tts client (MIT). It returns the MP3 and
// Microsoft's WordBoundary timings, so the animation follows the measured words.
// NOTE: this uses Edge's Read Aloud service; permission for public, production use is NOT verified
// (see CREDITS.md). The player falls back to the browser's own voices if it fails.
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

export const EDGE_VOICES = [
  { id: "en-US-AvaMultilingualNeural", label: "Ava (US)" },
  { id: "en-US-AndrewMultilingualNeural", label: "Andrew (US)" },
  { id: "en-US-EmmaMultilingualNeural", label: "Emma (US)" },
  { id: "en-US-BrianMultilingualNeural", label: "Brian (US)" },
  { id: "en-GB-SoniaNeural", label: "Sonia (UK)" },
] as const;

export interface Word { text: string; start: number; end: number; charStart: number; charEnd: number }
export interface Clip { audio: Buffer; words: Word[] }

const cache = new Map<string, Clip>();

// Up to four open connections per voice, reused across requests: opening a socket per clip costs
// seconds, and one shared socket makes parallel clips queue behind each other.
type Conn = { tts: Promise<MsEdgeTTS>; busy: number };
const pool = new Map<string, Conn[]>();
const MAX_CONN = 4;
function open(voice: string): Promise<MsEdgeTTS> {
  return (async () => {
    const tts = new MsEdgeTTS({ connectionTimeoutMs: 6000, synthesisTimeoutMs: 45000 });
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3, { wordBoundaryEnabled: true });
    return tts;
  })();
}
function acquire(voice: string): Conn {
  const list = pool.get(voice) ?? [];
  pool.set(voice, list);
  let c = list.find((x) => x.busy === 0);
  if (!c && list.length < MAX_CONN) { c = { tts: open(voice), busy: 0 }; list.push(c); }
  c ??= list.reduce((a, b) => (b.busy < a.busy ? b : a));
  c.busy++;
  return c;
}
function drop(voice: string, c: Conn) {
  const list = pool.get(voice);
  if (list) pool.set(voice, list.filter((x) => x !== c));
  c.tts.then((t) => t.close()).catch(() => {});
}

async function once(text: string, voice: string, rate: string): Promise<Clip> {
  const conn = acquire(voice);
  try { return await speak(await conn.tts, text, rate); }
  catch (e) { drop(voice, conn); throw e; }
  finally { conn.busy--; }
}

async function speak(tts: MsEdgeTTS, text: string, rate: string): Promise<Clip> {
  const { audioStream, metadataStream } = tts.toStream(text, { rate });
  const meta: string[] = [];
  metadataStream?.on("data", (d) => meta.push(d.toString()));
  const chunks: Buffer[] = [];
  for await (const c of audioStream) chunks.push(c as Buffer);
  await new Promise((r) => setTimeout(r, 30)); // word boundaries arrive before the end of the audio
  const raw: { text: string; start: number; end: number }[] = [];
  for (const m of meta) {
    try {
      for (const it of JSON.parse(m).Metadata ?? []) {
        if (it.Type !== "WordBoundary") continue;
        raw.push({ text: String(it.Data.text.Text), start: it.Data.Offset / 1e7, end: (it.Data.Offset + it.Data.Duration) / 1e7 });
      }
    } catch { /* a partial chunk: skip */ }
  }
  raw.sort((a, b) => a.start - b.start);
  // Character positions in the narration, so the engine can find sentence ends.
  let at = 0;
  const words: Word[] = raw.map((w) => {
    const i = text.indexOf(w.text, at);
    const charStart = i >= 0 ? i : at, charEnd = charStart + w.text.length;
    if (i >= 0) at = charEnd;
    return { ...w, charStart, charEnd };
  });
  const audio = Buffer.concat(chunks);
  if (audio.length < 500) throw new Error("empty audio");
  return { audio, words };
}

export async function synthesize(text: string, voice: string, rate = "-3%"): Promise<Clip> {
  const v = EDGE_VOICES.some((x) => x.id === voice) ? voice : EDGE_VOICES[0].id;
  const key = `${v}|${rate}|${text}`;
  const hit = cache.get(key);
  if (hit) return hit;
  let last: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const clip = await once(text, v, rate);
      if (cache.size > 300) cache.delete(cache.keys().next().value!);
      cache.set(key, clip);
      return clip;
    } catch (e) { last = e; await new Promise((r) => setTimeout(r, 300 * (attempt + 1))); }
  }
  throw last instanceof Error ? last : new Error("voice failed");
}

