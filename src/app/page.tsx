// The landing page: what Career Ready is, the real player running the sample, and the way in (/make).
import Link from "next/link";
import CanvasPlayer from "@/components/CanvasPlayer";
import Masthead from "@/components/Masthead";
import SiteFooter, { SiteNav } from "@/components/SiteFooter";
import { SAMPLE } from "@/lib/sample";
import { SAMPLE_OUTLINE } from "@/lib/sample-course";
import s from "./landing.module.css";

const STEPS = [
  ["01", "Paste a job link", "Greenhouse, Lever and most career sites. If a page needs a login, paste the posting's text instead."],
  ["02", "Your AI writes a storyboard", "Claude or ChatGPT, on your own key, writes a job brief and a 6–7 scene story. Every answer is checked against a strict format and repaired before it plays."],
  ["03", "Our engine draws it live", "The scenes animate in your browser with a natural narrator voice, captions and keyboard controls. Nothing is rendered on a server, so it starts at once."],
  ["04", "Go deeper if you want", "Turn the same job into a 10-lesson course: the organization, the work, the hiring decision and the first 90 days, with practice questions."],
];

const PROBLEMS = [
  ["A posting is a list", "“Verify eligibility. Schedule across departments.” Postings name tasks, but rarely explain why they matter, or to whom."],
  ["Prep is generic", "Most interview advice would fit any job. It doesn't explain this employer, this team, or this role."],
  ["Research takes hours", "Learning an unfamiliar industry from scratch takes time most applicants don't have before a deadline."],
];

const LABELS = [
  ["posting", "From the posting", "Facts about the employer and the role, restated faithfully, never upgraded."],
  ["verify", "General knowledge · verify", "Widely known context about the industry, tagged so you check it yourself."],
  ["fiction", "Fictional example", "Invented people, dialogue and numbers that teach a real decision. Always badged."],
];

const WHO = [
  ["Students and new graduates", "Understand an employer before you apply, and walk into the interview knowing what the work actually is."],
  ["Career changers", "Learn the shape of a new industry in minutes: who it serves, who pays, and where a role fits."],
  ["Career services teams", "Send students a sample before a mock interview, or build a course for a role many of them apply to."],
];

