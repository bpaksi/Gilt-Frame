# Visual Language — Decisions & Open Items

The [Tone & Creative North Star](Tone_North_Star.md) ends with six questions for "the look-and-feel task." This tracks where each one actually stands in the code today (checked 2026-09-18), so the UI track has a real starting line instead of six blank questions.

Update this file as decisions get made — it's the working record for the UI track, the way [Chapter_Map.md](../Story/Chapter_Map.md) is for the Story track.

---

### 1. The dark ground and gold accent ratio

**Status: implemented, matches the north star.**

`website/src/components/ui/tokens.ts` and `globals.css`'s `@theme` block already establish near-black (`--color-bg: #1a1816`) as the host, with a full gold opacity ramp (`gold` down to `gold03`) as the accent scale. This is a single-dial system — retune `colorBases.gold` / `--gold-rgb` and every derived token follows. Worth a deliberate pass to confirm gold is only ever used as "the glint that rewards attention" per the Tone doc, never as a field/background, but the mechanism is sound.

### 2. The daylight mode

**Status: not implemented. Open.**

No `prefers-color-scheme`, light theme, or outdoor-readability mode exists anywhere in `website/src/`. The Tone doc frames this as a story beat, not just accessibility ("she carries the Order's shadowed world in her pocket and steps out into the bright, impermanent, real one to do its work") — so this isn't a simple light-theme toggle, it needs its own design pass that earns that framing. This is the single biggest open item in the UI track.

### 3. The type system

**Status: not implemented — the Tone doc's premise here is aspirational, not current.**

The Tone doc says Cormorant (display) + EB Garamond (text) is "the working direction... already emerging." That's not accurate as of this check: `tokens.ts` and `globals.css` both still use `Georgia, 'Times New Roman', serif` — a system font stack, not Cormorant/EB Garamond. Those two typefaces *are* used, but only in the printed letter templates (`website/src/config/letters/*.html`), which are a separate, non-web deliverable. The live app's type system hasn't actually adopted them yet. Open item: bring the web app's type stack in line with the letters, or make a deliberate call that the web app and the physical artifacts use different (but harmonious) type systems.

### 4. The Marker as the hero symbol

**Status: implemented, matches canon.**

`website/src/components/ui/MarkerSVG.tsx` renders exactly what the Foundation Bible (§7) describes: two crossing S-curves forming the hourglass, a falling grain in the upper bulge. Gold/dark/white variants exist as both a React component and static assets (`website/public/marker/marker-v3-{gold,dark,white}.svg` + PNG exports at multiple sizes). This one's done — worth checking it's used consistently as *the* hero symbol everywhere the brand needs a mark, rather than only in scattered spots.

### 5. Motion

**Status: partially implemented. Needs a judgment pass, not a build-from-scratch.**

`UnlockAnimation`, `OrbAnimation`, `CompletionCountdown`, and `puzzleSolveAnimation.ts` already exist under `website/src/components/game/ui/`. What hasn't been done is checking them against the Tone doc's specific bar: "the puzzle-solve ceremony should feel like light gathering and settling, unhurried, earned. Never snappy, never gamey." That's a review-and-refine task in the gallery (`/the-order/gallery` → Game category), not new component work.

### 6. The physical artifacts

**Status: ahead of the web app, interestingly.**

The letter templates (`website/src/config/letters/*.html`) already use Cormorant and EB Garamond, wax-seal imagery, and an ivory/parchment register — closer to the Tone doc's "handmade object that sets the standard the screens have to live up to" than the web app currently is. Worth treating these as the reference when doing item 3 above, rather than designing the web type system from zero.

---

## Summary — where to start

The two genuinely open items are **#2 (daylight mode)** and **#3 (type system)**. Both are big enough to warrant their own design pass, and #3 has a clear reference already sitting in the letter templates. Everything else (color/gold ratio, the Marker, motion) exists and mainly needs refinement/consistency review, which can happen entirely in the Component Gallery with zero real story content.
