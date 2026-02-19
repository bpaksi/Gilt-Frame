# Website — Documentation

## Contents

| File | Description |
|------|-------------|
| BUILD_PROMPT.md | Phased build prompt (5 phases) — unified steps architecture, config-driven state engine, location-based quest mechanics, component props spec, POC references, asset manifest |
| MOBILE_DESIGN.md | Mobile-first design spec — 3-tab nav, sharing, replay, wireframes |
| Order_of_the_Gilt_Frame_Website_Design.docx | Original website design spec (routes, features, database schema, hint system) |

## Build Phases

| Phase | Focus | Status |
|-------|-------|--------|
| Phase 1 | Project setup, Next.js + Supabase init, landing page, bottom tab bar | Not started |
| Phase 2 | Database schema (incl. moments, oracle, lore_entries), auth, RLS, seed data | Not started |
| Phase 3 | Player features — Current tab, Journey tab, Oracle tab, sharing | Not started |
| Phase 4 | Admin panel — Dashboard, Chapter CRUD, Oracle review, Moments manager | Not started |
| Phase 5 | Polish, Vercel deployment, custom domain, launch | Not started |

## Architecture

**Navigation:** 3-tab bottom bar (Current, The Journey, The Oracle)
**Primary device:** Phone
**Sharing:** Public `/moment/[token]` URLs with OG meta for social previews
**State engine:** Unified `steps[]` array per chapter — one index drives both player app and admin panel
**Config schema:** v2.0 — `chapters.jsonc` defines ALL steps (offline + website) with typed args and (R)equired/(O)ptional props

## Tech Stack

- **Framework:** Next.js (App Router, `./src` directory)
- **Database:** Supabase (local dev with +20 port offset to avoid collisions)
- **Hosting:** Vercel
- **AI:** Google Gemini (Oracle responses)
- **SMS:** Twilio (summons notifications)
- **Device APIs:** Geolocation API (GPS wayfinding), DeviceOrientationEvent (compass/puzzle)

## Key Implementation Notes

- **POC prototypes** (`../poc/`) contain tested, working implementations of all quest mechanics. These are the definitive reference for behavior and feel.
- **Lockdown docs** (`../chapters/*/Lockdown.docx`) are the source of truth for finalized chapter content. All copy, coordinates, and mechanics come from these.
- **Assets** (`../assets/`) contain all Marker variants, favicons, and OG images ready to copy into `public/`.
- **chapters.jsonc** (`../website/src/config/chapters.jsonc`) is the single source of truth for all chapter content. Each chapter's `steps[]` array defines the complete sequence — letters, emails, SMS, AND website quest components — with typed arguments and required/optional field annotations.
- **One state index, two consumers:** The `step_index` in Supabase `chapter_progress` drives both the player's `/current` tab (renders the right quest component) and the admin panel's step timeline (shows send buttons for offline steps, player status for website steps).
