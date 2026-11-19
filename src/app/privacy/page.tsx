import Link from "next/link";
import Masthead from "@/components/Masthead";
import SiteFooter, { SiteNav } from "@/components/SiteFooter";

export const metadata = { title: "Privacy · Career Ready" };

export default function Privacy() {
  return (
    <>
      <Masthead edition=" "><SiteNav /></Masthead>
      <main className="shell">
        <section className="intro">
          <p className="eyebrow">Privacy notice</p>
          <h1>Your key and your jobs stay yours</h1>
        </section>
        <div className="prose">
          <p className="updated">Last updated November 19, 2026 · Prototype</p>
          <p>
            Career Ready is a student prototype built at BAU Innovate 2026. It has no accounts, no advertising and no
            analytics trackers. This notice explains what happens to the information you give it.
          </p>

          <h2>Your AI key</h2>
          <ul>
            <li>When you make a video or a course, your browser sends your Claude or OpenAI key to our server with that request. The server passes it straight to Anthropic or OpenAI and forgets it. <strong>We never store or log your key.</strong></li>
            <li>In your browser, the key is kept in session storage, which is cleared when you close the tab. If you tick “Remember my key on this device”, it is kept in this browser’s local storage instead, until you clear it.</li>
            <li>Charges for AI use go to your own Anthropic or OpenAI account. Their privacy terms apply to what they receive.</li>
          </ul>

          <h2>The job posting</h2>
          <ul>
            <li>The job link you paste is fetched by our server to read the posting. Pasted posting text is sent the same way.</li>
            <li>The posting text is sent to the AI provider you chose, to write the brief, the story and the course.</li>
            <li>Please don’t paste anything confidential. A public job posting is all Career Ready needs.</li>
          </ul>

          <h2>Narration</h2>
          <ul>
            <li>By default, each scene’s narration text is sent through our server to Microsoft’s online text-to-speech service to be read aloud. Only the narration text is sent, never your key.</li>
            <li>You can choose “Browser voice” in the player to use your device’s own voice instead.</li>
          </ul>

          <h2>What stays in your browser</h2>
          <ul>
            <li>Your jobs, briefs, courses, lesson progress and voice choice are saved in this browser’s local storage. They are not uploaded to us.</li>
            <li>To delete them, clear this site’s data in your browser settings.</li>
          </ul>

          <h2>Hosting</h2>
          <p>
            The site runs on Vercel. Like any web host, Vercel processes standard request data, such as IP addresses, to
            deliver pages and keep the service secure.
          </p>

          <h2>Questions</h2>
          <p>
            Career Ready is open source. You can read exactly how it handles data, or raise a question, in the{" "}
            <a href="https://github.com/TahaDali/career-ready">GitHub repository</a>. See also the <Link href="/terms">terms of use</Link>.
          </p>
        </div>
        <SiteFooter />
      </main>
    </>
  );
}
