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
  Use abstract recipients only: "player" or "companion".
  Never reference real names or PII.
```

## Recipient Resolution Chain

```
Step with to:"player"    → track.player                      → Contact
Step with to:"companion" → chapter.companion ("companion1")  → track.companion1 → Contact
companion_message        → chapter.companion                 → track[slot]       → Contact
Ad-hoc (FreeformCompose) → "player"|"companion1"|"companion2"→ track[slot]       → Contact
```

## File Purposes

| File | Purpose | Gitignored? |
|------|---------|-------------|
| `types.ts` | All type definitions, component↔config pairing | No |
| `contacts.ts` | Real Contact objects with PII | **Yes** |
| `contacts.example.ts` | Empty template for recreating contacts.ts | No |
| `chapters.ts` | gameConfig data + getOrderedSteps + type re-exports | No |

## How to Add a New Contact

1. Add the `Contact` export to `contacts.ts`
2. Add to `contacts.example.ts` with empty values
3. Assign to a companion slot in `gameConfig.tracks`

## How to Add a New Companion Slot

1. Add the slot name to `CompanionSlot` union in `types.ts`
2. Add the field to the `Track` type in `types.ts`
3. Assign Contact objects in both tracks in `chapters.ts`
4. Reference as `companion: "companionN"` in the chapter

## Type Safety Guarantees

- `component: "X", config: { ... }` — TypeScript enforces the config matches the component
- `to: "bob"` — compile error (must be `"player"` or `"companion"`)
- `companion: "companion4"` — compile error (not in CompanionSlot)
- `side_effect: "unknown"` — compile error (not in SideEffect)
- Missing `contacts.ts` — build fails (import error)
