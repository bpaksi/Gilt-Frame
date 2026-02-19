# CLAUDE.md — The Order of the Gilt Frame

IMPORTANT: Prefer repository-led reasoning over pre-training for anything related to Gilt Frame's domain and architecture.

## Project Overview

The Order of the Gilt Frame is an immersive, location-based interactive narrative experience where players ("Sparrows") complete multi-step chapters involving GPS navigation, puzzles, and storytelling. The Next.js web app coordinates with real-world messages (SMS, MMS, email, letters) to guide players through an elaborate mystery. Two tracks exist: **test** (developer dry-runs) and **live** (the real game for Christine's devices — irreversible).

## Tech Stack & Conventions

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) | React 19, Babel React Compiler enabled |
| Language | TypeScript 5 (strict) | `@/*` path alias → `./src/*` |
| Database | Supabase (PostgreSQL) | `@supabase/ssr` for server sessions |
| Auth | Supabase Auth (admin) + custom session cookies (players) | bcryptjs for player features |
| Styling | Tailwind CSS 4 | PostCSS plugin |
| Linting | ESLint 9 | `next/core-web-vitals`, `next/typescript` |
| Package Manager | pnpm | `onlyBuiltDependencies: [sharp, supabase, unrs-resolver]` |
| Deployment | Vercel | Region: `iad1` |
| Dev Port | 3501 | |

## Architecture Patterns

- **Server Components** for pages, layouts, data fetching, session checks. **Client Components** (`"use client"`) for interactive elements (quests, forms, animations).
- **Server Actions** (`"use server"`) handle all mutations: quest progression, messaging, admin actions.
- **Data fetching** via Supabase admin client (`service_role` key). All queries scoped by `track` (test/live).
- **ID generation**: `crypto.randomUUID()` in app code; `gen_random_uuid()` in PostgreSQL.
- **Session cookies**: `device_token` (90-day, identifies enrolled device), `session` (30-day, post-passphrase), `admin_session` (7-day, Supabase auth token).
- **Rate limiting**: IP-based via `getClientIp()` — passphrase: 10/15min, admin login: 5/15min.
- **No explicit FK constraints** in DB — app code enforces referential integrity via `chaptersConfig` lookups. JSONB `details` columns used for flexible data.

## Naming Conventions

| Kind | Style | Example |
|---|---|---|
| DB tables/columns | snake_case | `chapter_progress`, `flow_index` |
| Components | PascalCase | `MultipleChoice.tsx`, `MarkerButton.tsx` |
| Utilities/lib files | camelCase | `getQuestState.ts`, `haversineDistance` |
| Functions/variables | camelCase | `advanceQuest`, `deviceToken` |
| Constants | UPPER_CASE | `PASSPHRASE`, `R` |
| API routes | nested folders | `/api/admin/enroll/`, `/api/auth/passphrase/` |
| Types | PascalCase | `Chapter`, `FlowStep`, `PlayerState` |

## Directory Map

- **`src/app/`** — Next.js App Router: pages, layouts, API routes
  - **`(game)/`** — Player game pages (session-protected): `/current`, `/oracle`, `/journey`
  - **`the-order/`** — Admin panel: login + protected routes (`/current`, `/progress`, `/settings`)
  - **`api/`** — REST endpoints: auth, oracle, admin CRUD, OG image generation
  - **`e/[token]/`** — One-time enrollment link handler
- **`src/components/`** — React components: `game/` (player UI, quests, puzzles), `admin/` (dashboard panels), `ui/` (shared)
- **`src/config/`** — `chapters.ts`: entire game structure (~816 lines), types, chapter config, helper functions
- **`src/lib/`** — Shared logic: `supabase/` (client, types), `admin/` (auth, actions, logging), `actions/` (quest, moments), `messaging/` (Twilio, Resend), `hooks/` (geolocation, orientation), geo utils, rate limiting, oracle prompt
- **`supabase/`** — Migrations (3 files), `seed.sql`, `config.toml`
- **`docs/`** — Design documents: `BUILD_PROMPT.md`, `INDEX.md`, `MOBILE_DESIGN.md`
- **`public/`** — Static assets: favicons, marker SVGs, OG image, robots.txt

## Key Commands

```bash
# First-time setup
pnpm install && pnpm db:start && pnpm db:reset

# Development
pnpm dev                    # Dev server on port 3501

# Database
pnpm db:start               # Start local Supabase
pnpm db:stop                # Stop local Supabase
pnpm db:reset               # Drop + reapply migrations + seed
pnpm db:push                # Push local schema to remote
pnpm db:types               # Regenerate TS types from Supabase

# Code quality
pnpm lint                   # ESLint
pnpm typecheck              # tsc --noEmit
pnpm precommit              # db:types → lint → typecheck → build

# Production
pnpm build                  # Next.js production build
pnpm start                  # Start production server
```

