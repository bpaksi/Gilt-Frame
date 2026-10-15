# Docs — Index

This folder holds the story bible, visual design direction, and build planning for The Order of the Gilt Frame, organized into **two independent tracks** plus shared production docs. For the technical/architecture docs, see the root [`CLAUDE.md`](../CLAUDE.md) and [`website/src/config/CLAUDE.md`](../website/src/config/CLAUDE.md).

## Story track — `Story/`

Backstory, arc, and the pluggable engine that lets content slot in as real locations and people get confirmed. Start with the README-equivalent read order below; the templates are what make new chapters authorable without reworking the spine.

| File | Description |
|------|-------------|
| [Story/Foundation_Bible.md](Story/Foundation_Bible.md) | The rebuilt canon — single source of truth for the backstory. Supersedes older lore where they disagree. |
| [Story/Story_Spine.md](Story/Story_Spine.md) | The fixed emotional architecture — location-agnostic, the six-beat spine everything else assembles around. |
| [Story/Chapter_Template.md](Story/Chapter_Template.md) | The repeatable eight-beat structure every chapter follows, independent of location/person. |
| [Story/Location_Person_Card_Template.md](Story/Location_Person_Card_Template.md) | The reusable per-stop card (real person, real facts, riddle key, logistics) — the unit that plugs into a chapter slot. |
| [Story/Chapter_Map.md](Story/Chapter_Map.md) | **The single authoritative status table** — which slots are locked vs. TBD, cross-checked against `config.ts`. If anything else disagrees with this file, this file wins. |
| [Story/Story_Review_Continuity_and_Themes.md](Story/Story_Review_Continuity_and_Themes.md) | Continuity & themes review against the stated vision (Sept 2026) — most of its recommendations are now addressed by the Bible/Spine/templates above; kept for the craft notes (Dan Brown riddle mechanics, companion thread). |
| `Story/archive/` | Superseded design docs, kept for reference only. See below. |

## UI track — `UI/`

Visual/tonal design, independent of story content — works entirely off the Tone doc and the live Component Gallery, needs no confirmed locations or finished copy to make progress.

| File | Description |
|------|-------------|
| [UI/README.md](UI/README.md) | How the UI track works independently of the Story track, and where the two meet. |
| [UI/Tone_North_Star.md](UI/Tone_North_Star.md) | The bridge from story to look-and-feel — constraints for any design work. |
| [UI/create-letters.md](UI/create-letters.md) | Physical artifact workflow: producing and printing the letters (PDF prep, FedEx Office). |
| [UI/gilt-frame-pendant-project.md](UI/gilt-frame-pendant-project.md) | Physical artifact: design notes for the completion-prize pendant. |
| [UI/Visual_Language_Decisions.md](UI/Visual_Language_Decisions.md) | Where each of the Tone doc's six handoff questions actually stands in the code today, and the open items. |

## Shared — `docs/` root

| File | Description |
|------|-------------|
| [Build_Schedule.md](Build_Schedule.md) | Backward plan from launch: story build + technical revival, phased. Spans both tracks, so it stays at the root. |

## Archive

`Story/archive/` holds superseded design docs kept for reference only — the old chapter-by-chapter `.docx` design files, glossary, lore bible, shopping list, website design doc, and the earlier story critique, from before the story was rebuilt around `Foundation_Bible.md`. Don't treat anything under `archive/` as current; where it conflicts with `Foundation_Bible.md`, `Story_Spine.md`, or `Chapter_Map.md`, those win.

## Architecture (for context — lives in code, not here)

- **Navigation:** 3-tab bottom bar (Current, The Journey, The Oracle)
- **Primary device:** Phone
- **Sharing:** Public `/moment/[token]` URLs with OG meta for social previews
- **State engine:** Unified `steps[]` array per chapter, driving both the player app and the admin panel
- **Config:** `website/src/config/config.ts` is the single source of truth for *implemented* chapter content (see `website/src/config/CLAUDE.md` for the schema) — but `Story/Chapter_Map.md` is the source of truth for what's *planned*. The two are allowed to disagree; `config.ts` should only ever contain what's actually built.
- **Component Gallery:** `/the-order/gallery` renders every UI/game/quest component in isolation via its own fixture data — the mechanism the UI track works from.

## Tech Stack

- **Framework:** Next.js (App Router, `website/src` directory)
- **Database:** Supabase (local dev via `pnpm db:start`, see [`../supabase/README.md`](../supabase/README.md))
- **Hosting:** Vercel
- **AI:** Google Gemini (Oracle responses)
- **SMS:** Twilio (summons notifications, inbound keywords)
- **Device APIs:** Geolocation API (GPS wayfinding), DeviceOrientationEvent (compass/puzzle)
