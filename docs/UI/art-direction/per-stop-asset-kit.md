# Per-Stop Asset Kit (formulaic)

**Plugs into:** Gamewright's **Gilt-Frame Chapter Kit**, which has the puzzle menu by site type (A–F, 24 formats), the 3-step hint ladder, timing per beat, and recovery moves. Fill in the Chapter Kit's §6 Chapter Worksheet first. This kit then turns that worksheet into art in about 90 minutes.
**Cost: $0.** Stills come from Bob's **Perplexity Pro image generation (Nano Banana 2.1)**, which is included in the plan. No paid image APIs. Typesetting is done in HTML/CSS in this repo (the templates in `mocks/`) and rendered with Playwright.

## 0. Inputs (copy from the Chapter Kit worksheet and the Location & Person Card)
```
STOP_NAME        = e.g. Art Institute of Chicago
CHAPTER_NUM      = II            CHAPTER_TITLE = The Gallery of Whispers
SITE_TYPE        = A|B|C|D|E|F   (Chapter Kit §1)
PUZZLE_FORMAT    = e.g. A1 Find-and-confirm
WOMAN            = real person tied to the stop (name, dates, one verifiable fact)
ORDER_TITLE      = her Order reframe, e.g. "The Patron"
ARTWORK          = title, artist, year, gallery no., and BACKUP work (Chapter Kit §2 check 2)
PALETTE_NOTE     = 3 dominant colours of the artwork (from the museum's collection image)
BEAT_FRAGMENT    = Vault beat 1–6 (Story Spine §3). Art only; never the text
RIDDLE_TEXT      = failable riddle from the Chapter Kit
HINTS            = hint 1 nudge / hint 2 narrow / hint 3 giveaway
```

## 1. Checklist per stop
| # | Asset | Size / format | Source | Lands in |
|---|---|---|---|---|
| 1 | **Chapter card** | 1170×2532 PNG, plus 1080×1350 for MMS | Nano Banana still → HTML frame template | Journey tab header, Summons MMS |
| 2 | **Moment art** | 1600×1840 (≈ 0.87, the picture-frame ratio), WebP under 250 KB | Nano Banana | `/journey/[momentId]`, OG left panel |
| 3 | **OG share image** | 1200×630 PNG | `mocks/og-card.html`, with art from #2 | `/moment/[token]` (via `/api/og`) |
| 4 | **Letter header** | 8.5in-wide band, 300 dpi PNG plus inline SVG ornament | Nano Banana vignette + HTML | `src/config/letters/Ch{N}-Summons.html` |
| 5 | **Riddle card** | 1170×1600 PNG and live HTML | Riddle card template (§4) | The quest step (FT/PP/MC/AB), and MMS for the Summons |
| 6 | **Hint-ladder plates** ×3 | Live component; same card at 3 states | §3 per-format field | HintSystem |
| 7 | **Recovery art** | 1080×1080 PNG ×2 (generic plus stop-specific) | §5 | Recovery SMS/MMS (Chapter Kit §4) |
| 8 | **Email header** | 1200×360 WebP (shown at 600px) | Cropped from #1 | Briefing and debrief emails |
| 9 | Alt text in the Order's voice for #1–#8 | text | You | config |
| 10 | Spoiler check: no answer, fragment text, Camus line or Christine's name visible in #1, #3, #8 | — | You | — |

## 2. Prompt templates (Nano Banana 2.1 in Perplexity Pro)
Shared style suffix. Paste it into every prompt:
> `…rendered as an oil painting in late-Impressionist broken colour, candlelit, warm umber shadows (#140d06), a single shaft of warm gold light (#e0aa5a), visible canvas weave, soft edges, reverent and still, no text, no letters, no logos, no modern objects, no faces in sharp focus. Vertical 7:8.`

**Chapter card**
> `An empty, quiet corner of {STOP_NAME} at the hour before closing, evoking {ORDER_TITLE}. In the shadowed middle distance, the suggestion of {WOMAN}'s presence — a {OBJECT_TIED_TO_HER} resting on {SURFACE}, as if she just stepped away. Light falls from {LIGHT_SOURCE}. Palette drawn from {ARTWORK}: {PALETTE_NOTE}.` + style suffix

**Moment art** (the art she earned, as an Order "relic" study of the work, never a copy)
> `A painterly study echoing the composition and light of "{ARTWORK.title}" by {ARTWORK.artist} ({ARTWORK.year}) — not a reproduction — reimagined as seen by candlelight in a private archive. Focus on {ONE_DETAIL_FROM_RIDDLE}. Hidden in the brushwork, a faint hourglass of two crossing S-curves.` + style suffix

**Letter header vignette**
> `A narrow horizontal engraving-like vignette, sepia ink on warm parchment (#efe4cc), of {EMBLEM_OF_STOP} flanked by laurel and a single sparrow in flight, fine cross-hatching, generous empty margins, centred.` (Drop the oil-painting suffix. Use a 4:1 ratio.)

**Recovery art**
> `A sealed letter with a deep red wax seal resting on {SURFACE_AT_STOP}, a single candle, dusk, patient and unhurried.` + style suffix

Then typeset each one by placing the still into the HTML templates (frame, wall label and Marker) and running `python mocks/render.py`. Never let the AI draw text.

## 3. Visual field for each kind of stop (keyed to Chapter Kit §1)
Each format lists what it needs on the **riddle card** (RC), the **3 hint-ladder plates** (H1 nudge / H2 narrow / H3 giveaway) and its **recovery art** (RA).
The general rule for the ladder: H1 lightens the card's vignette by 10%. H2 reveals a gilt-ruled *detail crop or diagram*. H3 shows the answer engraved in Cormorant 600 in a gilt cartouche, with "Even the Order's oldest members needed the light shown to them once."

