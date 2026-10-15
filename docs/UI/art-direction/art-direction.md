# Art Direction — The Look and Voice of the Order

> *A thriller that asks you to slow down. Ancient, gilded, and grave on the surface. Warm, intimate, and impermanent underneath.* (Tone North Star)

Rule of thumb: **gilt is a guest.** If a screen reads as "gold", it has overspent. Light is the subject, so it arrives, lingers, and fades. Nothing pops.

## 1. Voice (for every visible word)
- The Order speaks in the first person plural, unhurried and declarative. It never uses exclamation marks.
- CTAs stay in character: "The way opens", "Report to the Council", "Ask for the last word again". Never "Submit", "Retry" or "Resend".
- Failure is never announced. A wrong answer withdraws quietly, with no red and no shake.
- Microcopy uses museum wall-label style: small caps and wide tracking ("CHAPTER II · THE GALLERY OF WHISPERS").

## 2. Type (all SIL Open Font License 1.1, free, via Google Fonts / `next/font/google`)
| Role | Family | Use |
|---|---|---|
| Display | **Cormorant Garamond** (variable wght 300–700, roman and italic) | Titles, the council's voice in **300 italic**, numerals and drop caps at 600 |
| Text | **EB Garamond** (variable wght 400–800, roman and italic) | Body, letters, riddles, and wall-label small caps (`font-variant: all-small-caps; letter-spacing: .3em`) |
| Engraved caps (letters only, optional) | **Cinzel** (OFL) | Return address and seal legends. Never in the app |
| Cipher | System mono (`ui-monospace`) | "BEARING 255° W" only |

Retire: Georgia as the display face, **MedievalSharp**, and **Cinzel Decorative**.
Email fallback stack: `'EB Garamond', 'Cormorant Garamond', Garamond, Georgia, serif`. Use a `<link>` to Google Fonts; Apple Mail renders it and Gmail falls back to Georgia gracefully.

## 3. Palette
**Gallery — Candlelight** (dark; indoors, the Oracle, Journey, letters on screen, share pages)
| Token | Hex | Role |
|---|---|---|
| nocturne | `#0b0704` | Outer ground |
| umber | `#140d06` | Mid ground |
| lamp | `#241708` | Lamplit centre (radial, top-centre) |
| ink | `#efdcbc` | Primary text |
| ink-dim | `#b79f78` | Secondary text |
| ink-faint | `#7d6a4c` | Tertiary text and captions |
| ring | `#3a2c1a` | Hairlines and quiet structure |
| gilt | `#e0aa5a` | The guest: confirmations, primary CTA |
| gilt-hi | `#f3d58e` | Shimmer highlight only |
| gilt-deep | `#8a6328` | Frame shadow side, borders |
| glow | `rgba(255,214,140,.95)` | Solve halo only |

**Field — Museum Placard** (light; on location in daylight)
`ground #efe9db`, `ground-lo #e5ddce`, `raise #faf5ea`, `ink #1e1b16`, `ink-dim #4c463a`, `ink-faint #79705a`, `brass #7a5f22`, `brass-bright #b58a34`, `line #cbbb9c`.

**Materials**
`parchment #efe4cc → #dccba6`, `sepia ink #3b2a18`, `wax #7a1e1e`, `wax-hi #a83a2e`, `wax-shadow #4a0e10`.

**The Sight** (reveals only, never in chrome)
rose madder `#c56a6a`, cobalt violet `#7d72ad`, viridian `#4e7a63`, blood `#8b2500`.

Legacy `#DCB95F` on `#1a1816` maps to `gilt` on `umber`. Keep the single-dial `--gold-rgb` idea by setting it to `224,170,90`.

