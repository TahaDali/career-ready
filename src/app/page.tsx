"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Masthead from "@/components/Masthead";
import { api } from "@/lib/api";
import { listJobs, loadSettings, newId, saveJob, saveSettings, type KeySettings } from "@/lib/store";
import { prefetchVoice } from "@/lib/useEdgeVoice";
import type { JobInput, JobRecord, StoryResult } from "@/lib/types";
import s from "./home.module.css";

const MODELS = {
  anthropic: [
    { id: "claude-opus-5-5", label: "Claude Opus 5.5 (best)" },
    { id: "claude-sonnet-5-5", label: "Claude Sonnet 5.5 (faster)" },
    { id: "claude-haiku-5-5", label: "Claude Haiku 5.5 (fastest)" },
  ],
  openai: [{ id: "gpt-5", label: "GPT-5" }, { id: "gpt-5-mini", label: "GPT-5 mini (faster)" }],
};

type Stage = "idle" | "reading" | "writing" | "done";

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [paste, setPaste] = useState(false);
  const [settings, setSettings] = useState<KeySettings>({ provider: "anthropic", model: "", key: "", remember: false });
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { setSettings(loadSettings()); setJobs(listJobs()); }, []);
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const busy = stage === "reading" || stage === "writing";
  const models = MODELS[settings.provider];
  const model = settings.model && models.some((m) => m.id === settings.model) ? settings.model : models[0].id;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!url.trim() && text.trim().length < 200) { setError("Paste a job link, or paste the posting text."); return; }
    if (settings.key.trim().length < 20) { setError(`Add your ${settings.provider === "openai" ? "OpenAI" : "Claude"} API key.`); return; }
    const conf = { ...settings, model, key: settings.key.trim() };
    saveSettings(conf);
    const t0 = Date.now();
    setElapsed(0);
    timer.current = setInterval(() => setElapsed(Math.round((Date.now() - t0) / 1000)), 500);
    try {
      setStage("reading");
      const { job } = await api<{ job: JobInput }>("/api/ingest", { url: url.trim() || undefined, text: paste ? text : undefined });
      setStage("writing");
      const { story } = await api<{ story: StoryResult }>("/api/story", { job }, conf);
      prefetchVoice(story.story); // the voice starts loading while the video page opens
      const id = newId();
      saveJob({ id, createdAt: Date.now(), job, story });
      setStage("done");
      router.push(`/job/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStage("idle");
    } finally {
      if (timer.current) clearInterval(timer.current);
    }
  }

  return (
    <>
      <Masthead />
      <main className="shell">
        <section className={s.hero} aria-labelledby="title">
          <div>
            <p className="eyebrow">Understand any job in one minute</p>
            <h1 id="title">Paste a job link. Watch the job explained.</h1>
          </div>
          <p className={s.deck}>
            Career Ready reads a job posting and turns it into a <span className="mark">one-minute animated story</span>:
            what the organization does, how the work flows, and what they are really hiring for. Then, if you want, a full
            10-lesson course with practice questions.
          </p>
        </section>

        <form className={s.card} onSubmit={submit} aria-describedby="key-note">
          <div className={s.field}>
            <label htmlFor="url" className={s.label}>1 · Job link</label>
            <input id="url" type="url" inputMode="url" placeholder="https://boards.greenhouse.io/company/jobs/123…" value={url}
              onChange={(e) => setUrl(e.target.value)} disabled={busy} className={s.input} autoComplete="off" />
            <button type="button" className="text-button" onClick={() => setPaste((p) => !p)} aria-expanded={paste}>
              {paste ? "Hide the text box" : "Page needs a login? Paste the posting text instead"}
            </button>
            {paste && (
              <textarea aria-label="Posting text" className={s.textarea} rows={8} value={text} onChange={(e) => setText(e.target.value)}
                placeholder="Paste the whole job description here…" disabled={busy} />
            )}
          </div>

          <div className={s.field}>
            <span className={s.label} id="ai-label">2 · Your AI</span>
            <div className={s.segment} role="radiogroup" aria-labelledby="ai-label">
              {(["anthropic", "openai"] as const).map((p) => (
                <button key={p} type="button" role="radio" aria-checked={settings.provider === p} disabled={busy}
                  onClick={() => setSettings({ ...settings, provider: p, model: "" })}>
                  {p === "anthropic" ? "Claude" : "ChatGPT"}
                </button>
              ))}
              <select aria-label="Model" value={model} disabled={busy} onChange={(e) => setSettings({ ...settings, model: e.target.value })}>
                {models.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>
            <input type="password" aria-label={`${settings.provider === "openai" ? "OpenAI" : "Claude"} API key`} className={s.input}
              placeholder={settings.provider === "openai" ? "sk-… (your OpenAI API key)" : "sk-ant-… (your Claude API key)"}
              value={settings.key} onChange={(e) => setSettings({ ...settings, key: e.target.value })} disabled={busy} autoComplete="off" spellCheck={false} />
            <label className={s.check}>
              <input type="checkbox" checked={settings.remember} onChange={(e) => setSettings({ ...settings, remember: e.target.checked })} />
              Remember my key on this device
            </label>
            <p id="key-note" className={s.note}>
              Your key goes from this browser to our server and straight to {settings.provider === "openai" ? "OpenAI" : "Anthropic"} for
              this request only. We never store or log it. A one-minute video costs a few cents on your key.
            </p>
          </div>

          <div className={s.actions}>
            <button className="btn" type="submit" disabled={busy}>{busy ? "Working…" : "Make my video"}</button>
            <Link href="/job/sample" className="control-link">Watch a sample first</Link>
          </div>

          {error && <p className="error" role="alert">{error}</p>}
          {busy && (
            <ol className={s.progress} aria-live="polite">
              <li data-state={stage === "reading" ? "now" : "done"}>Reading the job page</li>
              <li data-state={stage === "writing" ? "now" : "todo"}>Writing the brief and the story <span className={s.muted}>(about a minute)</span></li>
              <li data-state="todo">Drawing your video</li>
              <li className={s.timer}>{elapsed}s</li>
            </ol>
          )}
        </form>

        <section className={s.how} aria-label="How it works">
          {[
            ["01", "The organization first", "Who it serves, who pays, and why this job exists."],
            ["02", "How the work flows", "The steps that deliver value, and where this role sits."],
            ["03", "A real work moment", "A short fictional example of a decision you would make."],
            ["04", "What they hire for", "Then one interview-style question to check yourself."],
          ].map(([n, h, p]) => (
            <div key={n}><span className={s.num}>{n}</span><h3>{h}</h3><p>{p}</p></div>
          ))}
        </section>

        {jobs.length > 0 && (
          <section className={s.recent} aria-labelledby="recent">
            <h2 id="recent" className={s.h2}>Your jobs on this device</h2>
            <ul>
              {jobs.map((j) => (
                <li key={j.id}>
                  <Link href={`/job/${j.id}`}><strong>{j.story.brief.title}</strong> · {j.story.brief.employer}</Link>
                  <span className={s.muted}>{j.outline ? `Course: ${Object.keys(j.lessons ?? {}).length}/10 lessons` : "Video + brief"}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
        <SiteFooter />
      </main>
    </>
  );
}

function SiteFooter() {
  return (
    <footer>
      <p>Understand the organization. Then the work. Then yourself in it.</p>
      <p>Built at BAU Innovate 2026 on our open-source Continuous-Learning-Video engine. Facts come from the posting; examples are labelled fictional. <Link href="/about">How it works and credits</Link>.</p>
    </footer>
  );
}
