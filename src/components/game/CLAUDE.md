# CLAUDE.md — Game Component Architecture

**These rules are architectural law.** Every component in `src/components/game/` must conform. Deviations require explicit, documented justification. When in doubt: ask before building, not after.

---

## Three-Tier Architecture

All game components live in one of three tiers. The tier determines what a component may import, what state it may hold, and what API shape it must expose.

```
┌──────────────────────────────────────────────┐
│  QUEST  (game/quest/)                        │
│  Orchestrates a full step. Owns progression. │
│  May call DB actions. Composes GAME + UI.    │
├──────────────────────────────────────────────┤
│  GAME  (game/*.tsx)                          │
│  Game mechanics, animation, user interaction │
│  No DB access. No hardcoded text or config.  │
├──────────────────────────────────────────────┤
│  UI  (components/ui/)                        │
│  Atomic primitives. Fully generic.           │
│  No game semantics. No hardcoded anything.   │
└──────────────────────────────────────────────┘
```

**Data flows downward only.** QUEST reads from config and passes props to GAME. GAME passes props to UI. Nothing reaches up.

---

## Tier Permissions Matrix

| Capability | UI | GAME | QUEST |
|---|:---:|:---:|:---:|
| Import from `src/components/ui/` | ✓ | ✓ | ✓ |
| Import from `src/components/game/` | — | ✓ | ✓ |
| Import from `@/lib/hooks/` | — | ✓ | ✓ |
| Import from `@/lib/geo` | — | ✓ | ✓ |
| Import from `@/lib/actions/` (DB/CRUD) | — | — | ✓ |
| Import from `@/config` | — | — | ✓ |
| Hold local UI state (animations, focus) | ✓ | ✓ | ✓ |
| Hold game phase state | — | ✓ | ✓ |
| Trigger advancement (`onAdvance()`) | — | ✓ | ✓ |
| Write to database | — | — | ✓ |
| Hardcode narrative text | — | — | — |
| Hardcode colors / sizes | — | — | — |
| Export `showcase` | ✓ | ✓ | ✓ |

---

## Shared Component API Contract

Every GAME and QUEST component must be usable in both the live game and the admin gallery **without modification**. This requires a consistent props shape.

### QUEST component props shape

```typescript
type QuestComponentProps = {
  // Required — typed config from @/config/types.ts
  config: SomeComponentConfig;

  // Required — universal advancement callback
  onAdvance: () => void;

  // Optional — DB context (omitted in gallery)
  chapterId?: string;
  stepIndex?: number;
  revealedHintTiers?: number[];

  // Optional — injectable server action overrides
  // QUEST uses these for testing and gallery isolation.
  // When omitted, QUEST falls back to its imported default action.
  recordAnswerAction?: (args: ...) => Promise<...>;
  revealHintAction?: (args: ...) => Promise<...>;
  // ...other action overrides specific to the component
};
```

### Rules

1. **`onAdvance: () => void` is universal.** Every component that can complete a step must accept this callback and call it exactly once on success. Never call `advanceQuest` directly from a GAME component.

2. **`config` is always typed.** Config types live in `src/config/types.ts`. No ad-hoc object shapes as props — if you need a new config shape, add it there.

3. **Action overrides follow a default/override pattern.** QUEST components import their action (e.g., `revealHint`) as the default and accept an optional override prop. GAME components never import actions — they receive callable props only.

   ```typescript
   // Correct pattern in a QUEST component
   import { revealHint } from "@/lib/actions/quest";

   type Props = {
     revealHintAction?: typeof revealHint;
   };

   function MyQuest({ revealHintAction = revealHint }: Props) { ... }
   ```

4. **No required DB context props.** `chapterId`, `stepIndex`, and `revealedHintTiers` are always optional. Components must render meaningfully without them (e.g., in the admin gallery).

---

## Gallery Integration

Every component in `game/` and `game/quest/` must export a `showcase` object at the module level. This is how the admin gallery discovers and renders components.

```typescript
import type { ShowcaseDefinition } from "@/components/showcase";

export const showcase: ShowcaseDefinition<Props> = {
  category: "quest",          // "ui" | "game" | "quest"
  label: "Multiple Choice",   // Human-readable name
  description: "Single-question puzzle with tiered hints and shake animation on wrong answers.",
  uses: ["HintSystem", "OptionButton", "OrnateDivider"],  // gallery component IDs rendered internally
  defaults: {                 // All required props satisfied; no DB needed
    config: { /* ... */ },
    onAdvance: () => {},
  },
};
```

### Rules

- `defaults` must satisfy every **required** prop so the gallery can render the component without any runtime context.
- `category` must match the component's tier.
- `showcase` must be a named export, not default export, and must be named exactly `showcase`.
- The `ShowcaseDefinition` type is in `src/components/showcase.ts`.
- **`uses` lists gallery component IDs that this component renders internally.** The admin gallery uses this to display "Uses / Used by" cross-references and to jump between related components. `uses` is optional but must be filled in for any component that renders other gallery-registered components. IDs must exactly match the `id` values in `showcaseRegistry.tsx`.

### Exception: Internal sub-components

A component may omit `showcase` and be excluded from `showcaseRegistry.tsx` if it meets **all** of the following:

1. It is consumed by exactly one parent component.
2. It is not independently composable in the game.
3. Its parent's gallery entry adequately represents it.

Document any such exception in the **Current Conformance Notes** table below.

