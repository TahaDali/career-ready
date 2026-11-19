// The landing page, kept to four parts: the promise, the real player, three steps, and the key note.
import Link from "next/link";
import CanvasPlayer from "@/components/CanvasPlayer";
import Masthead from "@/components/Masthead";
import SiteFooter, { SiteNav } from "@/components/SiteFooter";
import { SAMPLE } from "@/lib/sample";
import s from "./landing.module.css";

const STEPS = [
  ["01", "Paste a job link", "Or paste the posting's text."],
  ["02", "Add your AI key", "Claude or ChatGPT. A video costs a few cents."],
  ["03", "Watch the job explained", "In about a minute. Then build a 10-lesson course if you want."],
];

export default function Landing() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to the content</a>
      <Masthead edition=" "><SiteNav /></Masthead>
      <main id="main" className="shell">
        <section className={s.hero} aria-labelledby="title">
          <h1 id="title">Paste a job link. <span className={s.accent}>Watch the job explained.</span></h1>
          <p className={s.deck}>A narrated one-minute video of any job: what the organization does, how the work flows, and what they really hire for.</p>
          <div className={s.ctas}>
            <Link className="btn" href="/make">Make my video</Link>
            <Link className="control-link" href="/job/sample/course">See a full sample course</Link>
          </div>
        </section>

        <section className={s.sample} aria-label="Sample video">
          <p className="kicker">Sample · {SAMPLE.brief.title} · press play</p>
          <CanvasPlayer lesson={SAMPLE.story} cast={SAMPLE.cast} />
        </section>

        <ol className={s.steps} aria-label="How it works">
          {STEPS.map(([n, h, p]) => (<li key={n}><span className={s.num}>{n}</span><h2>{h}</h2><p>{p}</p></li>))}
        </ol>

        <p className={s.trust}>
          Your key is never stored. Facts come from the posting; examples are labelled fictional.{" "}
          <Link href="/privacy">Privacy</Link>
        </p>
        <SiteFooter />
      </main>
    </>
  );
}
