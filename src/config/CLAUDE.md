# Config Architecture

## 3-Layer Abstraction

```
Layer 1: Contacts (contacts.ts — gitignored)
  Real people with PII: phone numbers, emails, names.

Layer 2: Tracks (in gameConfig.tracks)
  Maps abstract slots → Contact objects per track.
  test: all slots → Bob (dev dry-run)
  live: player → Christine, companion1 → Bob, companion2 → Sister

Layer 3: Chapters & Steps (in gameConfig.chapters)
  Use abstract recipients only: "player" or CompanionSlot ("companion1", "companion2", etc.)
  Never reference real names or PII.
```

## Recipient Resolution Chain

```
Step with to:"player"      → track.player      → Contact
Step with to:"companion1"  → track.companion1   → Contact
Step with to:"companion2"  → track.companion2   → Contact
companion_message.to       → track[slot]        → Contact
Ad-hoc (FreeformCompose)   → track[slot]        → Contact
```

Recipients are resolved directly from the track — no chapter-level indirection.

## Config Pattern

All step types (messaging and website) use a `config: { ... }` wrapper for type-specific properties. Step-level properties (`order`, `type`, `name`, `trigger`, `delay_minutes`, `delay_hours`) sit outside config.

```typescript
// Messaging step
{ order: 1, type: "sms", name: "...", trigger: "manual", config: { to, body, ... } }

// Messaging step with delay (QStash delayed delivery)
{ order: 4, type: "sms", name: "...", trigger: "auto", delay_minutes: 5, config: { to, body, ... } }
{ order: 4, type: "sms", name: "...", trigger: "auto", delay_hours: 3, config: { to, body, ... } }

// Website step
{ order: 2, type: "website", name: "...", component: "MultipleChoice", advance: "correct_answers", config: { questions, hints } }

// Email step — uses template reference instead of inline body
{ order: 0, type: "email", name: "...", trigger: "manual", config: { to, subject, template: "ch2-mid-gap", ... } }
```

**Companion messages** are defined in the step config as `companion_message: { to, channel, body }`. At send time, each recipient (player + companion) gets its own `message_progress` row with a `to` field.

## Quest Components

All website steps require `component: "<Name>"` and a matching `config: { ... }`. The advance condition is intrinsic to each component — never set it manually.

### Component Overview

| Component | Purpose | Advance condition | Has hints |
|---|---|---|:---:|
| `FindByGps` | GPS compass to location → tappable marker. Lite mode: marker only. | `tap` | ✓ |
| `MultipleChoice` | Sequential pool-based multiple-choice questions. | `correct_answers` | ✓ per question |
| `AlignBearing` | Point phone at target compass bearing and hold steady. | `compass_alignment` | — |
| `RevealNarrative` | Chapter reward: gilt-frame ceremony → staggered text reveal. | `tap` | — |
| `PassphraseEntry` | Text input for hidden acrostic passphrase from physical letter. | `passphrase` | — |
| `FindByText` | Text clue → physical search → multiple-choice confirmation. | `correct_answers` | ✓ guidance phase |

---

### `FindByGps` — `FindByGpsConfig`

Two modes determined by whether coordinates are present:
- **Full mode** (`target_lat` + `target_lng` present): Phase 1 GPS compass navigates to geofence → Phase 2 tappable marker.
- **Lite mode** (no coordinates): Phase 1 skipped; tappable marker only (narrative beat, no navigation).