### A. Museum: `surface: field` (Placard). Indoors, so no AlignBearing
| Format | RC visual | H2 plate | H3 plate | RA |
|---|---|---|---|---|
| A1 Find-and-confirm | A silhouette vignette of the work's frame shape, empty | A blurred crop of the subject's pose | Title and artist in the cartouche, beside the art thumbnail | "The Order has moved her" card: the empty frame with a nail and the backup work's frame shape |
| A2 Placard cipher | A drawn museum label with the fields blanked (e.g. *____, 18__*) | The label diagram with the surname underlined | The two characters engraved | Generic wax-seal "archive copy" |
| A3 Count-the-detail | A painterly crop with a hand-drawn magnifier ring | Edges highlighted with gilt hairlines | The number in a cartouche | Same as A1 |
| A4 Gallery-number key | A threshold plaque drawing, blank digits | A floor-plan sketch with the floor marked | The digits engraved on the plaque | Doors-sealed card (Site closed) |

### B. Historic house or estate: inside `field`, grounds `field`
| Format | RC | H2 | H3 | RA |
|---|---|---|---|---|
| B1 Inscription | The lintel drawn with blank carved letters | The lintel with the Latin letter count marked | The word carved in the lintel | Doors-sealed card |
| B2 Room order (SequenceOrder) | Room "tiles" as small engraved doorways | Light rays drawn on the floor plan | The ordered tiles, numbered I–N | — |
| B3 Object-on-mantel | A mantel silhouette with an empty spot | The study room tile highlighted | The object as an engraving | — |
| B4 Built-in bearing | A compass ring with a ghosted sightline | The long-axis diagram of the house | The degrees in the CompassRose cartouche | GPS-failure "The Order sees you" card |

### C. Garden or outdoor: `field`. Sun glare, so high contrast with no glow
| Format | RC | H2 | H3 | RA |
|---|---|---|---|---|
| C1 Marker hunt | A sundial engraving, guarded spot blank | The dial with a quadrant shaded | The guardian named, with an engraving | GPS-failure card |
| C2 Shadow bearing | A dial with a noon shadow line ghosted | A diagram with the sun behind her | Degrees | Weather/closed card |
| C3 Plant label | A drawn botanical tag, blank | The tag with the second word underlined | The Latin word in italic | — |
| C4 Pace count | A path drawing, gate to fountain, with footprints | The range bar 40–80 | The number | — |

### D. Downtown or street: `field`
| Format | RC | H2 | H3 | RA |
|---|---|---|---|---|
| D1 Plaque chain | Three blank plaques in a row | One plaque marked "bank" | The earliest year | GPS-failure card |
| D2 Façade date | A cornice line drawing | The cornice with "18__" | The year | — |
| D3 Street acrostic | A street-grid map with blank initial boxes | The five boxes outlined | The word | — |
| D4 Statue facing | A statue silhouette with a gaze arrow ghosted | The water direction drawn | Degrees | GPS-failure card |

### E. Church or monument: `field` outside, `gallery` inside
| Format | RC | H2 | H3 | RA |
|---|---|---|---|---|
| E1 Dedication stone | A stone drawing with blank lettering | The letter count marked | The surname carved | Doors-sealed card |
| E2 Saint in window | A lancet window outline in leading, without colour | The east window filled in with The Sight colours | The saint and their attribute | — |
| E3 Roman numerals | The cornerstone with numerals | A numeral key (M D C L X V I) | The year | — |
| E4 Name-on-the-wall | A wall of blank name rows | Column 3 highlighted | The year | — |

### F. Waterfront: `field`. Glare, so the bold Placard
| Format | RC | H2 | H3 | RA |
|---|---|---|---|---|
| F1 Lighthouse bearing | A horizon line with a lighthouse silhouette | A compass with W shaded | Degrees | GPS-failure card |
| F2 Pier marker | A pier perspective, last piling blank | The digit count | The number | — |
| F3 Ship name | A plaque with a ship engraving, name blank | The first letter | The name | — |
| F4 Horizon count | A panorama strip with a bridge silhouette ghosted | Both directions arrowed | The number | — |

## 4. Riddle card template
1170×1600 on a parchment card inside the Gallery frame (or Placard hairline on `field`):
1. Wall label: `CHAPTER {N} · THE RIDDLE`
2. The RC visual (from §3), 900×700, in sepia line art
3. RIDDLE_TEXT in EB Garamond 46px, one idea per line, with ink-in motion
4. A rule ornament
5. The hint-ladder affordance: three small wax dots, which fill as hints unlock (Chapter Kit timing: 3, 6 and 10 minutes)

## 5. Recovery art (Chapter Kit §4)
Make each card once and reuse it across stops. Stop-specific variants swap only the background still:
- **Missed message:** the sealed letter on a doorstep. "A message from the Order awaits you, Sparrow."
- **Lost letter / archive copy:** an open ledger with a copy stamp.
- **GPS failure:** the Marker over a blurred map. "The Order sees you. Proceed."
- **Art off display:** an empty frame with a nail. "The Order has moved her."
- **Site closed:** a door with a wax seal across the latch. "The doors are sealed today."
- **Stuck past the giveaway:** a lamp being lit.
- **What-now / waiting:** see `mocks/waiting.html`, which includes the "Ask for the last word again" affordance.

## 6. Fast path (once the trip is planned)
Worksheet done → generate 4 stills (chapter, moment, letter vignette, stop-specific recovery), 15 min → typeset with the templates, 30 min → riddle card and hint plates from the §3 row, 30 min → spoiler check and alt text, 15 min.
