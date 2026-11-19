import Link from "next/link";
import Masthead from "@/components/Masthead";
import SiteFooter, { SiteNav } from "@/components/SiteFooter";

export const metadata = { title: "How Career Ready works · credits" };

export default function About() {
  return (
    <>
      <Masthead edition=" "><SiteNav /></Masthead>
      <main className="shell">
        <section className="intro">
          <p className="eyebrow">How it works</p>
          <h1>From a job link to a lesson, in about a minute</h1>
        </section>
        <div className="learning-support" style={{ marginTop: 24 }}>
          <details open>
            <summary>What happens when you press “Make my video”</summary>
            <ol style={{ padding: "4px 0 16px 22px", lineHeight: 1.7 }}>
              <li><strong>Read the posting.</strong> Our server fetches the page (Greenhouse and Lever through their public job APIs, other sites through their schema.org JobPosting data or main text). You can also paste the text.</li>
              <li><strong>Write the story.</strong> Your AI (Claude or ChatGPT, with your own key) writes a job brief and a storyboard: 6–7 scenes, each naming a <em>recipe</em> (organization map, value flow, record card, people, comparison, steps, statement, question) and the data to draw. The answer is schema-checked and repaired before it reaches the player.</li>
              <li><strong>Draw it live.</strong> The storyboard plays in your browser on our open-source canvas animation engine, narrated by a Microsoft neural voice and timed to its measured word timings (or your browser’s own voice, if you choose). Nothing is rendered on a server, so it starts immediately.</li>
              <li><strong>Go further.</strong> The 10-lesson course is written the same way, two lessons at a time, with practice questions and feedback.</li>
            </ol>
          </details>
          <details>
            <summary>Honesty rules</summary>
            <ul style={{ padding: "4px 0 16px 22px", lineHeight: 1.7 }}>
              <li>Facts about the employer come from the posting. Widely known facts are tagged “General knowledge · verify”.</li>
              <li>Every scene with invented people, dialogue or numbers carries a violet “Fictional example” badge.</li>
              <li>No invented company facts, and no fake “hiring score”.</li>
              <li>Your API key is sent to your AI provider for that request only. It is never stored or logged on our server. Your jobs and progress stay in this browser.</li>
            </ul>
          </details>
          <details>
            <summary>Credits and sources</summary>
            <ul style={{ padding: "4px 0 16px 22px", lineHeight: 1.7 }}>
              <li><a href="https://github.com/TahaDali/Continuous-Learning-Video">Continuous-Learning-Video</a> animation engine and course method (our own open-source project, Apache-2.0), plus engine parts and the course-page design from our earlier Axios AI Fellow course edition.</li>
              <li>Narration: Microsoft neural voices through the Edge Read Aloud service (msedge-tts client, MIT). Permission for public use is not yet verified; a licensed Azure AI Speech key or the “Browser voice” option replaces it before any launch.</li>
              <li>Fonts: Inter, Instrument Serif and JetBrains Mono (SIL Open Font License).</li>
              <li>Libraries: Next.js (MIT), Anthropic TypeScript SDK (MIT), OpenAI Node SDK (Apache-2.0), zod (MIT), cheerio (MIT). schema.org JobPosting vocabulary.</li>
              <li>Built at BAU Innovate 2026 with Claude Code (Anthropic). The full list is in CREDITS.md in the repository.</li>
            </ul>
          </details>
        </div>
        <p style={{ margin: "28px 0" }}><Link className="btn" href="/make">Make a video</Link></p>
        <SiteFooter />
      </main>
    </>
  );
}
