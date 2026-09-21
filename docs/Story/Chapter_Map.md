# The Gilt Frame — Chapter Map

**The single, current, authoritative status of every chapter slot. If this disagrees with anything else — glossary, folder names, `config.ts`, old design docs — this wins.**

The Story Review (Sept 2026) found the chapter map had forked three ways (an 8-chapter glossary, folder names on disk, and the actual documents inside them), and that the drift had reached into `config.ts`. Those old, conflicting drafts are now in `Story/archive/` and are historical reference only. This document exists so that never happens again: one table, kept in sync with reality, updated the moment a stop is confirmed or a chapter is written.

**Update this file whenever:** a Build Schedule Phase 2 stop gets confirmed, a Location & Person Card gets written, or `config.ts` gains/changes a chapter.

---

## Current status (as of 2026-09-18)

| Slot | Beat (Story Spine) | Working title | Location status | Card written? | `config.ts` key | `config.ts` matches this? |
|---|---|---|---|---|---|---|
| Prologue | — (setup) | The Summons | Locked — letter + acrostic, no physical location | N/A | `ch0` | ✅ |
| 1 | 1 — Attention | The Compass and the Sundial | **Locked** — Kellogg Manor, Michigan | ✅ (see Location & Person Card template) | `ch1` | ✅ |
| 2 | 2 — Courage | The Gallery of Whispers | **Locked** — Art Institute of Chicago | ✅, but missing its Beat-4 riddle key (open item) | `ch2` | ✅ |
| 3 | 3 — Risk | *(unnamed — was "The Keeper's Archive")* | **TBD** — pending confirmed 2027 stop | ❌ | `ch3` | ❌ **stale.** `config.ts` still says `"Kalamazoo / KIA / Kellogg Manor"` — a pre-canon placeholder from the old 8-chapter draft. Treat as unset, not as a decision. `steps: {}` (empty) confirms nothing has actually been authored here yet. |
| 4 | 4 — Being Seen | *(unnamed)* | **TBD** | ❌ | *(none yet)* | — |
| 5 | 5 — Loss | *(unnamed)* | **TBD** | ❌ | *(none yet)* | — |
| 6 / Finale | 6 — Love Anyway | The Final Frame | **TBD** — location open; the reveal mechanism (Story Spine §4) is fully specified regardless of where it lands | ❌ | *(none yet)* | — |
| — | — | GPS Test | N/A — developer fixture, not a story chapter | N/A | `dev_gps_test` | ✅ Renamed out of the `chN` sequence (was `ch4`) so it can't be mistaken for Beat 4 or counted toward chapter-count/bird-degree calibration. |

**Chapter count (N):** 6 movements + Prologue, if beats 3-6 each get their own stop. Per Story Spine §6, N=6 lands the ladder exactly at Eagle for the finale, no folding needed — but this is provisional until Phase 2 confirms how many real stops the actual 2027 trip supports. If N comes in lower, fold per Story Spine §6 (courage+risk pair naturally; never fold loss with love-anyway). If higher, add connective fragments rather than new beats.

---

## What "locked" vs "candidate" vs "TBD" means here

- **Locked** — a real place with a written [Location & Person Card](Location_Person_Card_Template.md), confirmed accessible, wired into `config.ts` with real steps.
- **Candidate** — a real place under consideration (may exist in `Story/archive/` old drafts — Crystal Bridges, Meijer Gardens, Sleeping Bear Dunes are all candidates from earlier design passes) but not yet confirmed against Build Schedule Phase 2's real travel window.
- **TBD** — genuinely open. No candidate yet, or the candidate hasn't been checked against the Foundation Bible's historical spine (§5) for a real person to anchor it.

None of the archived old chapter names, folder structures, or location assignments should be treated as decided. When Phase 2 confirms a real stop, author a new Location & Person Card, update this table, and only then update `config.ts`.

---

## Why this stays separate from `config.ts`

`config.ts` is implementation — it should only contain chapters that are actually ready to run (real steps, real coordinates, real copy). This document is allowed to be aspirational and provisional, tracking beats that exist conceptually before a single line of config is written for them. Keeping the two separate is what makes "plug-in playable" actually work: the Story track (this file, the Bible, the Spine, the templates) can move at the speed of your travel planning, while the code stays honest about what's actually built.
