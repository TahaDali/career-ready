# Narration, beats and timing

> **How it's used:** for building the speech clock, captions and player (M3b), and for
> understanding why the content prompts set word budgets.
>
> **Source:** the skill's beat-sheet, cue-driven timing, spoken-numbers and production references, adapted for live browser speech.

## 1. The beat: what every scene must know (the beat-sheet idea)

Your original pipeline wrote a beat sheet before animating. Career Ready keeps the same thinking
inside each scene's JSON:

| Beat-sheet field | Where it lives in Career Ready |
|---|---|
| Narration (exact spoken text) | `scene.narration` |
| Concept (what the viewer must understand) | implied by `headline` + narration |
| Metaphor / graphical elements | `recipe` + `data` (glyphs, people, records) |
| Animation behaviour (what changes, on which word) | the recipe's choreography + cue words = the labels as spoken |
| Emphasis (the one marked word) | `emphasis` / `highlight` |
| Transition in (carry, pan, iris, wipe) | derived by the runner (04, section 11) |
| Silent meaning (what you'd understand with the sound off) | the human check in 07 |
| Fiction on/off | `scene.fiction` |

## 2. Estimated timing (no measured word timings in a live app)

- **Speaking rate:** 2.5 words/s at speed 1.0 (natural voices run about 2.4–2.8 words/s).
- **Scene span** = max(recipe minimum, words ÷ (2.5 × speed)) + 0.6 s closing pause. The question scene adds a 3 s answer pause.
- **Word times inside a scene:** spread across the speech part of the span, weighted by word length + 2 (longer words take longer). This is the "estimated" method the original engine already uses when no measured timings exist.
- **Cue lookup:** the normalised word (lowercase, apostrophes removed, punctuation removed except `%` and `$`). For a repeated word, take the occurrence after the previous cue.
- Lessons are laid out end to end. The 1-minute story is about 6–7 scenes ≈ 55–75 s.

## 3. The speech clock (browser voice)

1. Before playing, compute all spans (above) and write `start`/`end` onto the scenes.
2. A `requestAnimationFrame` loop advances `t` by real elapsed time × 1 (the speed is already in the spans).
3. When `t` crosses a scene's start, `speechSynthesis.speak(new SpeechSynthesisUtterance(scene.narration))`, with the chosen voice and rate = speed.
4. **Voice longer than the span:** hold `t` at `end − 0.05` until the utterance's `onend`, then continue.
5. **Voice shorter than the span:** just continue; the closing pause absorbs it.
6. **Pause/seek:** `speechSynthesis.cancel()`, move `t`, and resume speaking from the scene that contains `t`.
7. **Browser quirks:** wait for `voiceschanged`; call `cancel()` before each `speak()`; run a 10 s `pause()+resume()` keep-alive (Chrome cuts long utterances); require a first user tap (iOS).
8. **No voice or muted:** the same clock runs; captions carry the meaning.

**Voice choice:**

1. Microsoft Edge "Microsoft Ava/Andrew/Emma Online (Natural)": the same Microsoft neural family your courses used (en-US-AvaMultilingualNeural).
2. macOS local voices (Samantha, Daniel, Ava (Premium)).
3. Anything English.

Avoid "Google …" network voices in Chrome: they cut off after about 15 s and report no word
events. **Demo in Edge.**

## 4. Captions and transcript

- **Captions** under the canvas (never painted into it): the current sentence, the current word underlined, emphasis words bold. Toggle with C; on by default.
- **Transcript:** one jump point per scene, made of its **headline** (a distinct event label) + the full narration. Clicking seeks to that scene's start.
- The caption text is exactly the narration (no paraphrase).

## 5. Spoken numbers

- A number appears on screen only when it's said, and shows exactly the value said. No count-ups through unsaid values.
- Write numbers in narration as they'll display ("$180,000", "twelve placements" → the label "12 placements").
- Totals stay conserved through motion: if 12 placements split 8 + 4, show both parts and the total.

## 6. Rules the content prompts enforce (and why)

| Rule | Why (engine reason) |
|---|---|
| Minimum words per recipe | Each template needs a minimum spoken span to play its choreography (compare 6 s, question 6 s, stepper 5 s, opener 4.5 s, statement 3 s) |
| Labels ≤ 4 words and spoken in the narration | Each label is revealed on its spoken cue, and the screen stays under 24 words |
| One `emphasis` word, present exactly | The highlighter must land on a real spoken word |
| Distinct change verbs ("signs", "blocked", "checks") | Give the state change a unique cue word to land on |
| An establishing sentence before a change | The object must be on screen before it changes |
| A short closing beat per scene | The last reveal needs ~0.5 s to be read before the transition |
| Headline ≠ first sentence | The transcript jump labels must be distinct and meaningful |
