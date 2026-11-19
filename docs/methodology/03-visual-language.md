# Visual language: "Axios edition 2" (the house style, written out)

> **How it's used:**
> - **Plan A** (engine allowed): the guide for writing the recipes on top of the existing engine. Most of this is already enforced by it.
> - **Plan B** (no repo): **the specification Claude Code builds the mini-engine from**, with no code copied.
>
> **Source:**
> - your Axios Salesforce BA "newsletter editorial" visual system
> - the AI Fellow design brief (latest, Nov 9)
> - the skill's design system and visual direction

## 0. The idea in one paragraph

The video is set like a **newspaper graphics desk** would set it:

- a bright white page, strong near-black ink, heavy tightly tracked sans-serif headlines
- rules and columns carry the structure
- objects and people are **flat editorial illustrations with ink outlines and real internal detail**
- **each colour means exactly one thing**

One idea per frame. Text appears when it's said. Focus moves by dimming, not deleting. One world
with a travelling camera. Every transition is motivated.

## 1. Frame and page furniture (1280×720, fixed in screen space)

| Zone | Position | Holds |
|---|---|---|
| Top band | y ≈ 50 (line), x 40–1240 | **Only** the progress rail (left) and the fiction badge (right) |
| Section rule | y = 100, x 80–1200, 6 px ink | Opens each section |
| Headline | baseline ≈ y 146, x 80 | The scene headline (role `headline`) |
| Content band | x 54–1226, y 196–574 | The illustration world (keep it below y ≈ 190, so camera pushes never touch the head) |
| Safe area | 40–1240 × 88–587 | Text must stay **≥ 12 px inside it** |
| Caption band | y > 595 | Captions only; nothing the viewer must read |

Video and page are deliberately **single-theme light**. No grain, no vignette, no shadows:
objects separate from the page by **ink outlines (2–2.5 px)**.

## 2. Colour: one meaning each

| Token | Hex | Meaning (and nothing else) |
|---|---|---|
| `paper` / `paperHi` | `#FFFFFF` | The page and object faces |
| `paperLo` / `wash` | `#F1F2F4` | Quiet panel tint; placeholder lines and ghost rows inside glyphs |
| `ink` | `#0D0F13` | Type, outlines, heavy rules, header bands of records |
| `inkSoft` | `#3C424B` | Secondary type: kickers on paper, sub-lines, field keys |
| `mute` | `#8A9099` | Dimmed or placeholder; dashed "unknown" outlines |
| `rule` | `#D2D6DC` | Hairlines, gridlines, part motifs |
| `inkBlue` (accent) | `#22406E` | Annotations (arrows, underlines, scribbles), the iris disc, kicker accents |
| `cobalt` | `#2350C8` / `#4A64A8` | A "checked/real" state; chart bars; links |
| **`signal`** | **`#FFD60A`** (soft `#FFF0A0`) | **Only the thing being spoken about right now**: a highlighter band behind a word or value. Text on it is ink. It lands on the word and retracts when the narration moves on. Never a state, region or fill |
| `wrong` | `#E0242D` (soft `#FCE0E1`) | **Only** wrong, blocked, rejected: red strikes, red X, a red frame on an unsupported claim |
| `good` | `#06855A` (soft `#D8F1E5`) | **Only** correct or confirmed: ticks, checkmarks |
| `fiction` | `#6A3BEF`, white type | **Only** the fiction badge |
| `night` | `#0F1B33` (+ `#18274A` raised, `#2A3B60` rules) | The practice-question ground |

### The state code for Career Ready (defined once)

| State | Look | Means |
|---|---|---|
| `proposed` | slate `#4E5A6B`, **hatched inside a dashed outline, never solid** | Possible, drafted, claimed, not yet real or checked |
| `confirmed` | cobalt `#2350C8`, solid | Signed, checked against a source, real |
| `decided` | umber `#7A4E2D`, solid | A named owner decided |

