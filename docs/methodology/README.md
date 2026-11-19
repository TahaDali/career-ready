# Methodology pack: everything the code and the AI need to know

This folder writes down the method and the style behind your Continuous-Learning-Video skill and
your best courses (Axios Salesforce BA, Axios AI Fellow). It's written so that:

- **the AI inside the app** writes lessons the way your courses are written
- **Claude Code** builds the visuals and pages the way your courses look, **with or without** your open-source repo

| File | What it captures | Used by | Plan A (repo allowed) | Plan B (no repo) |
|---|---|---|---|---|
| [01-teaching-method.md](01-teaching-method.md) | Organization-first teaching, value chain, causal spine, investigation pattern, meaningful motion, analogies, truth labels, fiction rules, candidate evidence, first 90 days/growth, practice questions, narration voice | **Every AI call** (shared system-prompt preamble) | ✔ | ✔ |
| [02-research-method.md](02-research-method.md) | Exact subject, evidence map, value/work/money chain, unknowns; optional web research; ingest rules | Story/brief call (Part A), ingest code (Part C), optional research mode (Part B) | ✔ | ✔ |
| [03-visual-language.md](03-visual-language.md) | The "Axios edition 2" house style: frame, furniture, colour meanings, state code, type roles and floors, composition, motion grammar, camera, transitions, cast anatomy, glyph anatomy, part variation, badge, rail | Recipe authoring (A) / **building the mini-engine (B)** | guide | **spec** |
| [04-scene-recipes.md](04-scene-recipes.md) | The 9 recipes + fallback with exact layout, choreography and minimum spans; lesson structure | M3 recipes | ✔ | **spec** |
| [05-narration-and-timing.md](05-narration-and-timing.md) | Beat-sheet thinking, estimated timing, the speech clock, voices, captions, spoken numbers | M3b clock and player | ✔ | ✔ |
| [06-course-page-spec.md](06-course-page-spec.md) | Landing, job page, course page (the AI Fellow page), player block, mobile and accessibility | M4, M5 | port + check | **spec** |
| [07-quality-review.md](07-quality-review.md) | Server validators, runtime guards, the 5-minute sentence-end check, honest claims | M2b/M5a validators, M6 review | ✔ | ✔ |
| [08-plan-b-no-repo.md](08-plan-b-no-repo.md) | When to switch, revised timings, paste-ready M1-B / M3-B / M5-B prompts, disclosure wording | Only if needed | — | ✔ |

## How it's wired into the build

- **M0** copies this folder to `docs/methodology/` in the app repo.
- **M2b/M5a:** each AI system prompt =
  - `01-teaching-method.md` (after its `---`)
  - plus `02-research-method.md` Part A (story call only)
  - plus the call's own file in `app-prompts/`
- **M3** recipes follow 03 and 04; the clock follows 05.
- **M4/M5** pages follow 06.
- **M6** review follows 07 §3.

## Sources (pre-existing work, disclose it)

- `~/.claude/skills/continuous-learning-video/references/*`: research methodology, chapter structure, storytelling framework, teaching case, candidate evaluation, editorial and motion review, visual direction, design system, beat sheet, production, review and delivery, player accessibility (skill v1.3.0, Apache-2.0)
- `~/Desktop/COffix/axios-salesforce-ba/authoring/visual-system.md` (the newsletter-editorial system)
- `~/Desktop/COffix/axios-ai-fellow/authoring/{design-brief,world-brief,review-brief}.md` and `player/` (latest edition, Nov 9)
