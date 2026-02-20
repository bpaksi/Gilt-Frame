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

All step types (messaging and website) use a `config: { ... }` wrapper for type-specific properties. Step-level properties (`order`, `type`, `name`, `trigger`, `delay_hours`) sit outside config.

```typescript
// Messaging step
{ order: 1, type: "sms", name: "...", trigger: "manual", config: { to, body, ... } }

// Messaging step with delay (scheduling)
{ order: 4, type: "sms", name: "...", trigger: "auto", delay_hours: 3, config: { to, body, ... } }

// Website step
{ order: 2, type: "website", name: "...", component: "MultipleChoice", advance: "correct_answers", config: { questions, hints } }

// Email step — uses template reference instead of inline body
{ order: 0, type: "email", name: "...", trigger: "manual", config: { to, subject, template: "ch2-mid-gap", ... } }
```

**Companion messages** are defined in the step config as `companion_message: { to, channel, body }`. At send time, each recipient (player + companion) gets its own `message_progress` row with a `to` field.

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
