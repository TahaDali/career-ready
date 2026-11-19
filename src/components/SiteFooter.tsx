import Link from "next/link";

// One footer for every public page: the tagline, the honest build note, and the site's links.
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>Understand the organization. Then the work. Then yourself in it.</p>
      <nav aria-label="Site" className="footer-links">
        <Link href="/make">Make a video</Link>
        <Link href="/job/sample">Sample video</Link>
        <Link href="/job/sample/course">Sample course</Link>
        <Link href="/about">How it works and credits</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <a href="https://github.com/TahaDali/career-ready">Source on GitHub</a>
      </nav>
      <p className="footer-note">
        Built at BAU Innovate 2026 on our open-source Continuous-Learning-Video engine. Facts come from the posting;
        examples are labelled fictional. Not affiliated with any employer.
      </p>
    </footer>
  );
}

// Masthead links for the public pages.
export function SiteNav() {
  return (
    <nav aria-label="Main" className="site-nav">
      <Link href="/#how">How it works</Link>
      <Link href="/job/sample/course">Sample course</Link>
      <Link href="/make" className="site-nav-cta">Make my video</Link>
    </nav>
  );
}
