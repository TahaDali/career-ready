import type { Metadata } from "next";
import "./course.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Career Ready: understand any job in one minute",
  description:
    "Paste a job link and your own AI key. Get a one-minute animated story of the job, a job brief, and an optional 10-lesson course with practice questions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