## 4. Gilt-frame borders and ornaments
The frame is the game's namesake and should appear wherever something is *kept*.
- **Gallery frame:** a 2px `gilt-deep` outer line, a 10px gap, then a 1px `gilt` line at 35% opacity. Four corner ornaments (SVG, 120px, see `mocks/corner.svg`): a double-radius cove with a leaf boss and a gilt-hi pip. The ornament is mirrored per corner.
- **Picture frame** (moment art, OG): a 12px `border-image` gradient `#8a6328 → #f3d58e → #a07636 → #e0aa5a → #6f4e1e` at 135°, a 2px inner shadow, and a deep drop shadow. This reads as leaf on gesso.
- **Rule / divider:** a hairline, then a lozenge in gilt, then a hairline, with two small `gilt-deep` pips. It replaces `SealDivider`'s current form.
- **Field:** no ornaments. A hairline `line-strong` frame only, because daylight holds still.
- Budget: **at most one frame per screen.** Ornament marks a threshold; it should never become wallpaper.
- The Marker (not a frame-with-dot crest) remains the hero symbol, as Visual Language Decisions #4 says.

## 5. Paper and wax for letters and emails
- **Laid paper:** SVG `feTurbulence` (baseFrequency .85, 3 octaves) multiplied at 18–22%, plus faint 1px horizontal chain lines every 28px at 4% opacity. Emails get a 1200px pre-rendered WebP version of it as a background, with a solid `#efe4cc` fallback.
- **Parchment cards** (fragments, riddle cards): a `170deg` gradient `#efe4cc → #dccba6`. Edges are deckled by an irregular `clip-path` polygon, so no two cards share a polygon.
- **Wax seal:** a radial `#a83a2e → #7a1e1e → #4a0e10` from 38%/34%, an inset bottom shadow, and the Marker debossed at 75% opacity. The deliverable is `seal-v2.svg` (vector). It should vary per chapter only by the roman numeral on its rim.
- **Email header:** a 600px-wide band in the Candlelight ground with the Marker, a small-caps "THE ORDER OF THE GILT FRAME" line and a gilt rule. The body sits on parchment and the seal is a sign-off image. Every image needs `alt` text written in voice.
- The **Letter header** per chapter is produced by the per-stop kit.

## 6. Motion
Principles: *Gallery* gets one lamp and a slow warm glow. *Field* means daylight holds still. *Reveal* resolves from soft to sharp. *Threshold* means the seal breaks once.

| Moment | Spec | Reduced-motion fallback |
|---|---|---|
| **Frame reveal on moment unlock** | 0–600ms: the frame hairlines draw from the corners (`stroke-dashoffset`) at ease-out. 400–1400ms: the art goes from `blur(12px) brightness(.6)` to sharp. 1200–2000ms: the title fades up 8px. Total 2.0s, with `cubic-bezier(.2,.7,.1,1)` | Show frame and art at once and cross-fade the title over 400ms (opacity only) |
| **Gilt shimmer** | A `linear-gradient(100deg)` highlight sweeps once across `.gilt-text` over 1.6s at `background-position`. It plays **once per reveal**, never loops | None. Static gradient |
| **Ink bleed** (riddle text, Vault) | Per line: `opacity 0→1` plus `filter: blur(3px)→0` over 900ms, staggered 220ms (reuse `RevealLines`) | Opacity only, 300ms, with no stagger |
| **Vault reassembly** | See the storyboard mocks. 0–2.4s: the scattered fragments (dim, slightly blurred, rotated ±8°) straighten and stack. Seams gild as the edges meet, using a 4px gilt-hi line with glow. 2.4–5.0s: the cards fuse into one parchment and the gilt double-rule draws. The text reflows into one letter, line by line, and fragment VI arrives last, in italic. The wax seal settles at 5.0s (scale 1.08 → 1, 300ms). The player controls the pace: each fragment advances on tap | Fragments appear already in order, then cross-fade to the whole letter. The tap pacing stays |
| **Ambient particles** | Keep `AmbientParticles`, at no more than 14 motes, gilt-hi, and only on Gallery surfaces | Hidden |
| **Wrong answer** | The chosen card dims to 40% and drifts 4px down. Retire `shake` | Dim only |
| **Flashes** (`screenFlash`, `supernovaFlash`) | Cap peak opacity at 0.6 and limit to one per chapter | Removed |

