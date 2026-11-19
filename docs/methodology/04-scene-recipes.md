# Scene recipes: exact layout and choreography

> **How it's used:**
> - **Plan A:** implement each recipe with the existing templates, kit and runner.
> - **Plan B:** implement each from scratch on the mini-engine.
>
> Either way, the AI only fills `data`; the recipe owns the drawing. Coordinates are in the
> 1280×720 scene frame; see [03-visual-language.md](03-visual-language.md) for tokens and roles.

## Shared conventions

**Cues and timing**

- **Cue words.** `cue(word)` returns the time that word is spoken, estimated from the scene span (section 2 of 05). If a word is missing or repeated, use the first match after the previous cue. If there's no match at all, spread the reveals evenly from 15% to 85% of the span. **Never throw.**
- **Default reveal time:** an element's cue is the first word of its label as it appears in the narration.

**Every scene, on top of its recipe**

- The **section head** (6 px rule at y 100, headline at y 146) appears with the scene: the rule draws 0.5 s, then the headline rises word by word.
- A **slow push** runs 1.00 → 1.02 across the span.

**Entrance, focus and exit**

- Entrance: elements slide 18 px and fade in (0.5 s).
- Focus: the active element is at 100%, past ones dim to 35%.
- Exit: the scene's content fades as the next transition starts, unless the next scene is a `carry`.

**Highlighter and fiction**

- The highlighter goes on the single `emphasis` / `highlight` word, at its cue, and retracts 1.5 s later or at the next cue.
- The fiction badge shows while `scene.fiction` is true.

## 1. `opener`: the lesson's first frame

`data: { kicker, title, highlight, glyph }`

- **Layout (Part I, hero right):** a 420×330 hero box at (720, 200) holds the glyph at hero scale; the faint part motif sits behind it. Kicker at (80, 220) in `kicker` + inkBlue; title from (80, 290) in `display` (fit 104 → 64, max 2 lines, width 600); an italic `accent` subtitle under it. Hero left/below are mirrored per part.
- **Choreography:**
  - 0.2 s: the kicker slides in
  - 0.5 s: title words rise one by one (0.22 s stagger)
  - 1.3 s: the subtitle resolves from blur
  - the `highlight` word gets the highlighter band at its cue
  - the hero glyph builds from 0.8 s (outline draws, then the inside fills)
- **No section head** on the opener. No fiction badge unless the hero is fictional. Minimum span 4.5 s.

## 2. `statement`: the one claim the lesson hangs on

`data: { text (≤ 14 words), emphasis }`

- Centred at (640, 360), `headline` 56, max width 1040, up to 2 lines.
- The text is first **ghosted** (14% opacity); each word fills to ink as it's spoken; the `emphasis` word gets the highlighter at its cue.
- Optional **carry**: if the next scene shows the emphasis word as a label, that word travels there (0.8–1.2 s) and everything else fades.
- Minimum 3 s.

## 3. `org`: who the organization serves

`data: { center: {label, glyph}, around: [{label, relation, glyph | castKey}] (3–5) }`

- The centre glyph (building/campus/hall/issue) sits at (640, 380) at about 220 px tall, with its label below in `label`.
- 3–5 stakeholders on an arc: positions spread across x 180–1100 at y 260–470 (left half and right half, alternating high/low). Each is a cast figure (s 0.55), a bust, or a glyph, with its label below.
- **Choreography:**
  - the centre builds at 0–0.6 s
  - each stakeholder enters at its label's cue
  - its **connector draws** from the centre to it (0.6 s)
  - the `relation` (≤ 3 words, `note`, inkSoft) appears along the connector's midpoint
  - the newest connector is ink, older ones dim to rule colour
- Minimum 16 words of narration.

## 4. `flow`: how value is delivered, and where the role sits

`data: { steps: [{label, glyph}] (3–5), active, token }`

- Steps are evenly spaced along y 400 across x 170–1110. Each is a glyph (about 110 px) with its label below.
- An arrow chain connects them; arrows draw step by step.
- The **progress rail** shows the steps as "01 LABEL · 02 LABEL …" (2 words max each).
- **Choreography:**
  - each step appears at its cue
  - a **token** (a document/card/coin glyph, 46 px) travels along the arrows as steps are named
  - at the `active` step's cue: that step lifts 8 px and gets a heavier outline, a `kicker` tag "THIS ROLE" appears above it, and the other steps dim to 40%
- When the next scene is also a `flow` with the same steps, **carry**: keep the layout and only move the token or active step.
- Minimum 16 words.

## 5. `record`: one object whose fields fill in (the signature Axios move)

`data: { header, title, rows: [{field, value}] (2–4), state }`