export default function Landing() {
  const parts = Array.from(new Set(SAMPLE_OUTLINE.lessons.map((l) => l.part)));
  return (
    <>
      <a className="skip-link" href="#main">Skip to the content</a>
      <Masthead edition=" "><SiteNav /></Masthead>
      <main id="main" className="shell">
        <section className={s.hero} aria-labelledby="title">
          <div className={s.heroText}>
            <p className="eyebrow">For anyone applying to a job they don&apos;t fully understand yet</p>
            <h1 id="title">Paste a job link. <span className={s.accent}>Watch the job explained.</span></h1>
          </div>
          <div className={s.heroSide}>
            <p className={s.deck}>
              Career Ready turns a job posting into a <span className="mark">narrated, animated one-minute story</span>:
              what the organization does, how the work flows, and what they are really hiring for. Then, if you want, a
              full 10-lesson course with practice questions.
            </p>
            <div className={s.ctas}>
              <Link className="btn" href="/make">Make my video</Link>
              <Link className="control-link" href="/job/sample/course">See a full sample course</Link>
            </div>
            <p className={s.small}>The sample below is free. New videos use your own Claude or ChatGPT key and cost a few cents each.</p>
          </div>
        </section>

        <section id="sample" className={s.sample} aria-label="Sample video">
          <div className={s.sampleHead}>
            <p className="kicker">Sample · {SAMPLE.brief.title} · {SAMPLE.brief.employer}</p>
            <p className={s.small}>This is the real player, drawing live in your browser. Press play.</p>
          </div>
          <CanvasPlayer lesson={SAMPLE.story} cast={SAMPLE.cast} />
        </section>

        <section className={s.section} aria-labelledby="problem">
          <p className="eyebrow">The problem</p>
          <h2 id="problem" className={s.h2}>A job posting is a list. The job is a world.</h2>
          <div className={s.three}>
            {PROBLEMS.map(([h, p]) => (<div key={h}><h3>{h}</h3><p>{p}</p></div>))}
          </div>
        </section>

        <section id="how" className={s.section} aria-labelledby="how-title">
          <p className="eyebrow">How it works</p>
          <h2 id="how-title" className={s.h2}>From link to lesson in about a minute</h2>
          <ol className={s.steps}>
            {STEPS.map(([n, h, p]) => (<li key={n}><span className={s.num}>{n}</span><h3>{h}</h3><p>{p}</p></li>))}
          </ol>
        </section>

        <section className={s.section} aria-labelledby="get">
          <p className="eyebrow">What you get</p>
          <h2 id="get" className={s.h2}>One minute to understand. Twenty to prepare.</h2>
          <div className={s.products}>
            <article className={s.product}>
              <p className="kicker">In about a minute</p>
              <h3>The one-minute story and job brief</h3>
              <ul>
                <li>Who the organization serves, and who pays</li>
                <li>How the work flows, and where this role sits</li>
                <li>A short fictional work moment with a real decision</li>
                <li>What they are really hiring for, and a self-check question</li>
                <li>A brief: requirements, likely interview questions, and what the posting doesn&apos;t say</li>
              </ul>
              <Link className="control-link" href="/job/sample">Open the sample brief</Link>
            </article>
            <article className={s.product}>
              <p className="kicker">In a few minutes more</p>
              <h3>The 10-lesson course</h3>
              <ol className={s.outline}>
                {parts.map((p) => (
                  <li key={p}><span className={s.part}>{p.replace(/^Part\s+/, "")}</span>
                    <span>{SAMPLE_OUTLINE.lessons.filter((l) => l.part === p).map((l) => l.title).join(" · ")}</span></li>
                ))}
              </ol>
              <Link className="control-link" href="/job/sample/course">Open the sample course</Link>
            </article>
          </div>
        </section>

        <section className={s.section} aria-labelledby="method">
          <div className={s.split}>
            <div>
              <p className="eyebrow">The method</p>
              <h2 id="method" className={s.h2}>Organization first. Then the work. Then you.</h2>
              <p className={s.body}>
                A job only makes sense inside the organization that needs it. Every video and course follows the same
                teaching method: the problem the organization exists to solve, the people it serves and who pays, how
                a request becomes an outcome, and only then the role, the hiring decision and the first 90 days.
              </p>
              <p className={s.body}>No invented company facts. No fake hiring score. Where the posting is silent, the lesson says so.</p>
            </div>
            <ul className={s.labels} aria-label="Every claim carries one of three labels">
              {LABELS.map(([k, t, p]) => (<li key={k}><span className={`tag ${k}`}>{t}</span><p>{p}</p></li>))}
            </ul>
          </div>
        </section>

        <section className={s.section} aria-labelledby="who">
          <p className="eyebrow">Who it&apos;s for</p>
          <h2 id="who" className={s.h2}>One university. Every major. Every job link.</h2>
          <div className={s.three}>
            {WHO.map(([h, p]) => (<div key={h}><h3>{h}</h3><p>{p}</p></div>))}
          </div>
        </section>

        <section className={s.privacy} aria-labelledby="privacy">
          <div>
            <p className="eyebrow">Your key, your data</p>
            <h2 id="privacy" className={s.h2}>We never store your key.</h2>
          </div>
          <ul>
            <li>Your API key goes from your browser, through our server, straight to Anthropic or OpenAI for that one request. It is never saved or logged.</li>
            <li>Your jobs, courses and progress stay in this browser. There are no accounts.</li>
            <li>Narration text is sent to Microsoft&apos;s voice service to be read aloud. You can switch to your browser&apos;s own voice.</li>
          </ul>
          <Link href="/privacy">Read the privacy notice</Link>
        </section>

        <div className="cta-band">
          <div>
            <h2>Try it with the next job you apply for.</h2>
            <p>Paste the link, add your key, and watch the job explained in about a minute.</p>
          </div>
          <Link className="btn" href="/make">Make my video</Link>
        </div>
        <SiteFooter />
      </main>
    </>
  );
}
