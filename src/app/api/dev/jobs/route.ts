// Development only: save and load job records as local files (dev-data/, git-ignored), so a video made
// in one browser can be audited in another. Disabled in production builds.
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DIR = path.join(process.cwd(), "dev-data");
const off = () => process.env.NODE_ENV === "production";

export async function POST(req: Request) {
  if (off()) return new Response("Not found", { status: 404 });
  const rec = await req.json();
  const id = String(rec?.id || "").replace(/[^a-z0-9]/gi, "");
  if (!id) return Response.json({ error: "no id" }, { status: 400 });
  await mkdir(DIR, { recursive: true });
  await writeFile(path.join(DIR, `${id}.json`), JSON.stringify(rec));
  return Response.json({ saved: id });
}

export async function GET(req: Request) {
  if (off()) return new Response("Not found", { status: 404 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) { try { return Response.json({ ids: (await readdir(DIR)).map((f) => f.replace(/\.json$/, "")) }); } catch { return Response.json({ ids: [] }); } }
  try { return new Response(await readFile(path.join(DIR, `${id.replace(/[^a-z0-9]/gi, "")}.json`), "utf8"), { headers: { "content-type": "application/json" } }); }
  catch { return Response.json({ error: "not found" }, { status: 404 }); }
}
