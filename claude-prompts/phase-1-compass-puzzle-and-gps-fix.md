# Phase 1: Fix Compass Puzzle & GPS Target (Game-Blocking)

These two puzzles are literally broken — the player can't complete Ch1 without them working.

## Playtest Context
- ch1_compass_puzzle couldn't "lock in" — magnetometer jitter resets the 1.5s hold timer every time
- ch1_wayfinding GPS target was off by ~31 feet, geofence too tight at 9m
- Phone direction only works vertical but instruction says "lay flat on dial"

---

## Task 1: Fix compass puzzle lock-in

**Files**: `src/config/config.ts`, `src/components/game/ui/CompassRose.tsx`

### Config changes (`src/config/config.ts`, ch1_compass_puzzle):
- `compass_tolerance`: 8 → 15 (degrees — ±8° is tighter than magnetometer noise)
- `hold_seconds`: 1.5 → 2.0 (slightly longer to compensate for easier tolerance)

### Sticky hold grace period (`src/components/game/ui/CompassRose.tsx`):
The hold timer at lines 267-282 resets `holdStartRef.current = null` the instant `isOnTarget` goes false. A single-frame jitter kills the entire hold. Add a 300ms grace period:

- Add ref: `const offTargetSinceRef = useRef<number | null>(null);`
- When on-target: reset `offTargetSinceRef.current = null`, run existing hold logic
- When off-target: record time in `offTargetSinceRef` if null, only reset `holdStartRef` if off-target > 300ms continuously
- Hold progress keeps counting during grace window (timer doesn't pause)

### Better hold progress feedback (`src/components/game/quest/AlignBearing.tsx`):
In `handleFrame` (line 45): increase glow from `holdProgress * 30` to `holdProgress * 60` so the player sees dramatic brightening as they hold steady.

---

## Task 2: Fix GPS target and geofence

**File**: `src/config/config.ts`, ch1_wayfinding

- Update `target_lat`: 42.405278 → 42.405352
- Update `target_lng`: -85.402778 → -85.402878
- Update `geofence_radius`: 9 → 20 (meters — phone GPS accuracy is 3-10m, 9m geofence is too tight)

---

## Task 3: Fix flat phone orientation

**File**: `src/lib/hooks/useDeviceOrientation.ts`

The game says "lay your device upon the face of the dial" (phone flat). `webkitCompassHeading` (iOS) already handles any phone orientation. The Android fallback `(360 - e.alpha) % 360` at line 77 fails when flat because alpha (Z-axis rotation) becomes unreliable.

Add a `computeHeadingFromEuler(alpha, beta, gamma)` function that uses the rotation matrix approach:
- Constructs the ZXY rotation matrix from all 3 Euler angles
- Projects the device's -Y axis (screen top) into the horizontal plane
- Computes heading via atan2 of the east/north components

Update `handleOrientationEvent` to:
1. Prefer `webkitCompassHeading` (unchanged — iOS path)
2. Fall back to `computeHeadingFromEuler` when alpha + beta + gamma are all available
3. Last resort: raw `(360 - alpha)` when only alpha exists

Update `updateDebugSource` to show `euler:XXX` when using the rotation matrix path (helps future debugging).

---

## Verification
1. **Compass lock-in**: Admin gallery → AlignBearing → sweep cursor past 255° in both directions, then hold near target. Should lock despite slight mouse movement. Grace period should prevent reset from brief jitter.
2. **GPS geofence**: Chrome DevTools → Sensors → enter `42.405352, -85.402878` → verify FindByGps triggers "arrived" state. Test at ~20m away to verify geofence boundary.
3. **Flat phone**: On a real device, lay phone flat and rotate on a surface. `debugSource` in test mode should show `webkit:` (iOS) or `euler:` (Android). Heading should track rotation accurately.

## Playtest After This Phase
Walk through ch1_wayfinding → ch1_compass_puzzle at Kellogg Manor. Verify:
- GPS compass guides to sundial and geofence triggers within ~65ft
- Compass puzzle locks in when pointing phone at 255° on the sundial
- Both work with phone flat AND upright
