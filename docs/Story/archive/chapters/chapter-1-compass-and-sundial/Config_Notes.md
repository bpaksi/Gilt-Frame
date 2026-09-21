# Chapter 1 — Config Notes (Testing Amendments)

Deviations from `Chapter_1_Lockdown.docx` confirmed during testing. The config values below are **correct and final**.

---

## ch1_briefing — Email Step Added

The lockdown doc did not include this step. An email step was added during development:

- **Step:** `ch1_briefing`
- **Type:** `email`
- **Name:** "The Keeper's Legacy"
- **Timing:** Manual, sent ~1 day before March 3
- **Purpose:** Narrative exposition — introduces the Keeper lore and website instruments (Journey, Oracle). This is the first email from the Order.
- **Rationale:** Emails serve exposition and engagement, not immediate action. The time-critical anniversary trigger is the ch1_initiation SMS. Having a pre-chapter email is consistent with how all subsequent chapters are structured.

---

## ch1_wayfinding — Geofence Radius

- **Lockdown spec:** ~30 meters
- **Config value:** `geofence_radius: 9` (meters)
- **Rationale:** Testing at the physical location showed 30m was too permissive. The sundial is in an open area; 9m ensures she has genuinely arrived before the phase transition.

---

## ch1_compass_puzzle — Compass Tolerance

- **Lockdown spec:** `±15°`
- **Config value:** `compass_tolerance: 8`
- **Rationale:** Testing showed 15° made the puzzle trivially easy to accidentally solve while panning. 8° requires deliberate alignment.

---

## ch1_compass_puzzle — Minimum Rotation

- **Lockdown spec:** `90°`
- **Config value:** `min_rotation: 45`
- **Rationale:** The meaning of `min_rotation` changed during implementation — it now represents the threshold in a different unit/context than originally specified. 45 is the correct value for the implemented behavior; it is not half the designed value, it is the correct value in the new interpretation.