| Param | Required | Description |
|---|:---:|---|
| `instruction` | **yes** | Tap instruction text shown in the marker phase. |
| `target_lat` | no | GPS latitude of the destination. Omit for lite mode. |
| `target_lng` | no | GPS longitude of the destination. Omit for lite mode. |
| `geofence_radius` | no | Meters — auto-transitions to marker phase on entry. If omitted while coords are present, an "I have arrived" button appears at <50 m. |
| `wayfinding_text` | no | Italic narrative text shown above the compass during navigation. |
| `distance_gates` | no | `Array<{above: number, text: string}>` sorted descending by `above`. First gate where distance > `above` wins. Falls back to `DEFAULT_DISTANCE_GATES` when omitted. |
| `hints` | no | Progressive hints shown via HintSystem during the compass phase. |
| `title_lines` | no | Lines of text shown above the tap marker in Phase 2. |
| `enable_label` | no | Label for the location permission button. Default: `"Enable Location"` |
| `arrived_label` | no | Label for the manual arrival button (shown when no geofence). Default: `"I have arrived"` |

---

### `MultipleChoice` — `MultipleChoiceConfig`

Presents questions sequentially. Wrong answers re-shuffle distractors from the pool. Correct answer on the last question triggers advance after a brief pause.

| Param | Required | Description |
|---|:---:|---|
| `questions` | **yes** | Array of `PoolQuestionItem` (see below). |

**`PoolQuestionItem` fields:**

| Field | Required | Description |
|---|:---:|---|
| `question` | **yes** | Question text. |
| `correct_answer` | **yes** | Exact correct answer string. |
| `answer_pool` | **yes** | Pool of wrong-answer options. `num_distractors` are randomly drawn per attempt. |
| `hints` | no | Per-question progressive hints revealed via the "?" button. Hint tiers are globally unique across questions. |
| `num_distractors` | no | Wrong options shown alongside the correct answer. Default `3`. |

---

### `AlignBearing` — `BearingPuzzleConfig`

Player rotates their phone to point at the target bearing and holds steady. Permission gate → compass → CompletionCountdown → advance.

| Param | Required | Description |
|---|:---:|---|
| `compass_target` | **yes** | Target bearing in degrees (0–359). |
| `compass_tolerance` | no | Acceptable degrees off-target. Tighter = harder. Default: CompassRose internal default. |
| `min_rotation` | no | Degrees the player must rotate through before the target can lock. Ensures exploration before solution. Default: CompassRose internal default. |
| `hold_seconds` | no | Seconds to hold on-target before solving. Default: CompassRose internal default. |
| `instruction` | no | Narrative text shown above the compass. |
| `locking_message` | no | Shown above the countdown after solving. Default: `"The compass yields its secret…"` |
| `resolution_message` | no | Shown after the countdown completes. Default: `"The way is found"` |
| `permission_message` | no | Shown on the orientation permission screen. Default: `"The compass awaits your permission."` |
| `hold_label` | no | Label shown when on-target and holding steady. Default: `"hold..."` |
| `approach_label` | no | Label shown when approaching the target. Default: `"closer..."` |
| `enable_label` | no | Label for the compass permission button. Default: `"Enable Compass"` |

---

### `RevealNarrative` — `StoryRevealConfig`

Two phases: (1) gilt-frame UnlockAnimation, then (2) staggered text reveal. `primary` is split on `. ` and each sentence fades in sequentially. `secondary` appears below the continue button.

| Param | Required | Description |
|---|:---:|---|
| `primary` | **yes** | Main narrative text. Split on `. ` into lines; each line fades in at fixed intervals (600 ms, 1800 ms, 3200 ms, …). |
| `secondary` | no | Muted smaller text shown below the continue button. Delays continue button appearance when set. |
| `skip_ceremony` | no | If `true`, skips the animation and opens directly to the text phase. Default `false`. |
| `unlock_text` | no | Label for the ceremony unlock button. Default: `"Press to Unlock"` |
| `continue_text` | no | Label for the continue button. Default: `"Continue"` |
| `chapter_name` | no | Small uppercase label rendered above the primary text (e.g. `"Chapter I Complete"`). |

---

### `PassphraseEntry` — `PassphraseEntryConfig`

Text input rendered inside PageLayout's orb ceremony. Comparison is case-insensitive. Wrong guesses shake and clear. Correct answer triggers advance after 800 ms.

