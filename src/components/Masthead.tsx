import Link from "next/link";

export default function Masthead({ edition, children }: { edition?: string; children?: React.ReactNode }) {
  return (
    <header className="masthead">
      <div className="shell masthead-inner">
        <Link href="/" className="brand" style={{ textDecoration: "none", color: "var(--ink)" }}>
          <span className="brand-mark" aria-hidden="true" />Career Ready
        </Link>
        <span className="edition">{edition ?? "Understand any job in one minute"}</span>
        {children}
      </div>
    </header>
  );
}
