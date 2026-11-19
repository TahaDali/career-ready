import Link from "next/link";
import Masthead from "@/components/Masthead";
import SiteFooter, { SiteNav } from "@/components/SiteFooter";

export const metadata = { title: "Terms of use · Career Ready" };

export default function Terms() {
  return (
    <>
      <Masthead edition=" "><SiteNav /></Masthead>
      <main className="shell">
        <section className="intro">
          <p className="eyebrow">Terms of use</p>
          <h1>A learning tool, used honestly</h1>
        </section>
        <div className="prose">
          <p className="updated">Last updated November 19, 2026 · Prototype</p>
          <p>
            Career Ready is a student prototype built at BAU Innovate 2026, offered free for learning. By using it, you
            agree to these terms.
          </p>

          <h2>What Career Ready is, and isn’t</h2>
          <ul>
            <li>It helps you understand a job posting through short animated lessons. It is for education only.</li>
            <li>It is not career, legal, immigration or financial advice, and it does not predict or guarantee any hiring outcome.</li>
            <li>It is not affiliated with, or endorsed by, any employer whose posting you use. Names and trademarks belong to their owners.</li>
          </ul>

          <h2>AI can be wrong</h2>
          <ul>
            <li>Briefs, stories and courses are written by AI from the posting you provide. They can contain mistakes or omissions.</li>
            <li>Every claim is labelled: <em>from the posting</em>, <em>general knowledge · verify</em>, or <em>fictional example</em>. Check important facts with the employer before you rely on them.</li>
            <li>People, dialogue and numbers in scenes marked “Fictional example” are invented to teach, and do not describe real people or events.</li>
          </ul>

          <h2>Your key, your costs</h2>
          <ul>
            <li>New videos and courses run on your own Anthropic or OpenAI API key. You are responsible for any charges on your account and for following your provider’s terms.</li>
            <li>We never store your key. See the <Link href="/privacy">privacy notice</Link>.</li>
          </ul>

          <h2>Fair use</h2>
          <ul>
            <li>Use job postings you are allowed to view. Don’t use Career Ready to collect postings in bulk, or to submit content that is unlawful or confidential.</li>
            <li>Don’t try to disrupt the service or use it to reach private networks.</li>
          </ul>

          <h2>Third-party services</h2>
          <p>
            Career Ready relies on Anthropic, OpenAI, Microsoft’s text-to-speech service and Vercel. Their availability and
            terms are outside our control, and narration may fall back to your browser’s voice.
          </p>

          <h2>As is</h2>
          <p>
            This prototype is provided as is, without warranties of any kind. To the extent the law allows, its authors are
            not liable for decisions made using it.
          </p>

          <h2>Open source</h2>
          <p>
            The animation engine is our open-source Continuous-Learning-Video project (Apache-2.0). Credits for all
            reused work are on the <Link href="/about">how it works page</Link> and in the{" "}
            <a href="https://github.com/TahaDali/career-ready">GitHub repository</a>.
          </p>
        </div>
        <SiteFooter />
      </main>
    </>
  );
}