An **unknown** isn't a state: draw it as an empty dashed outline with "?".

**Never use yellow, red, green or violet for a state.** Text on a solid state fill is white;
text on a hatched state sits on a small white plate.

## 3. Type: you choose a role, the system owns face and size

Faces (all SIL Open Font License, free on Google Fonts): **Inter** (Medium, SemiBold, Bold,
ExtraBold), **Instrument Serif** (Regular, Italic), **JetBrains Mono** (Regular, Bold).

| Role | Face / size (px at 1280×720) | Use |
|---|---|---|
| `display` | Inter ExtraBold 104 → fitted down to 64, tracking −2% | Lesson opener title only |
| `headline` | Inter ExtraBold 56 (44 for long heads) | Scene headlines, kinetic claims, question prompt |
| `title` | Inter ExtraBold 44 | Object titles, big claims |
| `deck` | Inter Medium 34 | A standfirst under/next to a head |
| `accent` | Instrument Serif Italic 38–70 | The qualifying phrase, quotes, the opener's subtitle |
| `label` / `body` | Inter SemiBold 30 / 32 | Primary object labels, names |
| `key` | Inter ExtraBold 30 | Callout keys, names inside objects |
| `note` | Inter Medium 28 | Sub-lines, row keys, captions under glyphs |
| `kicker` | Inter ExtraBold 28, CAPS, tracking +12% | Small heads, column keys ("GOOGLE SEARCH", "LESSON 3 · AI AT AXIOS") |
| `numeral` / `numeralMd` / `numeralSm` | Inter ExtraBold 96 / 64 / 48 | Key quantities |
| `mono` | JetBrains Mono 28 | IDs, field values, dates ("IO-2291", "OCT 15") |
| `small` / `tick` | Inter Medium/SemiBold 24 (tick in CAPS) | Units and axis ticks only |
| `chrome` | Inter Bold 18, CAPS, tracked | **Only** the rail and the fiction badge |

**Floors** (never smaller on screen, after camera zoom):

- **28 px** for anything carrying meaning
- **24 px** for units, ticks and glyph-internal IDs
- **18 px** for the rail and badge only

Glyph detail is **drawn, not lettered**: bars and lines inside a document stand for text. Real
words appear inside a glyph only at full size.

## 4. Composition rules

