import { ingest } from "@/lib/ingest";
import { fail } from "@/lib/route-helpers";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const job = await ingest({ url: body.url, text: body.text });
    return Response.json({ job });
  } catch (e) { return fail(e); }
}
