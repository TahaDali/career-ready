# Credits and sources

Career Ready was built at BAU Innovate 2026 (Nov 19). Organizers confirmed that open source,
earlier projects and other sources may be used if cited. This file lists everything we reused.
**Add a line here whenever something new is used.**

## Our own earlier work (pre-existing, reused)

| What | Where it came from | License | How we used it |
|---|---|---|---|
| Continuous-Learning-Video animation engine: design system, templates, illustrated cast, motion, canvas | github.com/TahaDali/Continuous-Learning-Video | Apache-2.0 (LICENSE and NOTICE kept) | Ported to run live in the browser |
| Extended engine parts: `kit.cjs`, `glyphs.cjs`, `ai.cjs`, `runner.cjs` | Our earlier Axios AI Fellow course edition (unpublished) | Our own work | Copied into `src/engine/`, adapted for the browser |
| Course page: masthead, lesson list, practice, progress | Our Axios AI Fellow course page (`player/`) | Our own work | Ported to a React page with a live canvas player |
| Course-design method: organization-first lessons, storytelling, analogies, question writing, visual style | Our `continuous-learning-video` Claude Code skill and course projects | Our own work | Written into `docs/methodology/` and used in the AI prompts |

## Third-party

| What | Source | License |
|---|---|---|
| Inter font (Rasmus Andersson) | rsms.me/inter | SIL OFL 1.1 |
| Instrument Serif font | Google Fonts | SIL OFL 1.1 |
| JetBrains Mono font | jetbrains.com/lp/mono | SIL OFL 1.1 |
| Next.js | nextjs.org | MIT |
| Anthropic TypeScript SDK | github.com/anthropics/anthropic-sdk-typescript | MIT |
| OpenAI Node SDK | github.com/openai/openai-node | Apache-2.0 |
| zod | zod.dev | MIT |
| cheerio | cheerio.js.org | MIT |
| schema.org JobPosting vocabulary | schema.org/JobPosting | CC BY-SA 3.0 |
| Web Speech API (browser voices, fallback) | Built into the browser | n/a |
| msedge-tts client | github.com/Migushthe2nd/MsEdgeTTS | MIT |
| Narration voices (Ava, Andrew, Emma, Brian Multilingual Neural; Sonia) | Microsoft Edge Read Aloud speech service, the same voices as our course pipeline | **Permission for public or commercial use NOT verified.** Used for the hackathon prototype only; before any launch, move to licensed Azure AI Speech or keep the browser-voice option |
| Hosting | Vercel | n/a |

## AI tools

- **Claude Code** (Anthropic): AI-assisted coding. Every change was reviewed by our team.
- **Claude API / OpenAI API:** used inside the product with each user's own key.

## Added during the day

| What | Source | License | Used for |
|---|---|---|---|
| AI Fellow course-page stylesheet (`player/style.css`) | Our earlier Axios AI Fellow edition | Our own work | Ported as `src/app/course.css` for the job and course pages |
| Engine runner and kit (`runner.cjs`, `kit.cjs`, `glyphs.cjs`) | Our earlier Axios AI Fellow edition | Our own work | Copied; small browser changes are marked "Career Ready" in the files |
| Greenhouse and Lever public job-board APIs | developers.greenhouse.io, github.com/lever/postings-api | Public APIs | Reading job postings |
