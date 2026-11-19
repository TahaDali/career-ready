# Build log: what was built at BAU Innovate 2026, and what was reused

**Career Ready was built on Thursday, Nov 19, 2026, during the hackathon.** The commit history is the
record: this repository was created that morning, and every commit after it is from the same day.

## Timeline (from `git log`)

| Time (EST) | Commit |
|---|---|
| 10:24 | Repository created (`create-next-app`) |
| 10:41 | First working platform: job ingest, AI layer, schemas, recipe library, browser port of the engine, player, job page, course page. Our pre-existing engine files were copied in at the same time (listed below) |
| 10:42 | Player clock without voice, mobile controls |
| 11:11 | Microsoft neural narration, timed by measured word boundaries |
| 11:14 | Player clock keeps running in background tabs |
| 11:35 | Smaller structured-output grammar + plain-JSON fallback (after the first real API test) |
| 11:42 | One narrator voice per video |
| 11:47 | Near-valid AI answers are repaired, not rejected |
| 11:57 | Never mix narrator voices |
| 12:09 | Layout faults fixed after a frame-by-frame audit of real videos |
| 12:14 | This build log |
| 12:25 | Live on Vercel (https://career-ready-sand.vercel.app); demo link in the README |
| 12:40 | Engine fixes found while writing the sample course: Part VI opener, 5-step lists clear the captions, wider organization labels |
| 12:40 | Hand-written 10-lesson sample course, playable with no key |
| 12:47 | Landing page, `/make`, privacy and terms pages |
| 13:05 | Simpler landing page |
| 13:26 | Design pass: every scene of the 11 sample videos reviewed; one-minute sample rewritten; record and opener fixes; dev contact sheet |
| 15:00 | Dev frame renderer used to make the 90-second demo video; this timeline update |

Run `git log --stat` to see every change with its time and files.

## Reused: our own earlier work (cited in [CREDITS.md](CREDITS.md))

Organizers confirmed that open source, earlier projects and other sources may be used **if cited**.

| File | Lines | Source | Changed today? |
|---|---|---|---|
| `src/engine/design.cjs` | 679 | Our Continuous-Learning-Video engine (public, Apache-2.0), AI Fellow edition | Browser runtime added, a duplicate-ID check warns instead of throwing (marked "Career Ready") |
| `src/engine/templates.cjs` | 412 | Same engine | No |
| `src/engine/illustrations.cjs` | 310 | Same engine | No |
| `src/engine/kit.cjs` | 153 | Our earlier Axios AI Fellow course edition | Practice panel layout fixes (marked) |
| `src/engine/glyphs.cjs` | 216 | Same edition | `$` coin (marked) |
| `src/engine/ai.cjs` | 112 | Same edition | No |
| `src/engine/runner.cjs` | 110 | Same edition | One `require` path (marked) |
| `src/app/course.css` | 158 | AI Fellow course page stylesheet | Ported as-is |
| `public/fonts/*` | | Inter, Instrument Serif, JetBrains Mono | No (SIL Open Font License) |
| `docs/methodology/`, `docs/app-prompts/`, `docs/ARCHITECTURE.md` | | **Design notes and prompts written before the event** (our teaching method and visual style, written down so the code could follow them) | Small edits |

The engine's `LICENSE` and `NOTICE` are kept in `src/engine/`. To compare, see
[github.com/TahaDali/Continuous-Learning-Video](https://github.com/TahaDali/Continuous-Learning-Video).

## Written during the hackathon

| Area | Files | Lines |
|---|---|---|
| Recipe library: AI storyboard → animated scenes (9 scene types + fallback) | `src/engine/recipes.cjs`, `career-setup.cjs` | 347 |
| Engine running live in the browser | `src/engine/browser.js` | 36 |
| Player: speech clock, Edge voice sync, captions, controls | `src/components/CanvasPlayer.tsx`, `src/lib/timing.ts`, `src/lib/useEdgeVoice.ts` | 480 |
| Narration voices with measured word timings | `src/lib/tts.ts`, `src/app/api/voice` | 120 |
| Bring-your-own-key AI layer (Claude + OpenAI), JSON fallback | `src/lib/ai.ts` | 140 |
| Data contract and repair of AI output | `src/lib/schemas.ts`, `src/lib/validate.ts` | 244 |
| Job ingest (Greenhouse, Lever, schema.org, page text) | `src/lib/ingest.ts`, `src/app/api/ingest` | 100 |
| Prompts assembled from the method notes | `src/lib/prompts.ts`, `scripts/build-prompts.mjs` | 61 |
| Job page and brief, 10-lesson course page, about page | `src/app/job/**`, `src/app/about`, components | about 600 |
| Landing page, `/make` form, privacy and terms pages, site navigation and footer | `src/app/page.tsx`, `src/app/make`, `src/app/privacy`, `src/app/terms`, `src/components/SiteFooter.tsx` | about 400 |
| Sample job and hand-written 10-lesson sample course (no key needed) | `src/lib/sample.ts`, `src/lib/sample-course.ts` | about 680 |
| Dev tools: frame-by-frame layout audit, engine scrubber, scene contact sheet, 1080p frame renderer for the demo video | `src/app/dev/*` | about 280 |

About **4,000 lines written today**, against about **2,150 lines reused** from our own earlier engine.

Also made today, outside the repository: the 90-second demo video (rendered from a real AI-made job with the dev frame renderer), the slide deck and the one-page summary.

## Tools

Built with **Claude Code** (Anthropic) for AI-assisted coding. Every change was reviewed and tested by the
author. Inside the product, the user's own Claude or OpenAI key writes the brief, storyboards and
questions. See the AI disclosure in the [README](README.md).