- **One hero per beat,** filling a third or more of the safe area. Things that aren't active **dim to about 32–40%** or leave.
- **Hand focus over:** brighten the next element before dimming the last.
- **At most 24 content words on screen** at any moment (labels above 50% opacity count; chrome doesn't). Full sentences live in captions, not on screen.
- **Callouts are key, then value:** the key lands first, the value lands on its spoken word ("Stage  Proposal", "Amount  $180,000").
- Keep **≥ 20 px** between neighbouring chips/cards. Text never sits on text. Connectors pass **behind** objects and labels.
- No sparse or static stretch longer than about 2 s unless the narration is a deliberate pause. Fill it with the next definition, the parts of the sum, or what the object lists.
- **Never** use newsletter chrome as page furniture: no "Why it matters", "By the numbers", "The big picture", logos or brand colours.

## 5. Motion grammar (durations and easings)

| Movement | Duration | Easing |
|---|---|---|
| Word reveal (rise / slide / ghost-fill) | 0.35–0.6 s | ease-out (expo) |
| Chip/badge pop | 0.55 s; the opacity reaches full only after the scale passes 100% | back-out |
| Group entrance | 0.5 s, slide 18 px + fade | expo-out |
| Focus dim/brighten | 0.4–0.6 s to about 35% | ease-in-out |
| Highlighter sweep (left → right band) | 0.45–0.55 s on the spoken word; retract 0.3 s when narration moves on | ease-in-out |
| Carry of a hero object to the next scene | 0.8–1.2 s; the word holds ≤ 0.3 s, then moves and changes role at the midpoint | ease-in-out |
| Camera pan between regions | 1.0 s, light motion blur | ease-in-out |
| Slow push across a scene | the scene's span, zoom 1.00 → 1.02 (max 1.06) | linear |
| Reframing push onto a detail | 0.7–1.0 s, after fading labels it would carry off-frame | ease-in-out |
| Iris / wipe | 1.0 s, full frame | ease-in-out |
| Transition window | starts 0.3 s before the next scene, ends 0.7 s after it starts (inside the closing pause) | — |
| Line drawing (connectors, rules) | 0.6–0.8 s, path length 0 → 1 | ease-in-out |
| Strike-through (wrong) | 0.35 s red line across, then the item dims | ease-out |

**Timing rule:** every on-screen word that repeats the narration appears **on the moment it's
spoken**. Display-only text (kickers, axis labels) appears with a short 0.09–0.2 s per-word
stagger after the cue that introduces it.

## 6. Camera and transitions

- **One world:** a lesson's scenes are regions of one large canvas, laid out left to right about 1700 px apart. The camera travels; it never moves without a reason.
- **Choose the transition by the relationship:**

| Transition | Use when | How it looks |
|---|---|---|
| **carry** | the same object continues | Same region, no transition; the hero stays and builds |
| **pan** (default) | the next idea sits beside this one | The camera glides 1.0 s to the next region; the destination's content **starts drawing as the pan starts** (never arrive on a blank page) |
| **iris** | the next idea grows from a specific point | An ink-blue disc grows from that point to fill the frame, then opens onto the next region |
| **wipe** | a change of mode, e.g. into practice | A slanted full-frame wipe into the **night** ground |

- The rail fades out before a wipe into night, and back after.

## 7. Annotation, like a teacher

At most **one** annotation at a time, timed to the word that names it:

- the highlighter band
- an underline or scribble in inkBlue
- an arrow
- a red strike for wrong

The highlighter retracts when the narration moves on.

## 8. People: the cast

Flat editorial figures in the same ink style as the glyphs, **about 300 px tall at hero size**
(200–320 px while speaking), feet on a baseline.

- **Anatomy:**
  - round head in a skin tone, hair shape by style, two dot eyes, a mouth line that **opens while the person speaks**, with small speech marks
  - neck; torso shaped by the top (blazer / shirt / sweater / cardigan / tee) in the top colour, with an inner-shirt V
  - two-segment arms with round hands; trousers or a skirt; ink shoes
  - 2–2.5 px ink outlines throughout
- **Look fields** (fixed per person for the whole course):

| Field | Allowed values |
|---|---|
| `skin` | skin1 `#F3D4B9`, skin2 `#E1AE86`, skin3 `#C48A5E`, skin4 `#986343`, skin5 `#5E3B29` |
| `hair` | hairBlack `#1D1B1F`, hairDark `#3B2B23`, hairBrown `#6D4A33`, hairAuburn `#87472A`, hairSand `#C8A876`, hairGrey `#A3A7AD` |
| `style` | short, side, crop, wavy, curly, puff, bun, bob, long, ponytail, bald |
| `top` | blazer, shirt, sweater, cardigan, tee |
| `topColor`, `inner`, `bottom` | charcoal `#30353D`, navy `#2B3950`, slate `#4E5A6B`, denim `#5A7898`, sage `#93AC93`, olive `#7B8458`, sand `#D8C7A5`, stone `#BCC2CA`, oat `#EDE6D8`, white `#FFFDF8` |
| `lower` | trousers, skirt |
| extras | glasses, beard (stubble or beard), badge |

- **Poses:** stand, point, pointUp, present, raise, wave, hold, hips, shrug, think, cross, sit, lean. Gestures blend from one pose to another on their cue.
- **Props:** laptop, tablet, paper, form, folder, phone, mug.
- **Labels:** the name in `key` and the role in `note`, 30–90 px below the feet (feet at y ≤ 470 when labels show).
- **Dimmed figure:** draw it opaque in colours mixed toward the page, so it reads as one faded person, not overlapping transparent parts.
- **Never** draw a real person. Recurring people never change their look.
- **Generic people** (readers, staff) are simpler **busts**: an outline head and shoulders. "Lit" ones are solid ink; unlit ones are outlined. Use them in rows or grids for groups and counts.

## 9. Object vocabulary (glyphs and their internal detail)

Every glyph is flat, white-faced, ink-outlined, with **meaningful internal detail**:

| Glyph | Anatomy |
|---|---|
| **document** (`doc`) | Portrait rectangle with a folded top-right corner; one bold title line + 3–4 wash lines; optional mono ID at the bottom; optional stamp |
| **record card** (`record`) | Wide card with a **solid ink header band in white CAPS** ("OPPORTUNITY", "TICKET", "CASE"); a bold title row; 2–4 field rows (key in inkSoft on the left, value in ink bold on the right, mono for IDs/dates); a field can take the highlighter; the state swatch before a value |
| **newsletter/publication** (`issue`) | A page with a black title bar (white label), black headline bars, an image block with a mountain line, a cobalt "SPONSORED" band when relevant |
| **building** / **campus** / **hall** | Flat facade: pediment or flat roof, grid of windows (tinted cobalt-soft), a door (tinted sage); a hospital gets a cross |
| **folder** | Tabbed folder outline, with a document peeking out |
| **card / tile** | Small rounded tile with 2 lines; in rows to show many items; dashed when unknown |
| **envelope** | Envelope with a V flap; a letter rising out for "sent" |
| **calendar** | Header band + date grid; one cell highlighted |
| **clock** | Circle with ticks and two hands |
| **gate** | Two posts and a bar that lifts (open) or stays down with a red X (blocked) |
| **lock** | Padlock body + shackle; open or closed |
| **magnifier** | Circle lens + handle; for review/inspection |
| **coin / banknote** | Disc with an inner ring and a drawn $ stroke (no lettering) |
| **pin** | Map pin; in rows for "13 local newsletters" |
| **chart** | Simple cobalt bars or a line on hairline gridlines; tick labels in `tick`; no 3-D |
| **timeline** | Horizontal ink axis, CAPS mono date ticks, a thick band or arrow for a period |
| **scale/balance** | Beam, post and two pans, tipping on its cue |
| **pipe/route** | A rounded horizontal channel with dotted traffic; narrowing = less flow (with a ghost of the old width) |
| **person mark** | The bust described in section 8 |
| **chip** | A pill: solid ink with white text (a name or entity), or outline |
| **tick / cross** | Green check / red X, drawn as strokes |
| **placeholder** | Dashed mute outline with "?" for an unknown |

## 10. Part variation: the only device allowed to vary

Each course part opens with its own layout and a faint hairline motif behind the hero:

| Part | Layout | Motif |
|---|---|---|
| I The organization | hero right | columns (newspaper column rules) |
| II How the work flows | hero left | ledger (ruled lines) |
| III The work | hero below | grid (a record's field grid) |
| IV The hiring decision | hero right | form (margin + lines) |
| V The first 90 days | hero left | calendar (month ticks) |
| VI Growth | hero right | columns |

Colour meanings, type roles and furniture never vary.

## 11. The fiction badge

A violet block with white CAPS chrome text, "FICTIONAL EXAMPLE", right-aligned on the top-band
line.

- **On** whenever invented people, companies, numbers or questions are on screen (even dimmed, including the practice panel).
- **Off** over posting facts.
- Split its windows around real material; never leave it on across it.

## 12. The progress rail

Short CAPS steps on the top-band line (e.g. "01 FIND · 02 SELL · 03 DELIVER · 04 BILL", or
"TRAFFIC · MOVES · THE LINE"), 2 words max each.

- The current step is an ink block with white type that sweeps in; done steps settle to inkSoft; future steps are mute.
- It must end ≥ 20 px before the fiction badge.
- It's hidden on the night ground.