| Internal sub-component | Owned by | Reason |
|---|---|---|
| `OrbAnimation` | `PageLayout` | Pure animation engine; only ever used by `PageLayout`. Preview via `PageLayout` gallery entry. |

---

## Styling

All colors, typography, and layout constants come from `src/components/ui/tokens.ts`.

```typescript
import { colors, fontFamily, MIN_TAP_TARGET, questContainerStyle } from "@/components/ui/tokens";

// ✓ Correct
style={{ color: colors.gold, fontFamily: fontFamily.serif }}

// ✗ Wrong — hardcoded magic literal
style={{ color: "rgba(200, 165, 75, 0.9)" }}
```

### Token reference

| Token | Value | Use for |
|---|---|---|
| `colors.gold` | `rgba(200, 165, 75, 1)` | Primary accent, active states |
| `colors.gold90` … `colors.gold08` | opacity variants | Borders, backgrounds, disabled states |
| `colors.errorRed70`, `colors.errorRed50` | error red variants | Error/shake states |
| `colors.bg` | `#0a0a0a` | Page background |
| `colors.surface` | `#111111` | Card/panel backgrounds |
| `fontFamily.serif` | Georgia, serif | All narrative text |
| `MIN_TAP_TARGET` | `"44px"` | Minimum interactive element size |
| `questContainerStyle` | flex column, centered, padded | Quest wrapper layout |

> **Note:** Many existing components predate the token system and still use raw `rgba(200, 165, 75, ...)` literals. When editing an existing component, migrate its color references to tokens. When creating a new component, use tokens from the start.

---

## Anti-Patterns

These must never appear in new code. Flag them in review.

### 1. Direct action import in a GAME component

```typescript
// ✗ GAME tier importing from @/lib/actions/
import { revealHint } from "@/lib/actions/quest";  // NOT allowed in game/*.tsx
```

`revealHint` belongs in QUEST components (`game/quest/`). GAME components receive callables as props.

### 2. Hardcoded narrative text

```typescript
// ✗ Text baked into a GAME component
<p>Walk toward the painting until you feel the pull.</p>

// ✓ Text comes from config
<p>{config.instruction}</p>
```

GAME components must accept all displayed text via `config` or props.

### 3. Hardcoded colors or sizes

```typescript
// ✗ Magic literal
style={{ color: "rgba(200, 165, 75, 0.9)", minHeight: "44px" }}

// ✓ Token reference
style={{ color: colors.gold90, minHeight: MIN_TAP_TARGET }}
```

### 4. Missing showcase export

Every component in `game/` and `game/quest/` must export `showcase`. Components without it are invisible to the admin gallery and untestable in isolation.

### 5. `onAdvance` called multiple times

Quest components must ensure `onAdvance()` fires exactly once. Use a ref guard or phase state to prevent double-firing.

```typescript
// ✓ Guard against double-advance
const advancedRef = useRef(false);

function handleSuccess() {
  if (advancedRef.current) return;
  advancedRef.current = true;
  onAdvance();
}
```

### 6. Upward imports between tiers

UI components must not import from `game/`. GAME components must not import from `game/quest/`. Data and callbacks only flow downward.

### 7. Config shape defined inline

```typescript
// ✗ Ad-hoc type defined in the component file
type MyConfig = { prompt: string; answer: string };

// ✓ Config type lives in src/config/types.ts and is imported
import type { PassphrasePuzzleConfig } from "@/config/types";
```

---

## Current Conformance Notes

The following known deviations exist in the codebase as of the time this document was written. New code must not introduce new deviations; existing deviations should be remediated opportunistically.

| Issue | Affected Components |
|---|---|
| Hardcoded `rgba(200, 165, 75, ...)` instead of token | All quest components, most game components |
| `QuestStateMachine` missing showcase export | `game/quest/QuestStateMachine.tsx` |
| `PuzzleSolve`, `StateFader`, `OracleView`, `AskTheOracle`, `OracleHistory`, `ScrollsOfKnowledge`, `LandingPage`, `JourneyTimeline`, `MomentCard`, `MomentDetail` missing showcase | Various `game/*.tsx` |

**Remediated:**

| Issue | Resolution |
|---|---|
| `HintSystem` (GAME tier) imported `revealHint` directly | Fixed — `HintSystem` now accepts only `onHintReveal` prop; no action imports. |
| `MultipleChoice` recorded wrong answers with `correct_answer` instead of the selected option | Fixed — `AnswerQuestion.onWrong` now passes the selected string; `MultipleChoice.handleWrong` uses it. |
| `FindByText` did not forward `onAnswerRecord` to its inner `MultipleChoice` | Fixed — `onAnswerRecord` added to `FindByTextProps` and forwarded. |

---

## Quick Reference

```
game/quest/   → QUEST tier: orchestration, DB access allowed, config-driven
game/*.tsx    → GAME tier: mechanics/animation, no DB, props-only
components/ui/→ UI tier: atomic, no game semantics, no hardcoded anything

All three tiers:
  ✓ export showcase: ShowcaseDefinition<Props>
  ✓ set showcase.uses to list any other gallery components rendered internally
  ✓ use tokens from @/components/ui/tokens
  ✓ receive all text/config via props, never hardcode

QUEST only:
  ✓ import from @/lib/actions/
  ✓ accept optional action override props (recordAnswerAction?, revealHintAction?, ...)
  ✓ call onAdvance() exactly once on step completion

GAME only:
  ✓ import from @/lib/hooks/, @/lib/geo
  ✓ compose UI components
  ✗ never import from @/lib/actions/
  ✗ never hardcode narrative text
```
