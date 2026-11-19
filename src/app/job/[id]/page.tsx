"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import CanvasPlayer from "@/components/CanvasPlayer";
import Masthead from "@/components/Masthead";
import Practice from "@/components/Practice";
import Transcript from "@/components/Transcript";
import { SAMPLE } from "@/lib/sample";
import { loadJob } from "@/lib/store";
import { timeLesson } from "@/lib/timing";
import type { JobRecord } from "@/lib/types";

export default function JobPage() {
  const { id } = useParams<{ id: string }>();
  const [rec, setRec] = useState<JobRecord | null | undefined>(undefined);
  const [scene, setScene] = useState(0);
  const [seek, setSeek] = useState<{ scene: number; nonce: number } | null>(null);

  useEffect(() => {
    setRec(id === "sample" ? { id: "sample", createdAt: 0, job: { text: "", source: "pasted" }, story: SAMPLE } : loadJob(id));
  }, [id]);

  if (rec === undefined) return <Masthead />;
  if (rec === null) {
    return (
      <>
        <Masthead />
        <main className="shell" style={{ padding: "48px 0" }}>
          <h1>Job not found on this device</h1>
          <p style={{ margin: "16px 0" }}>Jobs are saved in this browser only. <Link href="/make">Make a new video</Link>.</p>
        </main>
      </>
    );
  }

  const { brief, cast, story } = rec.story;
  const minutes = Math.max(1, Math.round(timeLesson(story).duration / 60));
  const jump = (i: number) => { setSeek({ scene: i, nonce: Date.now() }); document.getElementById("player")?.scrollIntoView({ behavior: "smooth", block: "center" }); };

  return (
    <>
      <a className="skip-link" href="#player">Skip to the video</a>
      <Masthead edition={`${brief.employer} · ${brief.title}`} />
      <main className="shell">
        <section className="intro" aria-labelledby="job-title">
          <div className="intro-grid">
            <div>
              <p className="eyebrow">The role in one minute</p>
              <h1 id="job-title">{brief.title}</h1>
            </div>
            <p className="intro-deck">{brief.oneLiner}</p>
          </div>
          <div className="course-meta">
            <span>{brief.employer}</span>
            {brief.location && <span>{brief.location}</span>}
            {brief.seniority && <span>{brief.seniority}</span>}
            <span>{minutes} min video · narrated · captions</span>
          </div>
          {rec.job.url && <p className="provenance">Source: <a href={rec.job.url} target="_blank" rel="noreferrer">{new URL(rec.job.url).hostname}</a> · read {new Date(rec.createdAt).toLocaleDateString()}</p>}
          <p className="disclosure">Facts about the job come from the posting. People, names and numbers in scenes marked “Fictional example” are invented to teach. Not affiliated with {brief.employer}.</p>
        </section>

        <div className="workspace">
          <article className="lesson" aria-label="The one-minute video">
            <div id="player">
              <CanvasPlayer lesson={story} cast={cast} onSceneChange={setScene} seekTo={seek} />
            </div>
            <p className="viewing-help">Best in Microsoft Edge (natural voices). Space plays and pauses, arrows move between scenes, C toggles captions.</p>

            <div className="cta-band">
              <div>
                <h2>Want the full course?</h2>
                <p>10 short lessons in the same style: the organization, the work, the decisions, and how to show you fit, with practice questions. {rec.id === "sample" ? "The sample course is ready to watch, no key needed." : "It takes a few minutes to write on your key."}</p>
              </div>
              <Link className="btn" href={`/job/${rec.id}/course`}>{rec.outline || rec.id === "sample" ? "Open the 10-lesson course" : "Build the 10-lesson course"}</Link>
            </div>

            <h2 className="section-title">The job brief</h2>
            <div className="brief">
              <section>
                <h3>The organization</h3>
                <ul>{brief.orgContext.map((o, i) => (
                  <li key={i}>{o.text} <span className={`tag ${o.basis === "posting" ? "posting" : "verify"}`}>{o.basis === "posting" ? "From the posting" : "General knowledge · verify"}</span></li>
                ))}</ul>
              </section>
              <section>
                <h3>What you would do</h3>
                <ul>{brief.responsibilities.map((r) => <li key={r.id}><span className="rid">{r.id}</span>{r.text}</li>)}</ul>
              </section>
              <section>
                <h3>Must-haves</h3>
                <ul>{brief.required.map((r) => <li key={r.id}><span className="rid">{r.id}</span>{r.text}</li>)}</ul>
              </section>
              <section>
                <h3>Nice-to-haves</h3>
                {brief.preferred.length ? <ul>{brief.preferred.map((r) => <li key={r.id}><span className="rid">{r.id}</span>{r.text}</li>)}</ul> : <p>None listed.</p>}
              </section>
              <section>
                <h3>Words to use</h3>
                <ul className="chips">{brief.keywords.map((k) => <li key={k}>{k}</li>)}</ul>
              </section>
              <section>
                <h3>What the posting doesn’t say</h3>
                {brief.unknowns.length ? <ul>{brief.unknowns.map((u, i) => <li key={i}>{u}</li>)}</ul> : <p>Nothing important missing.</p>}
              </section>
            </div>

            <div className="learning-support">
              <details open>
                <summary>Likely interview questions</summary>
                {brief.interviewQuestions.map((q, i) => (
                  <div key={i} style={{ margin: "10px 0 16px" }}>
                    <p><strong>{q.question}</strong></p>
                    <p style={{ color: "var(--ink-soft)" }}>A strong answer has: {q.strongAnswerHas.join(" · ")}</p>
                  </div>
                ))}
              </details>
              <details>
                <summary>Check yourself</summary>
                <Practice q={story} label="One question from the video" />
              </details>
              <details>
                <summary>Transcript and jump points</summary>
                <p className="support-note">Select a scene to jump to it in the video.</p>
                <Transcript lesson={story} current={scene} onJump={jump} />
              </details>
            </div>
          </article>
        </div>
        <footer>
          <p>Understand the organization. Then the work. Then yourself in it.</p>
          <p>Made with Career Ready at BAU Innovate 2026. The story was written by AI from the posting; check facts marked “verify”.</p>
        </footer>
      </main>
    </>
  );
}
