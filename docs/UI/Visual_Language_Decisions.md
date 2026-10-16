# Visual Language — Decisions & Open Items

The [Tone & Creative North Star](Tone_North_Star.md) ends with six questions for "the look-and-feel task." This tracks where each one actually stands — in the code (checked 2026-09-18) **and** in the design studies done as claude.ai artifacts (Sept 12–15, recorded here 2026-09-25) — so the UI track has a real starting line instead of six blank questions.

Update this file as decisions get made — it's the working record for the UI track, the way [Chapter_Map.md](../Story/Chapter_Map.md) is for the Story track.

> **Code vs. design.** As of 2026-09-25, *none* of the design studies below has been ported into `website/src/`. Where this file says "decided," it means decided in design; the code still reflects the original gold-on-near-black, Georgia-stack look.

---

## Design studies (claude.ai artifacts)

These are private artifacts in Bob's claude.ai gallery. They're working prototypes (drag/slider/keyboard; the Astrolabe also reads a real phone compass), not static mockups.

| Date | Artifact | What it is | Outcome |
|------|----------|-----------|---------|
| 09-12 | [The Gilt Frame Visual Language](https://claude.ai/artifact/UmfsCPaudmct2eTJftukSR) (Draft II) | Full visual-language plate book: two lights, palettes, type specimen, materials, motion principles, in-situ phone mocks, keep/retire list | **Foundation.** Established "one world, two lights," gilt-as-accent, and the Garamond pairing (see #1–#3 below) |
| 09-12 | [The Order's Astrolabe](https://claude.ai/artifact/M63hTH2JqoF3KXciFiTHnV) | Ch. I compass puzzle, full screen, first Field-mode attempt: north-up fixed dial, pivoting gilt needle, Chicago waymark at 255° W, hold-to-lock, live `deviceorientation` | Superseded stylistically by Placard; its **interaction model** (fixed north-up dial, needle pivots, tolerance arc, hold to lock) carried into every later study |
| 09-14 | [Four Compass Vibes](https://claude.ai/artifact/AjuW39wVgvQZbM8AVwowGU) | "The Compass, in four hands" — same engine, four skins. Dark: **The Night Circus**, **Candlelight**. Light: **The White City**, **Dusk on the Lake** | Steampunk and an ornate French take were retired before this round as off-tone. **Candlelight chosen** for the Gallery surface (2026-09-25) |
| 09-15 | [Field Compass Studies](https://claude.ai/artifact/6TJmnBZSnB6xzP5Xw93oLf) | Four daylight-only skins with a *Simulate midday glare* toggle: **The White City**, **Plein Air**, **Museum Placard**, **The Sundial** | **Museum Placard chosen** for the Field surface |
| 09-15 | [Field: The Verification](https://claude.ai/artifact/EgTVYc9wBqsSzyrmU4FZEZ) | MultipleChoice mechanic in Placard: in-character question, big tappable answer cards, quiet wrong-answer withdrawal, "light gathering" confirmation | Placard **"locked"** per the artifact's own header; defines the Field button/card/question primitives |
| 09-15 | [Field: The Waypoint](https://claude.ai/artifact/Q6dofLH7MSWtEXavsuhbrQ) | FindByGps mechanic in Placard: heading-up arrow, distance readout, geofence arrival | Placard reused; raises the **heading-up vs north-up** question (open items) |

### Museum Placard — the locked Field tokens

From the Verification/Waypoint artifacts (the source of truth until ported):

| Token | Value | Role |
|-------|-------|------|
| `ground` / `ground-lo` | `#efe9db` / `#e5ddce` | Screen ground (with faint laid-paper noise) |
| `raise` / `raise-hi` | `#faf5ea` / `#fffdf6` | Cards, answer buttons |
| `ink` / `ink-dim` / `ink-faint` | `#1e1b16` / `#4c463a` / `#79705a` | Text tiers |
| `brass` / `brass-bright` / `brass-deep` | `#7a5f22` / `#b58a34` / `#584614` | The one gold "guest" — confirmations, primary CTA, waymark |
| `line` / `line-strong` | `#cbbb9c` / `#9a8a66` | Hairlines, card borders |

### Candlelight — the chosen Gallery register

Chosen 2026-09-25 over The Night Circus: the same dark, warmed — "the tenderness underneath." Values from the Four Compass Vibes artifact; reconcile with Draft II's Gallery palette (Nocturne/Bitumen/Umber) when porting — they're the same family, Candlelight is the warmer tuning.

| Token | Value | Role |
|-------|-------|------|
| ground | radial `#241708` → `#140d06` → `#0b0704` | Lamplit ground, warmest at the top-centre |
| text / dim | `#efdcbc` / `#b79f78` | Ink tiers |
| accent | `#e0aa5a` | Confirmations, the gold guest |
| ring / tick | `#3a2c1a` / `#4a3826` | Quiet structure |
| tick-major / cardinal | `#c99a52` / `#d8b46a` | Emphasised structure |
| glow | `rgba(255,214,140,.95)` | Solve halo only |

Placard rules shown in the studies: 56px+ touch targets, bold ticks and cardinals (600 weight), nothing glows or breathes except the confirmation, wrong answers withdraw quietly ("the Order never announces failure"), in-character CTAs ("The way opens," "Report to the Council," never "Submit").

---

### 1. The dark ground and gold accent ratio

**Status: decided in design (Draft II); code still at the old values.**

Code: `website/src/components/ui/tokens.ts` and `globals.css`'s `@theme` establish near-black (`--color-bg: #1a1816`) with a gold opacity ramp (`gold` → `gold03`), all driven by one dial (`colorBases.gold` / `--gold-rgb`).

Design: Draft II keeps the dark ground but renames it the **Gallery** (dusk/indoor) surface — Nocturne `#12100e`, Bitumen `#1b1611`, Umber `#241d15`, Canvas ink `#e7dbc4`, Ash `#8f8471` — and demotes gilt to a signature accent: "If a screen reads as 'gold,' it's overspent." It explicitly retires "flat gold-on-#0A0A0A with a neon text-shadow glow." It also adds **The Sight** — a reserve of broken Impressionist colour (rose madder `#c56a6a`, cobalt violet `#7d72ad`, viridian `#4e7a63`, blood `#8b2500`) used *only* for reveals.

### 2. The daylight mode

**Status: decided in design — Museum Placard. Not implemented.**

Draft II reframed daylight as the **Field** surface ("plein air"), assigned by *where the screen is used*, not by a system light/dark toggle: Field = compass, geofence/waypoint, on-site verification, the map; Gallery = landing gate, Oracle, Journey/Chronicle, letters. This matches the Tone doc's framing (stepping out of the Order's shadowed world into the bright real one).

Four Field skins were glare-tested; Museum Placard won and was used to build two full component studies (tokens above). Code still has no light surface at all — `prefers-color-scheme` appears nowhere in `website/src/`.

### 3. The type system

**Status: decided in design; not in code.**

Every study since Draft II uses **Cormorant Garamond** (display, council voice in 300 italic) + **EB Garamond** (reading text) + a letter-spaced system sans used *only* as museum wall-label microtype, plus a mono for ciphers ("BEARING 255° W"). Draft II's keep list calls the Garamond pairing "the part you liked," and its retire list includes "Georgia standing in for the display face." This also brings the web app in line with the printed letters (#6).

Code still uses `Georgia, 'Times New Roman', serif` in `tokens.ts` and `globals.css`.

### 4. The Marker as the hero symbol

**Status: implemented in code, matches canon — but the design studies drifted.**

`website/src/components/ui/MarkerSVG.tsx` renders the Foundation Bible (§7) Marker: two crossing S-curves forming the hourglass, a falling grain. Gold/dark/white assets exist under `website/public/marker/`.

Drift to fix when porting: Draft II's crest is a **gilt frame with a central dot**, not the Marker. The compass studies do echo the Marker's "grain of light" in the waymark. The Marker should stay the hero symbol; the frame crest should not come across into code.

### 5. Motion

**Status: principles decided in design; existing components still need the judgment pass.**

Draft II's motion principles: *Gallery* — one lamp, a slow warm glow; *Field* — "daylight holds still," nothing glows or breathes, the only motion is the needle answering the world; *Reveal* — things resolve from soft to sharp, never pop; *Threshold* — the seal breaks once. The compass studies implement the solve as a ~1s hold on target, then a 0.85s eased settle of the needle onto the bearing with a halo — the "light gathering and settling" bar from the Tone doc.

Code: `UnlockAnimation`, `OrbAnimation`, `CompletionCountdown`, `puzzleSolveAnimation.ts` (under `website/src/components/game/ui/`) haven't yet been reviewed against these principles. Note the tension: Field says nothing glows, but the existing solve ceremony is glow-based — decide per surface.

### 6. The physical artifacts

**Status: ahead of the web app; now aligned with the design studies.**

The letter templates (`website/src/config/letters/*.html`) already use Cormorant and EB Garamond, wax-seal imagery, and an ivory/parchment register. Draft II's materials plate (gilt leaf, canvas weave, wax & seal, laid paper) is the bridge that makes a text message and a sealed envelope "feel like they came from the same hand."

---

## Open decisions

1. ~~**Gallery (dark) register.**~~ **Decided 2026-09-25: Candlelight** (over The Night Circus). Tokens above.
2. ~~**Heading-up vs north-up.**~~ **Decided 2026-09-25: both, by job.** Navigation (FindByGps / `CompassRose` navigate mode) is heading-up — "ahead" fixed at top, arrow points the way to walk. The bearing puzzle (AlignBearing / `CompassRose` align mode) is north-up — fixed dial, needle pivots, because the answer is an absolute bearing. Both share the same ring, grain-of-light waymark, and Placard styling so they read as one instrument; only what rotates differs.
3. ~~**Which surface each existing screen gets.**~~ **Decided 2026-09-25: surface follows where she is, not the component.** Each quest component has a default surface; a step in `config.ts` may override it with an optional `surface: "field" | "gallery"` (not yet in the schema — add it when porting).

   | Default | Screens |
   |---------|---------|
   | **Field** (Museum Placard) | `FindByGps`, `AlignBearing`, `MultipleChoice`, `FindByText` — all on-location. `FindByText` runs inside museums, not in sun, but she's on-site and reading at a glance, so it stays Field |
   | **Gallery** (Candlelight) | `PassphraseEntry` (the Summons), Oracle, Journey (incl. `/journey/beginning`), public `/moment/[token]` share page |
   | **Per step** | `RevealNarrative` — defaults to Gallery; set `surface: "field"` when the reveal happens on location (e.g. Ch. 1's reveal right after the compass solve, still in the garden) |
4. **Port order (agreed 2026-09-25, not started).** Pause for review after each of steps 1 and 2.
   1. **Type + Gallery retune** — load Cormorant Garamond + EB Garamond via `next/font`; retune the existing dark tokens in `tokens.ts` / `globals.css` to Candlelight. Lowest risk, touches every screen.
   2. **Surface system** — add the Placard token set behind a `data-surface` attribute; add optional `surface` to the step schema in `config.ts`; `QuestRunner` applies each step's surface.
   3. **Pilot: `CompassRose`** — Placard, both modes (heading-up navigate, north-up align); judge in the Component Gallery, then outdoors on a phone.
   4. **Remaining Field components** — `FindByGps`, `MultipleChoice`, `FindByText`, using the Verification/Waypoint artifacts as reference.
   5. **Motion pass** — existing animations against the principles in #5 (Field doesn't glow).

## Clickable prototype — [The Sparrow's Phone](https://claude.ai/artifact/XF3qWpybeMNi52Q47EepKx)

A 12-screen click-through of the Summons and Chapter I across both surfaces (built 2026-09-26). Screen numbers (#1–#12) are the reference for feedback. Decisions and follow-ups from review:

- **Marker rendering (#2).** The Marker is drawn as a hairline at every size (≈2px frame, ≈1px curves in screen pixels), not scaled up from the 40×52 icon, and never carries a blur glow; warmth goes in a lamp *behind* it. The intro ceremony is one pass (frame draws from top centre both ways, curves top to bottom, sand, then the grain), no loop. **Follow-up:** re-export `website/public/marker/*` (incl. `marker-v3-gold-512.png`, the MMS image) from the hairline Marker once approved.
- **Intro copy (#2), decided 2026-09-26.** Enrolled players see **"You see what others do not."** Unenrolled visitors keep "You are not the one." Code today: `/` shows `IntroPage` to unenrolled visitors only (enrolled redirect to `/pursuit`), and the enrolled replay at `/journey/beginning` shows no line — add the line there, and decide whether first entry after enrollment (`/e/[token]`) plays the ceremony.
- **One instrument (#6 / #8).** FindByGps and AlignBearing share one dial (rings, ticks, cardinals, grain waymark, needle). #6 heading-up: the rose turns with her, a fixed pointer marks ahead, the needle points at the destination. #8 north-up: the rose holds, the needle is her heading. The bearing's destination is never labelled on the dial (no "CHICAGO").

## Design system — [The Gilt Frame](https://claude.ai/artifact/Bmn1pWA3g4Mc9gwtmQBjKc) (2026-10-03)

The decisions above, consolidated into one design-system artifact for the whole site: brand book, tokens, type scale, and 19 components with live previews. It's now the reference for porting.

- **Four surfaces, one token set.** Every colour is a semantic token (`ground`, `raise`, `ink`, `ink-dim`, `ink-faint`, `line`, `line-strong`, `accent`, `cta-*`, `grain`, `glow`…) with a value per surface, so a component changes surface by changing `data-surface`. Gallery and Field values come from The Sparrow's Phone (09-26), the newest study.
- **Decided 2026-10-03: the system spans the whole site, in three tiers.** On top of Gallery and Field:
  - **Ledger** for `/join`, `/terms`, `/privacy`, `/contact`: the letter's cardstock (`#f4eee2`) and ink-brown (`#2e231a`), brass links, boxed form fields, plain language. Replaces the gray Tailwind compliance look.
  - **Desk** for `/the-order/*`: warm neutrals, system sans, brass primary actions in place of `admin-blue`, status pills that always carry a word. Test = `info` (cobalt violet), Live = `danger` (blood).
- **Contrast flags (source values, kept):** `ink-faint` on the Gallery (4.2:1) and Field (4.06:1) grounds; Gallery `line-strong` (2.0:1).
- **To retire when porting:** the `shake`, `screenFlash` and `supernovaFlash` keyframes, `OptionButton`'s red `wrong` state, the body `text-shadow`, the Georgia stack, `MarkerSVG`'s `pulse-soft`.
- Port steps 6 (Ledger) and 7 (Desk) are added after the existing five; see the artifact's "In the codebase" section.

## Summary — where to start

The design is further along than the code suggests. Type, the two-surface model, the Field style (Museum Placard) and the Gallery style (Candlelight) are all decided; none of it has been ported. All four open decisions are settled; the next step is port step 1 (type + Candlelight retune).
