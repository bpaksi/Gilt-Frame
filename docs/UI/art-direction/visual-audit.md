# Visual Audit — 2026-10-15

Audited at `origin/main` @ 05edc6c. Note: the repo is flat (`src/`, `public/`), not `website/…` as some docs say.

## 1. What exists today

### Type
- **App:** `src/components/ui/tokens.ts` → `fontFamily = "Georgia, 'Times New Roman', serif"`; `globals.css` → `--font-family-serif` uses the same stack. No webfont is loaded. Every screen, `/api/og/[token]`, and all **emails** (`src/config/email/*.html`, inline `font-family:Georgia`) use system Georgia.
- **Letters** (`src/config/letters/*.html`) are the one place with real type. They load Google Fonts **Cinzel, Cinzel Decorative, EB Garamond and MedievalSharp** (all OFL) and use their own palette (`--gold-bright #C9A84C`, `--burgundy #6B1C23`, `--ink-brown #2E231A`). This makes three type systems across the three channels.

### Palette
- Gold `#DCB95F` (`--gold-rgb: 220,185,95`) with an opacity ramp (gold → gold03), plus `goldBright #E8CC6A`.
- Ground `#1a1816`, surface `rgba(30,25,18,.8)`, dark `#1e1912`.
- Warm-white glows (`#FFF8DC`-family) for orbs and flashes, and error red `rgb(180,50,40)`.
- The admin palette (blues and greys) is separate and fine as it is.
- No light (Field) surface exists, and `prefers-color-scheme` is not used anywhere.

### Assets (`public/`)
| Asset | Notes |
|---|---|
| `marker/marker-v4-{gold,dark,white}.svg` (+ `marker-v4-small-*` for <=24px) + PNG 32–512; v3 kept for already-sent emails | Canon hourglass Marker (Foundation Bible §7). Good: keep it as the hero symbol |
| `marker/seal-v1-{64,128,256,512}.png` | The only wax-seal raster. There is no SVG, so it can't be recoloured or animated |
| `og-default.png` 1200×630 | A single generic share image, used in `layout.tsx` metadata |
| `favicon.{ico,svg}`, `apple-touch-icon.{png,svg}` | Present |
| `robots.txt` | Present |

### Motion
- `AmbientParticles` (8 keyframe drift variants `ap-0…ap-7`, transform only). Used by `UnlockAnimation`, `PuzzleComplete` and `RevealNarrative`.
- `OrbAnimation`, `UnlockAnimation`, `screenFlash`/`supernovaFlash`, `shake`, `pulse-soft`, `drift`, `fade-in`, `FadeTransition`, `RevealLines`, `SealDivider`, `CompletionCountdown`, `puzzleSolveAnimation.ts`.
- The solve ceremony is glow and flash based. The `shake` on a wrong answer goes against the rule "the Order never announces failure".
- There is **no `prefers-reduced-motion` handling anywhere in `src/`** (grep, 2026-10-15).

## 2. Missing for release
1. **Webfonts.** Cormorant Garamond + EB Garamond through `next/font/google`, and the same pair (with fallbacks) in emails and in OG via `ImageResponse` font loading.
2. **The two-surface system.** The Candlelight (Gallery) retune and Museum Placard (Field) tokens behind `data-surface` are decided in design but are not in the code.
3. **A gilt-frame ornament set.** There are no corner, rule or border SVGs. "Gilt Frame" is the name of the game, yet no frame appears in the app.
4. **Per-moment share art.** `/api/og/[token]` renders Georgia text on flat colour. There is no per-chapter art slot and no frame, and `og-default.png` is generic.
5. **The Vault reassembly reveal.** No component exists for the climax (six fragments → one letter, from *we* to *I*). It is the most important visual in the game.
6. **The "what now" waiting state**, with a resend-last-message affordance. Recovery moves in the Chapter Kit assume it.
7. **Email look.** The emails are plain Georgia HTML with no header art, paper or seal. They need to match the letters.
8. **A vector wax seal** (SVG) plus per-chapter seal variants.
9. **Paper and texture assets:** laid-paper grain, parchment, gilt leaf. Each should be small (a tileable WebP under 30 KB, or an SVG `feTurbulence`).
10. **Reduced-motion fallbacks** for every ceremony.
11. **Riddle cards and hint-ladder visuals** for the 24 Chapter Kit formats (see per-stop-asset-kit.md).
12. **Letters:** retire MedievalSharp and Cinzel Decorative (both off-tone, "ornate French" register) and align on the Garamond pair. Cinzel can stay for engraved capitals only.

## 3. Leftover starter material (do not delete in this PR; Wright owns it)
`public/vercel.svg`, `public/next.svg`, `public/globe.svg`, `public/file.svg`, `public/window.svg`.

**References:** I ran `grep -rn` for all five names across the repo, excluding `node_modules`/`.next`, and got **zero hits**. Nothing imports or links them, so they are safe to remove in a Wright cleanup PR.