| Param | Required | Description |
|---|:---:|---|
| `passphrase` | **yes** | The correct passphrase. Compared case-insensitively. |
| `placeholder` | no | Input placeholder text. Default: `"Speak the words."` |
| `error_message` | no | Error message shown on wrong passphrase. Default: `"You have not been summoned."` |

---

### `FindByText` — `FindByTextConfig`

Two-phase puzzle: (1) guidance — player reads the clue, uses hints, taps when ready; (2) identification — delegates to MultipleChoice with a single question.

| Param | Required | Description |
|---|:---:|---|
| `guidance_text` | **yes** | Initial text clue displayed in the guidance phase. Supports `\n` for line breaks. |
| `hints` | **yes** | Progressive hints for the guidance phase (pass `[]` for none). |
| `question` | **yes** | Single `PoolQuestionItem` for the identification phase. |
| `confirmation_instruction` | no | Button label on the guidance phase marker. Default: `"I think I've found it."` |

---

## Email Templates

Email content lives in `src/config/email/` as paired `.html` + `.txt` files. The `template` field in `EmailStepConfig` references the filename (without extension).

Loaded at runtime by `src/lib/messaging/email-templates.ts`.

### How to Add a New Email Template

1. Create `src/config/email/<template-name>.html` and `src/config/email/<template-name>.txt`
2. Reference as `template: "<template-name>"` in the email step config

## File Purposes

| File | Purpose | Gitignored? |
|------|---------|-------------|
| `types.ts` | All type definitions, component↔config pairing | No |
| `contacts.ts` | Real Contact objects with PII | **Yes** |
| `contacts.example.ts` | Empty template for recreating contacts.ts | No |
| `config.ts` | gameConfig data + getOrderedSteps helper | No |
| `index.ts` | Barrel — re-exports types + data | No |
| `email/*.html`, `email/*.txt` | Email templates (HTML + plaintext) | No |
| `lore/*.md` | Lore entries (Scrolls of Knowledge) as Markdown with YAML frontmatter | No |

## Lore Content (`lore/`)

Static narrative entries displayed on the Oracle page and injected into the Gemini system prompt. Each `.md` file has YAML frontmatter (`title`, `order`, `unlock_chapter_id`) and body content. Filenames are `NN-slug.md` — the filename (minus `.md`) becomes the entry `id`.

Loaded at runtime by `src/lib/lore.ts` which exports `getAllLore()` and `getUnlockedLore()`. Results are cached at module scope (no DB queries).

### How to Add a New Lore Entry

1. Create `src/config/lore/NN-slug.md` with frontmatter (`title`, `order`, `unlock_chapter_id`)
2. Set `unlock_chapter_id` to a chapter ID (e.g. `"ch2"`) to lock behind chapter completion, or `null` for always-unlocked

## How to Add a New Contact

1. Add the `Contact` export to `contacts.ts`
2. Add to `contacts.example.ts` with empty values
3. Assign to a companion slot in `gameConfig.tracks`

## How to Add a New Companion Slot

1. Add the slot name to `CompanionSlot` union in `types.ts`
2. Add the field to the `Track` type in `types.ts`
3. Assign Contact objects in both tracks in `config.ts`
4. Reference as `to: "companionN"` in step configs

## Documentation-Only Properties

Properties prefixed with `_` are documentation/instructional content, not game logic:
- `_description` — Track description
- `_trigger_note` — Explains when a messaging step fires
- `_content_notes` — Letter content notes
- `_signature` — Letter/email signature attribution

These may be displayed in the admin UI but are never used for game logic.

## Type Safety Guarantees

- `component: "X", config: { ... }` — TypeScript enforces the config matches the component
- `to: "bob"` — compile error (must be `"player"` or a `CompanionSlot`)
- `companion_message: { to: "companion4" }` — compile error (not in CompanionSlot)
- Missing `contacts.ts` — build fails (import error)
