# Phase 2: GPS Proximity Fanfare (Experience Quality)

The GPS wayfinding works but feels flat — "getting warmer" messages change with no ceremony. The player needs to *feel* they're getting closer.

## Playtest Context
- Distance gate text changes were hard to notice
- No visual pulse, no color change at gate boundaries
- Only 4 gates with big jumps (200m → 100m → 50m → 0m)

---

## Task 1: Refactor `thematicDistanceText` to return gate context

**File**: `src/lib/geo.ts`

Tasks 2–4 need a gate index and proximity value, not just the text string. Refactor:

```ts
export type GateResult = {
  text: string;
  gateIndex: number;       // 0 = farthest gate, N-1 = closest
  proximity: number;        // 0.0 (far) → 1.0 (arrived), clamped
};

export function resolveDistanceGate(
  meters: number,
  gates = DEFAULT_DISTANCE_GATES,
): GateResult {
  const sorted = [...gates].sort((a, b) => b.above - a.above);
  const maxDistance = sorted[0]?.above ?? 200;
  const idx = sorted.findIndex((g) => meters > g.above);
  const gateIndex = idx === -1 ? sorted.length - 1 : idx;
  return {
    text: sorted[gateIndex]?.text ?? "",
    gateIndex,
    proximity: 1 - Math.min(meters / maxDistance, 1),
  };
}
```

Keep `thematicDistanceText` as a thin wrapper for backward compat (it's only called in one place, but keep the function until callers are migrated):
```ts
export function thematicDistanceText(meters: number, gates = DEFAULT_DISTANCE_GATES): string {
  return resolveDistanceGate(meters, gates).text;
}
```

Update `FindByGps.tsx` `handleFrame` to call `resolveDistanceGate` and store the full result.

---

## Task 2: Add more distance gates

**File**: `src/config/config.ts`

### Live track — ch1_wayfinding `distance_gates`
Replace the 4 gates with 7 for smoother progression:
```
{ above: 200, text: "The Marker is far. Keep searching." },
{ above: 150, text: "The path unfolds before you." },
{ above: 100, text: "You draw closer. The Marker stirs." },
{ above: 75,  text: "The air grows heavy with purpose." },
{ above: 50,  text: "The Marker grows warm. You are near." },
{ above: 25,  text: "The Marker pulses. You are close." },
{ above: 0,   text: "The Marker burns bright. You have arrived." },
```

### Test track — update for parity
The test track already has 6 gates at shorter distances. Update to 7 gates scaled proportionally:
```
{ above: 50,  text: "The Marker is far. Keep searching." },
{ above: 40,  text: "The path unfolds before you." },
{ above: 30,  text: "You draw closer. The Marker stirs." },
{ above: 20,  text: "The air grows heavy with purpose." },
{ above: 12,  text: "The Marker grows warm. You are near." },
{ above: 5,   text: "The Marker pulses. You are close." },
{ above: 0,   text: "The Marker burns bright. You have arrived." },
```

---

## Task 3: Gate-crossing feedback

**File**: `src/components/game/quest/FindByGps.tsx`

In `handleFrame`, track the previous gate index via `prevGateIndexRef`. When `gateIndex` changes AND previous wasn't -1 (initial state):

1. **Visual shake** (primary — works on all platforms including iOS Safari):
   Increment a `gateChangeKey` state counter. Use it as React `key` on the distance text `<p>` so it re-mounts, retriggering the `gate-pulse` CSS animation.

2. **Haptic vibration** (bonus — Android only, no-op on iOS):
   `navigator.vibrate?.([50, 30, 50])` — double-tap pattern. Use optional chaining; iOS Safari doesn't support the Vibration API at all, so this is purely additive for Android users.

**Performance note**: `handleFrame` runs at 60fps. Only compare `gateIndex` (integer equality) per frame — cheap. Only trigger `setGateChangeKey` on actual gate transitions, not every frame.

---

## Task 4: Visual escalation by proximity

**File**: `src/components/game/quest/FindByGps.tsx`, `src/app/globals.css`

Use `gateIndex` from `resolveDistanceGate` to drive visual intensity of the distance text:

- **Color escalation by gate** (all tokens exist in `src/components/ui/tokens.ts`):
  `gold45` → `gold55` → `gold60` → `gold70` → `gold85` → `goldBright90` → `goldBright`

- **Text size**: 14px → 20px progression (~1px per gate step — visible on mobile)

- **Gate-pulse animation**: On gate crossing, the `gateChangeKey` remount (from Task 3) triggers the animation automatically. Add `gate-pulse` keyframe to `globals.css`:

```css
@keyframes gate-pulse {
  0% { transform: scale(1); }
  30% { transform: scale(1.06); text-shadow: 0 0 20px rgba(232, 204, 106, 0.6); }
  100% { transform: scale(1); }
}
```

Apply to the distance text `<p>`:
```css
animation: gate-pulse 0.6s ease-out;
```

- **Reduced motion**: Wrap the animation in `@media (prefers-reduced-motion: no-preference)`. Color and size changes still apply regardless.

---

## Task 5: Compass rose brightness scaling

**Files**: `src/components/game/ui/CompassRose.tsx`, `src/components/game/quest/FindByGps.tsx`

Add optional `proximity` prop (0–1) to CompassRose navigate mode. `FindByGps` passes the `proximity` value from `resolveDistanceGate`.

**Proximity formula** (computed in `handleFrame`, stored in ref, passed as prop):
```ts
proximity = 1 - Math.min(distance / highestGateAbove, 1)  // clamped [0, 1]
```
Where `highestGateAbove` is the first gate's `above` value (200 for live, 50 for test).

**Canvas draw changes** — use `globalAlpha` modulation (simpler and more performant than color interpolation):

- **Ring stroke**: Draw with `colors.gold60`, set `globalAlpha = 0.5 + 0.5 * proximity`
  (at proximity 0 → effective gold30; at proximity 1 → full gold60)

- **Arrow**: Draw with `colors.goldBright`, set `globalAlpha = 0.7 + 0.3 * proximity`
  (at proximity 0 → goldBright at 70%; at proximity 1 → full goldBright)

- **Glow at proximity > 0.8**: Draw a second arc stroke at `RING_R` using `colors.goldBright` with `globalAlpha = (proximity - 0.8) * 2` and `lineWidth = 4`. This is cheaper than `shadowBlur` and avoids mobile performance issues.

---

## Verification
1. **Gate progression**: In admin gallery, use DevTools Sensors to gradually decrease distance. Verify 7 distinct text messages appear, each with escalating color/size.
2. **Gate-crossing feedback**: On gate boundary crossing, watch for brief scale+glow animation on text. On Android, also verify haptic vibration pulse. On iOS, confirm the visual shake is the primary feedback (no vibration expected).
3. **Compass glow**: CompassRose ring should visibly brighten as simulated distance decreases. At close range (proximity > 0.8), a subtle glow arc should appear.
4. **Reduced motion**: Enable `prefers-reduced-motion: reduce` in DevTools. Confirm gate-pulse animation is suppressed but color/size escalation still works.
5. **Test track parity**: Run through test track gates and verify the same 7-step progression at shorter distances.

## Playtest After This Phase
Walk the full ch1_wayfinding path from PIN drop to sundial. Verify:
- Smooth, noticeable progression as you approach
- Visual pulse on each gate transition (shake + glow on all platforms)
- Compass rose gets brighter/more alive as you close in
- The overall experience builds excitement as you approach the target
