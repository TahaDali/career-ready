"use client";
// The 10-lesson course page: the AI Fellow course page structure (masthead, intro, lesson workspace,
// practice, transcript, course drawer), with the live canvas player instead of <video>, and the course
// written lesson by lesson on the user's key while they watch.
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import CanvasPlayer from "@/components/CanvasPlayer";
import Masthead from "@/components/Masthead";
import Practice from "@/components/Practice";
import Transcript from "@/components/Transcript";
import { api } from "@/lib/api";
import { SAMPLE } from "@/lib/sample";
import { loadJob, loadSettings, saveJob, saveSettings, type KeySettings } from "@/lib/store";
import { timeLesson } from "@/lib/timing";
import type { JobRecord, Lesson, Outline } from "@/lib/types";

type Status = "waiting" | "writing" | "ready" | "failed";
const CONCURRENCY = 2;

export default function CoursePage() {
  const { id } = useParams<{ id: string }>();
  const [rec, setRec] = useState<JobRecord | null | undefined>(undefined);
  const [settings, setSettings] = useState<KeySettings | null>(null);
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [outlineError, setOutlineError] = useState<string | null>(null);
  const [building, setBuilding] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const [scene, setScene] = useState(0);
  const [seek, setSeek] = useState<{ scene: number; nonce: number } | null>(null);
  const recRef = useRef<JobRecord | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const commit = useCallback((fn: (r: JobRecord) => JobRecord) => {
    if (!recRef.current) return;
    const next = fn(recRef.current);
    recRef.current = next; saveJob(next); setRec(next);
  }, []);

  useEffect(() => {
    let r = loadJob(id);
    if (!r && id === "sample") {
      // The sample job's course is written on the visitor's key, from a posting rebuilt from the brief.
      const b = SAMPLE.brief;
      const text = [b.title, `${b.employer} · ${b.location}`, b.oneLiner, "Responsibilities:", ...b.responsibilities.map((x) => "- " + x.text),
        "Requirements:", ...b.required.map((x) => "- " + x.text), "Preferred:", ...b.preferred.map((x) => "- " + x.text)].join("\n");
      r = { id: "sample", createdAt: Date.now(), job: { text, source: "pasted" }, story: SAMPLE };
      saveJob(r);
    }
    recRef.current = r; setRec(r); setSettings(loadSettings());
    if (r?.lessons) setStatus(Object.fromEntries(Object.keys(r.lessons).map((k) => [k, "ready" as Status])));
    if (r?.lessons) setCurrent(Object.keys(r.lessons).sort()[0] ?? null);
  }, [id]);

  const writeLesson = useCallback(async (lid: string, outline: Outline, s: KeySettings) => {
    const r = recRef.current!;
    setStatus((x) => ({ ...x, [lid]: "writing" }));
    try {
      const { lesson } = await api<{ lesson: Lesson }>("/api/course/lesson",
        { job: r.job, brief: r.story.brief, cast: r.story.cast, outline, id: lid }, s);
      commit((x) => ({ ...x, lessons: { ...(x.lessons ?? {}), [lid]: lesson } }));
      setStatus((x) => ({ ...x, [lid]: "ready" }));
      setCurrent((c) => c ?? lid);
    } catch (e) {
      setStatus((x) => ({ ...x, [lid]: "failed" }));
      setErrors((x) => ({ ...x, [lid]: e instanceof Error ? e.message : "Failed" }));
    }
  }, [commit]);

  const build = useCallback(async (s: KeySettings) => {
    const r = recRef.current;
    if (!r || building) return;
    setBuilding(true); setOutlineError(null);
    try {
      let outline = r.outline;
      if (!outline) {
        ({ outline } = await api<{ outline: Outline }>("/api/course/outline", { job: r.job, brief: r.story.brief }, s));
        commit((x) => ({ ...x, outline }));
      }
      const todo = outline!.lessons.map((l) => l.id).filter((lid) => !recRef.current?.lessons?.[lid]);
      let next = 0;
      const worker = async () => { while (next < todo.length) { const lid = todo[next++]; await writeLesson(lid, outline!, s); } };
      await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    } catch (e) {
      setOutlineError(e instanceof Error ? e.message : "Could not write the outline.");
    } finally { setBuilding(false); }
  }, [building, commit, writeLesson]);

  // Start (or resume) writing as soon as the page opens, if a key is available.
  const started = useRef(false);
  useEffect(() => {
    if (!rec || !settings || started.current) return;
    const missing = !rec.outline || rec.outline.lessons.some((l) => !rec.lessons?.[l.id]);
    if (missing && settings.key.length >= 20) { started.current = true; build(settings); }
  }, [rec, settings, build]);

  if (rec === undefined) return <Masthead />;
  if (rec === null) return (<><Masthead /><main className="shell" style={{ padding: "48px 0" }}><h1>Course not found on this device</h1><p><Link href="/">Start again</Link></p></main></>);

  const { brief, cast } = rec.story;
  const outline = rec.outline;
  const lessons = rec.lessons ?? {};
  const order = outline?.lessons ?? [];
  const lesson = current ? lessons[current] : null;
  const idx = order.findIndex((l) => l.id === current);
  const progress = rec.progress ?? {};
  const doneCount = order.filter((l) => progress[l.id]?.done).length;
  const readyCount = order.filter((l) => lessons[l.id]).length;
  const totalMin = Math.round(order.reduce((a, l) => a + (lessons[l.id] ? timeLesson(lessons[l.id]).duration : 120), 0) / 60);

  const open = (lid: string) => {
    if (!lessons[lid]) return;
    setCurrent(lid); setScene(0); dialog.current?.close();
    setTimeout(() => titleRef.current?.focus(), 50);
  };
  const go = (d: number) => { for (let i = idx + d; i >= 0 && i < order.length; i += d) if (lessons[order[i].id]) return open(order[i].id); };
  const setProgress = (lid: string, p: { done?: boolean; answer?: number }) =>
    commit((x) => ({ ...x, progress: { ...(x.progress ?? {}), [lid]: { ...(x.progress?.[lid] ?? {}), ...p } } }));

  const needKey = !settings || settings.key.length < 20;
  const parts = Array.from(new Set(order.map((l) => l.part)));

  return (
    <>
      <a className="skip-link" href="#lesson-title">Skip to the current lesson</a>
      <Masthead edition={`${brief.employer} · ${brief.title}`}>
        <button id="browse" onClick={() => dialog.current?.showModal()} aria-haspopup="dialog">Course contents</button>
      </Masthead>
      <main className="shell">
        <section className="intro" aria-labelledby="course-title">
          <div className="intro-grid">
            <div>
              <p className="eyebrow">The learning journey</p>
              <h1 id="course-title">{outline?.title ?? `Becoming a ${brief.title}`}</h1>
            </div>
            <p className="intro-deck">{outline?.tagline ?? brief.oneLiner}</p>
          </div>
          <div className="course-meta">
            <span>{order.length || 10} lessons</span>
            <span>About {totalMin || 20} min</span>
            <span>Narrated · captions · practice</span>
            <span role="status">{doneCount} of {order.length || 10} complete</span>
          </div>
          <p className="disclosure">Written by AI from the {brief.employer} posting. Facts come from the posting; people and numbers in scenes marked “Fictional example” are invented to teach. Not affiliated with {brief.employer}.</p>
        </section>

        {(building || readyCount < (order.length || 10)) && (
          <section className="review-band" aria-live="polite">
            <div className="review-summary">
              <p>{!outline ? (building ? "Planning the 10 lessons…" : "The course hasn't been written yet.")
                : `${readyCount} of ${order.length} lessons written${building ? " · writing two at a time, keep this page open" : ""}`}</p>
              {outlineError && <p className="error" role="alert">{outlineError}</p>}
              {!building && (needKey ? (
                <form style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: "1 1 100%" }} onSubmit={(e) => { e.preventDefault(); if (settings) { saveSettings(settings); build(settings); } }}>
                  <input type="password" aria-label="Your API key" placeholder="Paste your Claude or OpenAI key to write the course" style={{ flex: "1 1 280px", padding: 10, border: "2px solid var(--ink)" }}
                    value={settings?.key ?? ""} onChange={(e) => setSettings({ ...(settings ?? { provider: "anthropic", model: "", remember: false }), key: e.target.value } as KeySettings)} />
                  <select aria-label="Provider" value={settings?.provider ?? "anthropic"} onChange={(e) => setSettings({ ...(settings as KeySettings), provider: e.target.value as KeySettings["provider"], model: "" })}>
                    <option value="anthropic">Claude</option><option value="openai">ChatGPT</option>
                  </select>
                  <button type="submit">Write the course</button>
                </form>
              ) : <button onClick={() => settings && build(settings)}>{outline ? "Write the missing lessons" : "Write the course"}</button>)}
            </div>
          </section>
        )}

        <div className="workspace">
          {lesson ? (
            <article className="lesson" aria-label="Current lesson">
              <div className="lesson-meta"><span>{lesson.part}</span><span>Lesson {lesson.id} of {String(order.length).padStart(2, "0")}</span></div>
              <h2 id="lesson-title" tabIndex={-1} ref={titleRef}>{lesson.title}</h2>
              <p id="goal">{lesson.goal}</p>
              <CanvasPlayer key={lesson.id} lesson={lesson} cast={cast} onSceneChange={setScene} seekTo={seek}
                onEnd={() => setProgress(lesson.id, { done: true })} />
              <div className="playback">
                <div className="playback-options">
                  <button onClick={() => dialog.current?.showModal()} aria-haspopup="dialog">Show lessons</button>
                  <a className="control-link" href="#transcript-panel" onClick={() => { const d = document.getElementById("transcript-panel") as HTMLDetailsElement | null; if (d) d.open = true; }}>Read transcript</a>
                </div>
                <button id="complete" aria-pressed={!!progress[lesson.id]?.done} onClick={() => setProgress(lesson.id, { done: !progress[lesson.id]?.done })}>
                  {progress[lesson.id]?.done ? "Completed ✓" : "Mark complete"}
                </button>
              </div>
              <p className="viewing-help">Best in Microsoft Edge (natural voices). Space plays and pauses, arrows move between scenes, C toggles captions.</p>
              <div className="lesson-navigation">
                <button onClick={() => go(-1)} disabled={idx <= 0}>← Previous lesson</button>
                <button onClick={() => go(1)} disabled={idx >= order.length - 1 || !order.slice(idx + 1).some((l) => lessons[l.id])}>Next lesson →</button>
              </div>
              <div className="learning-support">
                <details open>
                  <summary>Pause and apply</summary>
                  <Practice q={lesson} saved={progress[lesson.id]?.answer} onAnswer={(a) => setProgress(lesson.id, { answer: a })} label="Practice question" />
                  {(lesson.extraQuestions ?? []).map((q, i) => <div key={i} style={{ marginTop: 26 }}><Practice q={q} label={`Extra question ${i + 1}`} /></div>)}
                </details>
                <details id="transcript-panel">
                  <summary>Transcript and jump points</summary>
                  <p className="support-note">Select a scene to jump to it in the lesson.</p>
                  <Transcript lesson={lesson} current={scene} onJump={(i) => setSeek({ scene: i, nonce: Date.now() })} />
                </details>
                {lesson.keyTerms.length > 0 && (
                  <details>
                    <summary>Key terms</summary>
                    <dl style={{ padding: "6px 0 14px" }}>{lesson.keyTerms.map((k) => (<div key={k.term} style={{ margin: "10px 0" }}><dt style={{ fontWeight: 700 }}>{k.term}</dt><dd style={{ margin: 0, color: "var(--ink-soft)" }}>{k.definition}</dd></div>))}</dl>
                  </details>
                )}
                <details>
                  <summary>Back to the one-minute video and brief</summary>
                  <p style={{ padding: "8px 0 16px" }}><Link href={`/job/${rec.id}`}>Open the job brief</Link></p>
                </details>
              </div>
            </article>
          ) : (
            <article className="lesson"><p className="lesson-meta"><span>Lesson 01</span></p>
              <h2 id="lesson-title" tabIndex={-1} ref={titleRef}>{building ? "Your first lesson is being written…" : "No lessons yet"}</h2>
              <p id="goal">Each lesson takes about a minute to write. The first one opens here as soon as it is ready.</p>
              <div className="video-wrap" style={{ display: "grid", placeItems: "center", color: "#fff" }}><p className="kicker" style={{ color: "#c9d2e3" }}>{building ? "Writing…" : "Waiting"}</p></div>
            </article>
          )}
        </div>
        <footer>
          <p>Understand the organization. Then the work. Then yourself in it.</p>
          <p>Lesson completion records viewing progress on this device; it does not certify readiness.</p>
        </footer>
      </main>

      <dialog id="course-panel" ref={dialog} aria-labelledby="course-panel-title" onClick={(e) => { if (e.target === dialog.current) dialog.current?.close(); }}>
        <div className="panel-head">
          <div><p className="eyebrow">The learning journey</p><h2 id="course-panel-title">Your course</h2></div>
          <button onClick={() => dialog.current?.close()} aria-label="Close course contents">Close</button>
        </div>
        <div className="panel-body">
          <div className="panel-progress">
            <p>{doneCount} of {order.length || 10} complete · {readyCount} written</p>
            <progress value={doneCount} max={order.length || 10} aria-label="Lessons completed" />
          </div>
          <nav id="lesson-list" aria-label="Lessons">
            {parts.map((p) => (
              <div key={p}>
                <p className="chapter-heading">{p}</p>
                {order.filter((l) => l.part === p).map((l) => {
                  const st = lessons[l.id] ? "ready" : status[l.id] ?? "waiting";
                  return (
                    <button key={l.id} onClick={() => (st === "failed" && settings ? writeLesson(l.id, outline!, settings) : open(l.id))}
                      aria-current={l.id === current ? "true" : undefined} data-done={!!progress[l.id]?.done} disabled={st === "waiting" || st === "writing"}>
                      <span className="nav-number">{l.id}</span>
                      <span><span className="nav-title">{l.title}</span>
                        <span className="nav-duration">{st === "ready" ? `${Math.max(1, Math.round(timeLesson(lessons[l.id]).duration / 60))} min` : st === "writing" ? "Writing…" : st === "failed" ? `Failed · tap to retry` : "Waiting"}</span>
                        {st === "failed" && errors[l.id] && <span className="nav-duration" style={{ textTransform: "none" }}>{errors[l.id]}</span>}
                      </span>
                      <span className="nav-check" aria-hidden>{progress[l.id]?.done ? "✓" : ""}</span>
                    </button>
                  );
                })}
              </div>
            ))}
            {!order.length && <p style={{ marginTop: 16 }}>The outline appears here once it is written.</p>}
          </nav>
        </div>
      </dialog>
    </>
  );
}