- The record card is 520×(120 + 56·rows) px, centred at (640, 390):
  - an ink header band (46 px) with the header in white CAPS `kicker`
  - the title row in `key`
  - field rows: the key in `note` inkSoft on the left, the value in `label` bold on the right (`mono` for IDs/dates)
- Optional: the `state` swatch before the title (`proposed` hatched, `confirmed` solid, `decided`).
- **Choreography:**
  - the card pops in (0.55 s)
  - each row's key appears just before its value's cue, and **the value lands on its spoken word**
  - the field being spoken gets the highlighter
- If the narration says the state changes ("signs", "checked", "approved"), the swatch/fill **transitions from hatched to solid on that word**.
- To the left, an optional cast figure (s 0.7) holding a prop, if a cast member is named.
- Minimum 14 words.

## 6. `cast`: a short exchange

`data: { people: castKey[] (1–3), line: {who, text (≤ 12 words)}, prop?: glyph }`

- 1 person: the figure at x 360, feet at y 470, with a speech bubble right of the head (max width 520) and the optional prop glyph at x 900.
- 2–3 people: spaced across x 260–1020, facing each other.
- **Choreography:**
  - figures slide in from their side (0.5 s, stagger 0.3)
  - the speaker's mouth animates while the `line` is spoken (estimated span: the line's words within the narration)
  - the bubble pops at the line's cue, and its words fill as spoken
  - listeners stay at full strength; earlier speakers dim to 35% when a later one talks
- Always `fiction: true`. Minimum 12 words.

## 7. `compare`: before/after, option A vs. B, required vs. preferred

`data: { title, left: {title, rows: string[] (2–4)}, right: {title, rows: string[] (2–4)}, takeaway }`

- A dashed hairline divider at x 615 from y 220 to y 520.
- Left column at x 120, right at x 680: a column title in `kicker`, rows in `label` 92 px apart starting at y 300.
- The takeaway in `accent` italic at the bottom (y 545), centred.
- **Choreography:**
  - the divider draws (0.8 s)
  - left rows appear at their cues, then right rows at theirs
  - at the cue of the losing side, its rows dim and any **replaced** value gets an ink strike (red strike **only** if it's *wrong*)
  - the winning side gets a green tick per confirmed row
  - the takeaway resolves last
- Minimum 6 s / 16 words.

## 8. `stepper`: an ordered procedure (an investigation, a 30/60/90 plan)

`data: { title, steps: string[] (3–5) }`

- The title in `title` at (120, 230).
- A vertical rail at x 630 from the first step to the last; step dots (9 px) on the rail, 110–148 px apart; step text to the right in `label`.
- **Choreography:**
  - the rail draws (0.7 s)
  - each step appears at its cue and its dot fills ink
  - a travelling token slides down the rail to the current step
  - completed steps settle to inkSoft
- Minimum 5 s / 14 words.

## 9. `question`: retrieval practice on the night ground

`data: { prompt (≤ 16 words), options: string[3–4] (≤ 4 words each), correct, reason (≤ 10 words) }`

- **Entered by a wipe** into night (`#0F1B33`). The rail hides.
- A kicker "CHECK YOURSELF" with the highlighter at (130, 150), white text.
- The prompt in `headline` white at (130, 230), max width 1000, ghost-filled as spoken.
- Options in a row (or a 2×2 grid if long) at y ≈ 420, each a raised card (`#18274A`) with a white `label`.
- **Choreography:**
  - the prompt fills as spoken
  - options appear just after the prompt's last word (they're visible before the answer)
  - **after the narration ends, a 3 s pause**, shown as a small countdown ring
  - then the correct option gets the highlighter (ink text on yellow); wrong options get a red strike and dim
  - the `reason` appears below in `accent` italic white
- The fiction badge stays on if the question uses invented people or numbers.
- Minimum 6 s / 14 words (plus the 3 s pause).

## 10. `fallback`: never a blank frame

If a recipe errors or its data is invalid:

- the section head with the scene `headline`
- one large glyph (the scene's first glyph, or `doc`) centred at (640, 380)
- the narration's first 8 words in `note` below it
- a console warning

## 11. Lesson structure on top of the recipes

**Scene order and transitions**

- **Order:** the scenes play in order as regions of one world, 1700 px apart left to right.
- **Transition per scene:**
  - `carry` if the next scene shares its hero (same flow steps, same record)
  - `iris` into a scene the narration says "zooms in" on, or a detail
  - `wipe` into `question`
  - otherwise `pan`

**Chrome**

- **Rail:** the lesson's `flow` steps if it has a flow scene; otherwise 2–4 short section words derived from scene headlines.
- **Fiction badge:** union of the scenes with `fiction: true`, split around real scenes.

**After the video**

- The **practice panel** of the page (not the video) holds the lesson's main question plus the extras, with per-option feedback (see 06).
