# Course page and landing page specification

> **How it's used:**
> - **Plan A:** port the AI Fellow `player/` page and keep this behaviour.
> - **Plan B:** build it from this description (no copied code).
>
> **Source:** the AI Fellow course page (the "newsroom graphics page") and the skill's mobile and accessibility contract.

## 1. Page tokens (same as the videos)

```
--paper #ffffff  --paper-lo #f1f2f4  --ink #0d0f13  --ink-soft #3c424b  --rule #d2d6dc
--ink-blue #22406e  --cobalt #2350c8  --signal #ffd60a  --signal-soft #fff0a0
--wrong #e0242d  --good #06855a  --fiction #6a3bef  --night #0f1b33
fonts: Inter (UI), Instrument Serif (display accents), JetBrains Mono (metadata)
body: 17px/1.6 Inter, ink on paper; border-top: 6px solid cobalt
```

**Controls**

- Square corners, a 2 px ink border, bold 0.875rem, min 44×44 px.
- Hover: signal-soft fill. Pressed: ink fill with white text.
- Focus: a 3 px ink outline plus a 7 px yellow ring.

**Text**

- Links are ink-blue with a 2 px underline offset 4 px; hover is a signal-soft background.
- Kickers, metadata and the brand are JetBrains Mono, uppercase, tracked +0.14em.

## 2. Landing page (`/`)

**Masthead:** the brand "CAREER READY" (mono caps, with a 12 px cobalt dot in a 2 px ink ring) on
the left, and the edition line "Understand the job before the interview" on the right.

**Hero** (one column, max 1288 px):

- eyebrow "LEARN ANY JOB IN ONE MINUTE" (mono)
- H1 "Understand any job in one minute." (Inter ExtraBold, clamp(48px, 8vw, 104px), tight tracking, ink)
- a deck (Inter Medium, ink-soft): "Paste a job link. Watch a short animated story of the organization and the role. Then build a full course with practice questions if you want more."

**Form**

- A large input "Job link (or paste the description)": a textarea that grows when text is pasted.
- Provider segmented control (Claude | ChatGPT), a model select, an API key field (password, show/hide), and "Remember on this device".
- One primary button: **Make my video**.
- Under it: "Your key goes only to your chosen AI provider for this request. We don't store it."

**Example link:** "Watch an example", which loads `/samples/demo.json`.

**While generating:** a progress panel, a mono step list that ticks honestly:

1. Reading the posting
2. Understanding the organization
3. Writing your story
4. Drawing the scenes

Plus an elapsed-time counter. No fake percentages.

## 3. Job page (`/job/[hash]`)

1. **Intro.** Eyebrow "JOB STORY · <EMPLOYER>"; H1 = the role title; the job context line in mono ("<Employer> · <Role> · from the posting, read <date>", or "from the description you pasted"); the disclosure "Independent educational material. Fictional work examples are simulations."
2. **The player** (section 5), playing lesson "00".
3. **Job brief:**
   - two columns on desktop: "What they need" (responsibilities) and "What they ask for" (Required / Preferred, as separate lists)
   - keyword chips (outline chips, mono)
   - "Likely interview questions" (3 disclosure rows, each with "A strong answer shows…")
   - "What the posting doesn't say" (unknowns)
   - the organization context, with "from the posting" / "verify" tags
4. **Primary action:** a large **Build my full course (10 lessons)** button, with the estimate under it ("about 3–6 minutes · about $1.50 with your key · lesson 1 plays as soon as it's ready").

## 4. Course page (`/job/[hash]/course`): the AI Fellow page structure

**Masthead:** brand + edition line + a **Course contents** button (opens the drawer).

**Intro**

- An eyebrow (mono)
- The H1 course title (huge, tight Inter ExtraBold)
- The tagline as the intro deck (right column on desktop)
- A meta line: "10 LESSONS · ~22 MIN | NARRATED LESSONS · OPTIONAL CAPTIONS | 0 / 10 COMPLETE"
- The job context line, underlined in signal
- The disclosure, with a violet square bullet

**Workspace (current lesson)**

- `lesson-meta`: "PART II · HOW THE WORK FLOWS" (left) and "LESSON 3 / 10 · 2:10" (right), in mono.
- `h2` lesson title (tabindex −1, focused on lesson change); `goal` paragraph.
- The **player** (section 5); while the lesson isn't ready yet: "Writing this lesson…" with its status.
- **Playback row:** speed select, Captions toggle, Course contents, "Read transcript" link, **Mark complete** button.
- **Navigation:** Previous / Next lesson (disabled at the ends).

**Learning support**

- **Practice** (a `details` that opens after the video ends, or on demand):
  - the question as `h3`
  - options as a **radio group** (one in the tab order; arrows move and wrap; Home/End; Space/Enter selects)
  - the selected state shown with a mark, not only colour
  - feedback specific to the selected option in a polite live region
  - the selection clears when the lesson changes
- **Transcript** (`details`): one jump point per scene (headline + narration); click seeks.
- **Key terms** (a glossary `dl`).
- **Coverage:** "Covers: R2, Q1, P3" → the requirement texts.

**Course drawer** (a modal `dialog`)

- progress text and a `progress` bar
- the parts overview
- objectives
- the glossary
- the lesson list grouped by part, each with a status (not written / writing / ready / completed ✓)
- a reset-progress button with confirmation
- **Focus behaviour:** focus stays trapped inside; Escape or Close returns focus to the opener; choosing a lesson focuses its heading.

**Persistence:** progress and answers are saved under a storage key unique to the job hash.

## 5. The player block (shared by the job and course pages)

- A 16:9 canvas (1280×720 internally; scaled to the container; devicePixelRatio aware) in a 2 px ink frame.
- **Poster state:** the lesson's opener frame with a large square ▶ button.
- **Captions** under the canvas (not over it).
- **Controls:** play/pause (Space), previous/next scene (←/→), a scene scrubber of segments with headline tooltips, a voice select, speed (0.9 / 1 / 1.15), Captions (C), and an elapsed / total time display.
- **Errors:** a friendly line plus Retry, which never leaves a blank frame.

## 6. Mobile and accessibility (must pass at M4/M5 gates)

**Viewports:** 320, 375–390, 768, short landscape 568×320, and desktop.

**Layout**

- No page-wide horizontal scroll.
- Controls wrap; buttons stay ≥ 44 px.
- Body text ≥ 1rem.

**Keyboard and focus**

- A skip link: "Skip to the current lesson".
- Visible focus everywhere.
- The drawer's focus trap and Escape behave as described.
- Live regions for feedback and progress exist before they update.

**Contrast and motion**

- Contrast 4.5:1 for text, 3:1 for large text and control boundaries.
- `prefers-reduced-motion` gives fades only.
- In forced-colors mode, focus stays visible.

**Text and language**

- All course strings are rendered as text, never HTML.
- `lang` is set on the document.
