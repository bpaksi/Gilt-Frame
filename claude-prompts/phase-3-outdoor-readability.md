# Phase 3: Outdoor Readability (Significant Brightness Boost)

The game is nearly invisible on a phone screen in daylight. We need a significant contrast increase while preserving the dark/mysterious aesthetic.

## Playtest Context
- Gold text at 60-90% opacity on #0a0a0a background is unreadable in direct sunlight
- Text shadow actually reduces perceived brightness
- No way to adjust for outdoor conditions

---

## Task 1: Significantly boost baseline contrast

**Files**: `src/app/globals.css`, `src/components/ui/tokens.ts`

### Background
Lift from pure black to warm dark brown:
- `#0a0a0a` → `#1a1816`
- Update in: `tokens.ts` (`colors.bg`), `globals.css` (`--color-bg`, `html` background, `body` background, scrollbar track)

### Text colors
- Body text: `rgba(200, 165, 75, 0.9)` → `rgba(220, 185, 95, 1)` (brighter gold, full opacity)
- Text shadow: increase from `0.15` opacity to `0.35` for stronger halo readability aid
- Consider shifting the base gold RGB slightly brighter: `200,165,75` → `220,185,95` for the primary text color in `globals.css` body rule

### Token adjustments
In `tokens.ts`, the game UI gold tiers are used for varying text importance. Boost the commonly-used ones:
- `gold70` (used for wayfinding narrative text): needs to be noticeably brighter
- `gold60` (used for distance text, compass cardinals): bump visibility
- `gold50` (used for hints, secondary text): ensure readable outdoors

Approach: shift the gold base RGB in the lower-opacity tokens toward `220, 185, 95` so even 60% opacity text has sufficient contrast against `#1a1816`.

---

## Task 2: Boost CompassRose canvas colors

**File**: `src/components/game/ui/CompassRose.tsx`

The canvas doesn't use CSS variables — it reads from `tokens.ts` directly. After boosting tokens, verify:
- Navigate mode: ring, ticks, cardinal labels, arrow are all clearly visible
- Align mode: needle, ring, ticks are readable
- If needed, bump the specific token references used in the canvas draw calls

---

## Task 3: Audit game page components

Check that the brightness boost works across all game screens, not just the compass:
- `src/app/(game)/layout.tsx` — background
- Quest components that use gold tokens for text
- `TapToContinue`, `HintSystem`, `GhostButton` — these all need to be readable outdoors
- `CompletionCountdown`, `RevealNarrative` — reward screens

Most of these inherit from tokens/globals, so the baseline boost should cascade. Verify in browser.

---

## Verification
1. **Visual check**: Open game pages on a phone or with monitor at full brightness. Text should be clearly legible.
2. **Aesthetic check**: The game should still feel dark and atmospheric — not "light mode." We're going from near-black to dark-warm-brown, not to gray or white.
3. **CompassRose**: Both navigate and align modes should have clearly visible rings, ticks, and labels.
4. **Admin pages**: Verify admin panel (`the-order/`) is NOT affected — it has its own color scheme.

## Playtest After This Phase
Go outside in daylight with phone. Open any game page. Verify:
- All text is readable without squinting or shading the screen
- The game still feels immersive and dark-themed
- Compass rose elements are clearly visible
- Buttons and interactive elements are easy to find and tap