Wrap all of these in `@media (prefers-reduced-motion: no-preference)`. The default should be the still version.

## 7. OG and share-card templates (1200×630)
- **Moment card** (`/moment/[token]`, see `mocks/og-card.html`): the moment art sits in a picture frame on the left (470×542). On the right:
  - a wall label: `CHAPTER {N} · {CHAPTER TITLE}`
  - a 72px Cormorant 300 italic headline, at most 2 lines and 40 characters
  - a 26px EB Garamond line, at most 2 lines
  - a footer with the Marker, "THE ORDER OF THE GILT FRAME" and "A moment, witnessed"
- **Default card** (replaces `og-default.png`): the Marker centred in lamplight, with the title in Cormorant 300 italic and nothing else.
- **Chapter teaser:** the same layout as the moment card, with the art replaced by a blurred, cropped detail of the next artwork. Withhold, generously.
- In `next/og` `ImageResponse`, load the TTFs with `fetch(new URL('./CormorantGaramond-LightItalic.ttf', import.meta.url))`. Static instances are needed because Satori does not take variable fonts.
- Never put the Camus line, any fragment VI text, or Christine's name on a public card.

## 8. Implementation notes: Tailwind 4 `@theme`
```css
/* layout.tsx */
/* import { Cormorant_Garamond, EB_Garamond } from "next/font/google";
   const display = Cormorant_Garamond({ subsets:["latin"], weight:["300","400","500","600"], style:["normal","italic"], variable:"--font-display" });
   const text = EB_Garamond({ subsets:["latin"], style:["normal","italic"], variable:"--font-text" }); */

@theme {
  --font-display: var(--font-display), "Cormorant Garamond", Garamond, Georgia, serif;
  --font-serif:   var(--font-text), "EB Garamond", Garamond, Georgia, serif;

  --color-nocturne: #0b0704;  --color-umber: #140d06;  --color-lamp: #241708;
  --color-ink: #efdcbc;       --color-ink-dim: #b79f78; --color-ink-faint: #7d6a4c;
  --color-ring: #3a2c1a;
  --color-gilt: #e0aa5a;      --color-gilt-hi: #f3d58e; --color-gilt-deep: #8a6328;
  --color-parchment: #efe4cc; --color-parchment-lo: #dccba6; --color-sepia: #3b2a18;
  --color-wax: #7a1e1e;       --color-wax-hi: #a83a2e;
  --color-sight-rose: #c56a6a; --color-sight-violet: #7d72ad; --color-sight-viridian: #4e7a63;

  --ease-reveal: cubic-bezier(.2,.7,.1,1);
  --animate-gilt-sweep: gilt-sweep 1.6s var(--ease-reveal) 1 both;
  --animate-ink-in: ink-in .9s var(--ease-reveal) both;
  --animate-frame-draw: frame-draw .6s var(--ease-reveal) both;
}
[data-surface="field"] {
  --color-umber: #efe9db; --color-ink: #1e1b16; --color-ink-dim: #4c463a; --color-ink-faint: #79705a;
  --color-ring: #cbbb9c;  --color-gilt: #7a5f22; --color-gilt-hi: #b58a34; --color-gilt-deep: #584614;
}
@keyframes gilt-sweep { from { background-position: 120% 0 } to { background-position: -20% 0 } }
@keyframes ink-in     { from { opacity: 0; filter: blur(3px) } to { opacity: 1; filter: none } }
@keyframes frame-draw { from { stroke-dashoffset: var(--len) } to { stroke-dashoffset: 0 } }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
```
Mirror these values in `tokens.ts` (`colors.*`, `fontFamily` → `"var(--font-text), 'EB Garamond', Georgia, serif"`) because inline-style components and `/api/og` read from it.
Utilities to add: `.gilt-text` (gradient text, `background-size: 200%`), `.paper` (the noise layer), `.frame-gallery` and `.frame-picture`.
