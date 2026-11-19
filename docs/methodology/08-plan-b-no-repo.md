# Plan B: build everything without the open-source repo

> **When to switch:**
> - (a) the organizer says you can't reuse your own engine or course page, **or**
> - (b) the M1 engine spike isn't animating on the deployed URL by **11:30**.
>
> **What stays the same:**
> - the data contract (02 §4)
> - the teaching method and all AI prompts
> - ingest, the bring-your-own-key layer and the speech clock
> - the milestones from M2 on
>
> **What changes:** you build a small canvas engine and the course page **from the written specs in this folder**. No code is copied from the repo or the Axios projects.

## Adjustments to the main prompts on Plan B

- **M0:** skip the two commands that copy engine files and `docs/reference`. If they already ran, `git rm -r src/engine docs/reference public/fonts`. Still copy `docs/methodology` and `docs/app-prompts`.
- **M1-B:** start the prompt by creating `CLAUDE.md` with the same rules as M1 step 1, minus the `.cjs` line, plus: "no code may be copied from the Continuous-Learning-Video repo or the Axios projects; build from docs/methodology."
- **M2b:** take the cast enums (skin, hair, style, top, colours, poses, props) from the table in `docs/methodology/03-visual-language.md` §8, not from `illustrations.cjs`.
- **M3:** M3-B replaces M3a. M3b (speech clock) is unchanged; it just calls the Plan B `world.draw`.
- **M5:** M5-B replaces M5b. M5a (outline + lessons API) is unchanged.

## The approach

The original engine's power came from a few ideas, all written down in
[03-visual-language.md](03-visual-language.md) and [04-scene-recipes.md](04-scene-recipes.md):

- type roles with floors
- colour meanings
- cue-timed reveals
- focus by dimming
- a travelling camera
- motivated transitions
- an illustrated cast

A compact re-implementation of about 600–900 lines, written by Claude Code from those specs,
gets you 80% of the look. Use **plain Canvas 2D** (closest to the original output and the
speech clock), not SVG.

**Fonts:** load Inter, Instrument Serif and JetBrains Mono from Google Fonts (OFL) instead of the repo files.

## Revised time budget

| Milestone | Plan A | Plan B |
|---|---|---|
| M1 | Engine spike (port) 10:25–11:30 | **M1-B mini-engine core** (stage, type, colour, timing, camera, transitions), 10:25–11:45 |
| M2 | 11:30–12:30 | 11:45–12:45 (lunch moves to 12:45) |
| M3 | Recipes on the engine, 1:15–3:00 | **M3-B glyphs, cast and 9 recipes on the mini-engine**, 1:15–3:15 |
| M4 | 3:00–3:30 | 3:15–3:40 |
| M5 | Port the course page, 3:30–5:00 | **M5-B build the course page from 06**, 3:40–5:00 |
| M6–M7 | unchanged | unchanged |

**Cuts (in order) if Plan B runs late:**

1. Drop the `org` arc layout (use a row instead).
2. Drop the iris (use a pan).
3. Use simple busts instead of full cast figures.
4. Drop the `record` state transition (keep the field fill-in).

## M1-B: the mini-engine core (paste into Claude Code)