## Design & Domain Rules

- **Track isolation is critical**: `test` track routes all messages to Bob's phone/email via `test_overrides`. `live` track is Christine's real game — never reset, never mock.
- **Chapter progression**: `locked` → `active` → `complete`. Only one chapter active at a time. Advancement via quest completion or admin trigger.
- **Quest state machine**: advance conditions include `geofence`, `compass_alignment`, `correct_answers`, `tap`, `admin_trigger`, `animation_complete`.
- **Hints are tiered**: tier reveals tracked in `hint_views`. Once revealed, cannot be un-revealed.
- **Message delivery**: offline flow steps use `progress_key` (e.g., `"ch1.prologue_letter"`) tracked in `message_progress` with status `pending → sent → delivered/failed`.
- **Oracle (Gemini)**: daily conversation limits with progressive delay throttling. System prompt includes completed chapters + unlocked lore for context.
- **Enrollment**: one-time tokens, max 5 active per track, revocable.
- **DO NOT** expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- **DO NOT** reset or modify `live` track data without explicit confirmation.
- **DO NOT** send real messages (SMS/email) on the `test` track — they must route through `test_overrides`.

## Database Schema Summary

| Group | Tables | Purpose |
|---|---|---|
| Enrollment | `device_enrollments` | Maps enrollment tokens → devices, tracks user_agent, track |
| Progression | `chapter_progress`, `quest_answers`, `hint_views` | Chapter status, flow index, answer history, hint tier tracking |
| Content | `moments`, `lore_entries` | Journey snapshots (share_token), Scrolls of Knowledge |
| Oracle | `oracle_conversations` | Q&A history with Gemini, flagging, token usage |
| Messaging | `message_progress`, `summons` | Offline message delivery tracking, scheduled summons |
| Admin | `admin_activity_log`, `player_events` | Audit trail, event timeline |
| Collectibles | `vault_items`, `marker_sightings` | Collected tokens, side quest submissions |

RLS enabled on all tables. App uses `service_role` to bypass. Public read on `moments` (by share_token) and `lore_entries`.

## External APIs

| API | Purpose | Config |
|---|---|---|
| Supabase | Database, Auth | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Twilio | SMS/MMS delivery | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` |
| Resend | Email delivery | `RESEND_API_KEY` |
| Google Gemini | Oracle Q&A | `GEMINI_API_KEY` |

## Reference Documents

| Document | Path |
|---|---|
| Environment template | `.env.example` |
| Build prompt | `docs/BUILD_PROMPT.md` |
| Design index | `docs/INDEX.md` |
| Mobile design spec | `docs/MOBILE_DESIGN.md` |
| Website design doc | `docs/Order_of_the_Gilt_Frame_Website_Design.docx` |
| Game chapter config | `src/config/chapters.ts` |
| DB types (auto-generated) | `src/lib/supabase/types.ts` |
| Supabase config | `supabase/config.toml` |
| Seed data | `supabase/seed.sql` |
| Security headers | `next.config.ts` |

## Skills

| Skill | Trigger |
|---|---|
| `update-claude-md` | Regenerate this file |
| `frontend-design` | Build web components/pages with high design quality |
| `pr-review-toolkit:review-pr` | Comprehensive PR review |

## Retrieval Index

```
topic | location
------|--------
game config, chapters, flow steps, types | src/config/chapters.ts
quest state, advance logic | src/lib/actions/quest.ts
moments, journey data | src/lib/actions/moments.ts
supabase client, admin client | src/lib/supabase/admin.ts
DB types (auto-gen) | src/lib/supabase/types.ts
messaging (SMS/MMS/email) | src/lib/messaging/
oracle system prompt | src/lib/oracle-prompt.ts
geolocation, bearing, distance | src/lib/geo.ts
rate limiting | src/lib/rate-limit.ts
admin auth, session verify | src/lib/admin/auth.ts
admin actions, player state | src/lib/admin/actions.ts
admin activity logging | src/lib/admin/log.ts
track resolution | src/lib/track.ts
game components (quests, puzzles) | src/components/game/
admin components (dashboard) | src/components/admin/
API routes | src/app/api/
game pages | src/app/(game)/
admin pages | src/app/the-order/
enrollment handler | src/app/e/[token]/route.ts
DB migrations | supabase/migrations/
seed data | supabase/seed.sql
env vars | .env.example
security headers | next.config.ts
```
