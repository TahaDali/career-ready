# Quality review: automatic checks + a 5-minute human check

> **How it's used:**
> - Section 1 is what `src/lib/validate.ts` enforces (M2b, M5a).
> - Section 2 is what the player and engine must defend against at runtime (M1/M3).
> - Section 3 is your manual check before the demo (M6).
>
> **Source:** the skill's editorial and motion review, the design system's hard rules, and the Axios sentence-end review brief.

## 1. Server-side validation (before anything reaches the player)

Each check either passes, or triggers **one repair retry** with the problems listed. After
that, the result is accepted with console warnings.

**Structure**

- [ ] Story lesson id `00`, 6–7 scenes. Course lessons `01`–`10`, 8–12 scenes.
- [ ] The first scene is an `opener`. The story's last scene is a `question`.
- [ ] Scene ids are unique kebab-case. Every recipe's `data` matches its shape.

**Narration**

- [ ] Story 120–170 words; lessons 220–320 words.
- [ ] Per-recipe minimum words: opener 12 · statement 9 · org 16 · flow 16 · record 14 · cast 12 · compare 16 · stepper 14 · question 14.
- [ ] Every `emphasis` / `highlight` word appears exactly in its narration (or title).
- [ ] Each data label is ≤ 4 words and each value ≤ 3 words.
- [ ] Headline ≤ 6 words, and not equal to the narration's first sentence.

**Truth**

- [ ] The first fictional scene's narration contains "fictional".
- [ ] Every scene showing a cast member has `fiction: true`.
- [ ] Brief ids are unique (R*, Q*, P*). The outline covers every id, or excludes it with a reason.

**Practice**

- [ ] 3–4 options; `answer` in range; `optionFeedback.length === options.length`.
- [ ] Across the course, correct answers aren't all in one position.
- [ ] Flag (warn, don't fail) a correct option that's always the longest or always the shortest.

**Cast**

- [ ] 2–3 people, each look field from the allowed enums, no two identical looks.

## 2. Runtime guards (engine and player)

- **Never a blank canvas.** Each scene's draw is wrapped; on error it draws the fallback scene (section head + one glyph + the headline) and logs a warning.
- **Never throw on AI text.** Use safe cues: a missing cue word falls back to evenly spread reveals.
- **Spans fit the choreography.** Each scene's span is at least its recipe minimum (opener 4.5 s, compare 6 s, stepper 5 s, question 6 s, statement 3 s); stretch the span instead of failing.
- **Density.** Truncate labels to 4 words with "…". Keep at most 24 content words on screen (dim earlier items below 50% opacity).
- **Audit checks only warn** in the browser: type floors, edges, word budget.
- **Speech never blocks the picture.** If the voice fails, the clock runs silently, with captions on.
- **Registries reset per job** (cast, states, parts), or the page reloads when the job changes.

## 3. The 5-minute human check, per generated video (do it for the demo job)

Pause at the end of each sentence and ask:

1. **Does the screen show what this sentence just said, no more and no less?** No detail answers a question the narration only asks later.
2. **Is there stale context?** A label left over from the previous beat shouldn't read as the cause of the current one.
3. **Is the fiction badge right?** It should be on whenever an invented person, company, number or question is visible (even dimmed), and off over posting facts.
4. **Real people:** none drawn, none quoted.
5. **Numbers:** shown only as spoken; totals add up; the same number stays the same across lessons.
6. **Colour meanings:**
   - yellow only on what's being said now, and it retracts
   - red only for wrong or blocked
   - green only for correct
   - hatched = not yet real (a proposal or claim); solid = real (signed or checked)
7. **Legibility:** nothing cut at the edge, no text over text, nothing important in the caption area (bottom ~130 px), every label on screen for at least 0.5 s, readable at phone size.
8. **Practice:** the answer isn't visible before the question is asked; the highlight lands on the stated answer.
9. **Pace:** no stretch of more than about 2 s that's sparse or static without a reason.
10. **Silent test:** with the sound off, can you still tell what the objects are *doing*? If a scene is just labels appearing, regenerate it, or accept it knowingly.

Fix order when something's wrong:

1. regenerate that lesson
2. tighten the prompt rule that caused it
3. fix the recipe

Never hide a problem by deleting the badge or the label.

## 4. What the demo can honestly claim

- **Claim:** "generated from the posting; facts labelled; fictional examples labelled; reviewed by us for the demo job".
- **Don't claim:** factual accuracy for every job, learner comprehension, or accessibility certification. Technical checks don't prove teaching quality.
