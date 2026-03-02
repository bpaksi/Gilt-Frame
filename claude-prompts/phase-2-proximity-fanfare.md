# Phase 2: GPS Proximity Fanfare (Experience Quality)

The GPS wayfinding works but feels flat — "getting warmer" messages change with no ceremony. The player needs to *feel* they're getting closer.

## Playtest Context
- Distance gate text changes were hard to notice
- No haptic, no visual pulse, no color change at gate boundaries
- Only 4 gates with big jumps (200m → 100m → 50m → 0m)

---

## Task 1: Add more distance gates

**File**: `src/config/config.ts`, ch1_wayfinding `distance_gates`

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

---

## Task 2: Haptic feedback on gate crossing

**File**: `src/components/game/quest/FindByGps.tsx`

In `handleFrame` callback:
- Add a ref `prevDistanceTextRef` to track the previous gate text
- When text changes (gate boundary crossed) AND previous text wasn't empty: fire `navigator.vibrate([50, 30, 50])` (double-tap pattern)
- Progressive enhancement — no-op on browsers without vibration API

---

## Task 3: Visual escalation by proximity

**File**: `src/components/game/quest/FindByGps.tsx`, `src/app/globals.css`

Track the current gate index and use it to drive visual intensity of the distance text:
- Color escalation by gate: `gold45` → `gold55` → `gold65` → `gold75` → `gold85` → `goldBright90` → `goldBright`
- Text size: subtle 14px → 17px progression
- On gate crossing: apply a CSS animation (brief scale(1.05) + text-shadow glow, ~600ms) then remove

Add `gate-pulse` keyframe to `globals.css`:
```css
@keyframes gate-pulse {
  0% { transform: scale(1); }
  30% { transform: scale(1.06); text-shadow: 0 0 20px rgba(232, 204, 106, 0.6); }
  100% { transform: scale(1); }
}
```

---

## Task 4: Compass rose brightness scaling

**Files**: `src/components/game/ui/CompassRose.tsx`, `src/components/game/quest/FindByGps.tsx`

Add optional `proximity` prop (0–1) to CompassRose navigate mode. FindByGps computes this from distance/max-gate-distance and passes it.

In CompassRose navigate mode draw loop:
- Ring stroke: blend from `gold30` to `gold60` based on proximity
- Arrow color: blend from `gold70` to `goldBright` as proximity increases
- At proximity > 0.8: add subtle canvas arc shadow glow around the ring

---

## Verification
1. **Gate progression**: In admin gallery, use DevTools Sensors to gradually decrease distance. Verify 7 distinct text messages appear, each with escalating color/size.
2. **Haptics**: On real phone in test mode, walk toward target. Feel vibration pulse at each gate boundary.
3. **Visual pulse**: Watch for brief scale+glow animation each time gate text changes.
4. **Compass glow**: CompassRose ring should visibly brighten as simulated distance decreases.

## Playtest After This Phase
Walk the full ch1_wayfinding path from PIN drop to sundial. Verify:
- Smooth, noticeable progression as you approach
- Haptic pulses are distinct at each gate
- Compass rose gets brighter/more alive as you close in
- The overall experience builds excitement as you approach the target
