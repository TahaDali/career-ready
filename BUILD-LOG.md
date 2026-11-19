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
| … | Later commits: build log, deploy, final fixes |

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
| Landing page, job page and brief, 10-lesson course page, about page | `src/app/**/page.tsx`, components | about 700 |
| Frame-by-frame layout audit (dev tool) | `src/app/dev/audit` | 67 |

About **2,800 lines written today**, against about **2,150 lines reused** from our own earlier engine.

## Tools

Built with **Claude Code** (Anthropic) for AI-assisted coding. Every change was reviewed and tested by the
author. Inside the product, the user's own Claude or OpenAI key writes the brief, storyboards and
questions. See the AI disclosure in the [README](README.md).
