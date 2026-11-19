// Job ingest (docs/methodology/02 Part C): Greenhouse and Lever public APIs first, then schema.org
// JobPosting JSON-LD, then the page's main text. Private and local addresses are refused.
import * as cheerio from "cheerio";
import type { JobInput } from "./types";

const MAX = 18000;
const clean = (s: string) => s.replace(/ /g, " ").replace(/[ \t]+/g, " ").replace(/\n\s*\n\s*/g, "\n\n").trim();
const htmlToText = (html: string) => {
  const $ = cheerio.load(`<div>${html}</div>`);
  $("br").replaceWith("\n");
  $("p, li, h1, h2, h3, h4, div").each((_, el) => { $(el).append("\n"); });
  $("li").each((_, el) => { $(el).prepend("• "); });
  return clean($.text());
};

function assertPublicUrl(raw: string): URL {
  let u: URL;
  try { u = new URL(raw); } catch { throw new Error("That doesn't look like a link. Paste the full address, starting with https://"); }
  if (!/^https?:$/.test(u.protocol)) throw new Error("Only http and https links are supported.");
  const h = u.hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal") || /^(127\.|10\.|192\.168\.|169\.254\.|0\.|::1|\[::1\])/.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h))
    throw new Error("That address isn't a public web page.");
  return u;
}

async function get(url: string, accept = "text/html,application/json"): Promise<Response> {
  const res = await fetch(url, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; CareerReady/1.0; +job-explainer)", accept, "accept-language": "en-US,en;q=0.9" },
    redirect: "follow", signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`The job page answered ${res.status}. Paste the posting text instead.`);
  return res;
}

async function viaAts(u: URL): Promise<JobInput | null> {
  const p = u.pathname.split("/").filter(Boolean);
  // Greenhouse: boards.greenhouse.io/<board>/jobs/<id> or job-boards.greenhouse.io/<board>/jobs/<id>
  if (/greenhouse\.io$/.test(u.hostname) && p.length >= 3 && p[1] === "jobs") {
    const r = await get(`https://boards-api.greenhouse.io/v1/boards/${p[0]}/jobs/${p[2]}`, "application/json");
    const j = await r.json();
    const content = cheerio.load(`<div>${j.content || ""}</div>`).text(); // content is HTML-escaped
    return { url: u.href, title: j.title, company: j.company_name || p[0], source: "jsonld",
      text: clean(`${j.title}\n${j.location?.name || ""}\n\n${htmlToText(content)}`).slice(0, MAX) };
  }
  // Lever: jobs.lever.co/<company>/<id>
  if (u.hostname === "jobs.lever.co" && p.length >= 2) {
    const r = await get(`https://api.lever.co/v0/postings/${p[0]}/${p[1]}`, "application/json");
    const j = await r.json();
    const lists = (j.lists || []).map((l: { text: string; content: string }) => `${l.text}\n${htmlToText(l.content)}`).join("\n\n");
    return { url: u.href, title: j.text, company: p[0], source: "jsonld",
      text: clean(`${j.text}\n${j.categories?.location || ""}\n\n${j.descriptionPlain || htmlToText(j.description || "")}\n\n${lists}\n\n${j.additionalPlain || ""}`).slice(0, MAX) };
  }
  return null;
}

type Ld = Record<string, unknown>;
function findJobPosting(node: unknown): Ld | null {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) { for (const n of node) { const f = findJobPosting(n); if (f) return f; } return null; }
  const o = node as Ld, t = o["@type"];
  if (t === "JobPosting" || (Array.isArray(t) && t.includes("JobPosting"))) return o;
  return findJobPosting(o["@graph"]);
}

export async function ingest(input: { url?: string; text?: string }): Promise<JobInput> {
  const pasted = (input.text || "").trim();
  if (pasted.length >= 200) return { url: input.url || undefined, text: clean(pasted).slice(0, MAX), source: "pasted" };
  if (!input.url) throw new Error("Paste a job link, or the posting text (at least a few paragraphs).");
  const u = assertPublicUrl(input.url.trim());
  const ats = await viaAts(u).catch(() => null);
  if (ats && ats.text.length > 200) return ats;

  const html = await (await get(u.href)).text();
  const $ = cheerio.load(html);
  for (const el of $('script[type="application/ld+json"]').toArray()) {
    try {
      const jp = findJobPosting(JSON.parse($(el).text()));
      if (jp && typeof jp.description === "string") {
        const org = (jp.hiringOrganization as Ld | undefined)?.name as string | undefined;
        const loc = JSON.stringify(jp.jobLocation ?? "").match(/"addressLocality":"([^"]+)"/)?.[1];
        const text = clean(`${jp.title ?? ""}\n${org ?? ""}${loc ? " · " + loc : ""}\n\n${htmlToText(jp.description)}`);
        if (text.length > 200) return { url: u.href, title: String(jp.title ?? ""), company: org, source: "jsonld", text: text.slice(0, MAX) };
      }
    } catch { /* ignore malformed JSON-LD */ }
  }
  $("script, style, noscript, nav, footer, header, svg, form, iframe").remove();
  const main = $("main").length ? $("main") : $("article").length ? $("article") : $("body");
  const text = clean(main.text());
  if (text.length < 300) throw new Error("This page doesn't show the job text to robots (it may need JavaScript or a login). Paste the posting text instead.");
  return { url: u.href, title: $("title").text().trim().slice(0, 140), source: "html", text: text.slice(0, MAX) };
}