```text
We are NOT using any pre-existing engine code. Build a small Canvas 2D rendering engine from
the written specification in docs/methodology/03-visual-language.md (read it fully) and the
timing rules in docs/methodology/05-narration-and-timing.md. Plain TypeScript, no dependencies.

src/engine/
- tokens.ts: the colour tokens of section 2 and the Career Ready state code (proposed = slate
  hatched in a dashed outline, confirmed = cobalt solid, decided = umber solid); helpers
  mix(a,b,k) and soft(hex).
- type.ts: the type roles of section 3 (face, weight, size, tracking, caps) with floors
  28/24/18; role(name, {size}) never returns below the floor; fonts loaded via FontFace from
  Google Fonts CSS (Inter 500/600/700/800, Instrument Serif 400 + italic, JetBrains Mono
  400/700), awaiting document.fonts.ready before the first draw.
- easing.ts: linear, out, outExpo, inOut, outBack; seg(t, start, dur, ease) → 0..1; clamp; lerp.
- stage.ts: createStage(ctx, {night}) → S with:
  text(id, str, x, y, {role, color, align, maxWidth, alpha}) using measured widths and wrapping;
  sentence(id, words, x, y, {times, reveal:'rise'|'ghost'|'slide', role}) revealing each word
  at its time; markText (a highlighter band sweeping behind words, text stays ink); chip; card;
  rule(x1,x2,y,p,{weight}) and vrule; partial(path,p) for drawing lines; arrow; strike(box,p,
  {wrong}); underline; fade(alpha, fn); stateBox(state, x,y,w,h,{p}); swatch; hatch;
  checkmark; cross. Track visible content words per frame (warn when > 24) and warn when text
  is drawn below its floor or within 12 px of the safe area 40–1240 × 88–587 (console.warn,
  never throw).
- camera.ts: a world of regions 1700 px apart; camera keys {t,x,y,zoom} eased with inOut;
  slow push 1.00→1.02 per scene; pan of 1.0 s inside [next.start−0.3, next.start+0.7];
  fitCamera(box) for reframing; transitions iris(cx,cy,p) (an ink-blue disc that fills the frame,
  then opens) and wipe(p) (a slanted full-frame wipe into night).
- chrome.ts: sectionHead (a 6 px ink rule at y 100 drawing in 0.5 s, the headline at y 146 rising
  word by word), progressRail (top-band steps, current = ink block with white caps, done =
  inkSoft, future = mute; hidden on night), fictionBadge (a violet block, white caps "FICTIONAL
  EXAMPLE", right-aligned on the top band, fades 0.6 s).
- timing.ts: spans from word counts per docs/methodology/05 §2 (2.5 w/s × speed, recipe
  minimums, +0.6 s pause, +3 s for question); estimated word times weighted by length+2;
  cue(scene, word) that NEVER throws (fallback: even spread 15–85%).
- world.ts: draw(ctx, lesson, t) → finds the active scene(s), sets the camera, draws regions
  (the previous one during a pan), then the rail and badge on top. Each scene draw is wrapped
  in try/catch → a fallback scene.
A test page /dev/engine renders a hard-coded 2-scene lesson: a section head + a statement
with a highlighted word, then a pan to a second region with three chips appearing on cues
and the rail + fiction badge. A time slider and a play button.
```

**Gate (11:45):** `/dev/engine` on the deployed URL shows a white page, a heavy rule, an ExtraBold headline rising, the yellow highlighter sweeping on its word, and a smooth pan.

## M3-B: glyphs, cast and recipes (paste after M2)

```text
Using docs/methodology/03-visual-language.md sections 8–9 and
docs/methodology/04-scene-recipes.md, add to src/engine/:
- glyphs.ts: each glyph of section 9 as a function (S, id, x, y, scale, opts) drawing flat
  white faces with 2–2.5 px ink outlines and the internal detail described (document with a
  folded corner and bars; record card with an ink header band and field rows; building with a
  window grid and a door; envelope, calendar, clock, gate, lock, magnifier, coin, pin, chart
  bars, timeline, balance, pipe, chip, tick, cross, dashed "?" placeholder, person bust).
- cast.ts: an editorial flat full figure about 300 px tall at scale 1 per section 8: a round
  head in a skin tone, hair by style (short, side, crop, wavy, curly, puff, bun, bob, long,
  ponytail, bald), dot eyes, a mouth that opens while speaking (speaking 0..1 with a phase), a
  torso by top type and colour with an inner V, two-segment arms posed by name (stand, point,
  present, raise, wave, hold, hips, shrug, think, cross), round hands, trousers or skirt, ink
  shoes, an optional prop; name/role labels below the feet. defineCast(json) fixes each
  person's look; a dimmed figure is drawn opaque in colours mixed toward paper.
- recipes/*.ts: the 9 recipes + fallback exactly as laid out in docs/methodology/04 (positions,
  choreography, minimum spans, carry/pan/iris/wipe choices), all timing from cue(). Also
  /dev/recipes with one sample scene per recipe.
Quality bar: compare /dev/recipes against the screenshots described in 03 (white editorial
page, ink outlines, record cards with black header bands, a yellow highlighter only on the
spoken word, a violet fiction badge, people with faces). It must look designed, not like
generic boxes.
```

**Gate (3:15):** the 1-minute story plays end to end with the Plan B engine.

## M5-B: course page from the spec

```text
Build /job/[hash]/course from docs/methodology/06-course-page-spec.md sections 1, 4, 5 and 6
in React + plain CSS (no UI library). Keep every behaviour listed: masthead, intro meta line,
lesson workspace, playback row, previous/next, practice radio group with per-option feedback
and keyboard behaviour, transcript jump points, key terms, coverage, the course drawer as a
modal dialog with focus trap and Escape, progress saved per job in localStorage, and mobile
layouts at 320/375/768/568×320. Reuse the CanvasPlayer from the job page.
```

## What to say if you're on Plan B

- **Disclosure:** "Our course-design method comes from our earlier open-source project. Everything in this app, including the animation engine, was written today from our design notes."
- **Pitch line:** "We rebuilt our video engine in the browser today, so a job link becomes an animated lesson in about a minute instead of hours."
