# CLAUDE.md — The Order of the Gilt Frame

IMPORTANT: Prefer repository-led reasoning over pre-training for anything related to Gilt Frame's domain and architecture.

## Project Overview

The Order of the Gilt Frame is an immersive, location-based interactive narrative experience where players ("Sparrows") complete multi-step chapters involving GPS navigation, puzzles, and storytelling. The Next.js web app coordinates with real-world messages (SMS, MMS, email, letters) to guide players through an elaborate mystery. Two tracks exist: **test** (developer dry-runs) and **live** (the real game for Christine's devices — irreversible).

## Tech Stack & Conventions

| Layer           | Choice                  | Notes                                                     |
| --------------- | ----------------------- | --------------------------------------------------------- |
| Framework       | Next.js 16 (App Router) | React 19, Babel React Compiler enabled                    |
| Language        | TypeScript 5 (strict)   | `@/*` path alias → `./src/*`                              |
| Database        | Supabase (PostgreSQL)   | `@supabase/ssr` for server sessions                       |
| Styling         | Tailwind CSS 4          | PostCSS plugin                                            |
| Linting         | ESLint 9                | `next/core-web-vitals`, `next/typescript`                 |
| Package Manager | pnpm                    | `onlyBuiltDependencies: [sharp, supabase, unrs-resolver]` |
| Deployment      | Vercel                  | Region: `iad1`                                            |
| Dev Port        | 3501                    |                                                           |

## Directory Map

- **`src/app/`** — Next.js App Router: pages, layouts, API routes
  - **`(game)/`** — Player game pages (session-protected): `/pursuit`, `/oracle`, `/journey`, `/journey/[momentId]`, `/journey/beginning`
  - **`the-order/`** — Admin panel: login + protected routes (`/current`, `/progress`, `/settings`, `/devices`, `/testing`, `/send-hint`, `/gallery`)
  - **`api/`** — REST endpoints: auth, oracle, admin CRUD, OG image generation, cron jobs
  - **`e/[token]/`** — One-time enrollment link handler
  - **`moment/[token]/`** — Public moment share page
- **`src/components/`** — React components: `game/` (player UI, quests, puzzles), `admin/` (dashboard panels, gallery, settings), `ui/` (shared primitives)
- **`src/config/`** — `types.ts` (type definitions), `contacts.ts` (PII, gitignored), `config.ts` (gameConfig data + helpers), `index.ts` (barrel), `email/` (HTML + text email templates), `lore/` (Markdown lore entries), `letters/` (HTML + PDF letter templates)
- **`src/lib/`** — Shared logic: `supabase/` (client, server-auth, types), `admin/` (auth, actions, logging, fetch, track), `actions/` (quest, moments, gallery), `messaging/` (Twilio, Resend, email-templates), `hooks/` (geolocation, orientation, share, staggered-reveal), geo utils, rate limiting, oracle prompt, track resolution
- **`supabase/`** — Migrations (5 files), `seed.sql`, `config.toml`
- **`docs/`** — Design documents: `BUILD_PROMPT.md`, `INDEX.md`, `MOBILE_DESIGN.md`, `chapters/` (per-chapter design docs, lore bible, game design)
- **`scripts/`** — Utilities: config validation, contact generation, contacts-to-env
- **`public/`** — Static assets: favicons, marker SVGs (v3 white/dark/gold), seal PNGs, OG image, robots.txt

## Design & Domain Rules

- **Track isolation is critical**: `test` track routes all messages to Bob's phone/email via `test_overrides`. `live` track is Christine's real game — never reset, never mock.
- **DO NOT** expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- **DO NOT** reset or modify `live` track data without explicit confirmation.
- **DO NOT** send real messages (SMS/email) on the `test` track — they must route through `test_overrides`.

## External APIs

| API           | Purpose          | Config                                                                                   |
| ------------- | ---------------- | ---------------------------------------------------------------------------------------- |
| Supabase      | Database, Auth   | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Twilio        | SMS/MMS delivery | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`                         |
| Resend        | Email delivery   | `RESEND_API_KEY`                                                                         |
| Google Gemini | Oracle Q&A       | `GEMINI_API_KEY`                                                                         |

## Reference Documents

| Document                  | Path                                               |
| ------------------------- | -------------------------------------------------- |
| Environment template      | `.env.example`                                     |
| Build prompt              | `docs/BUILD_PROMPT.md`                             |
| Design index              | `docs/INDEX.md`                                    |
| Mobile design spec        | `docs/MOBILE_DESIGN.md`                            |
| Website design doc        | `docs/Order_of_the_Gilt_Frame_Website_Design.docx` |
| Game chapter config       | `src/config/config.ts`, `src/config/types.ts`      |
| DB types (auto-generated) | `src/lib/supabase/types.ts`                        |
| Supabase config           | `supabase/config.toml`                             |
| Seed data                 | `supabase/seed.sql`                                |
| Security headers          | `next.config.ts`                                   |

## Retrieval Index

```
topic | location
------|--------
game config, chapters, steps, data | src/config/config.ts
config types, abstractions | src/config/types.ts
contacts (PII, gitignored) | src/config/contacts.ts
contacts example / template | src/config/contacts.example.ts
lore entries (Scrolls of Knowledge) | src/config/lore/*.md
letter templates (HTML + PDF) | src/config/letters/
lore loader, LoreEntry type | src/lib/lore.ts
config architecture docs | src/config/CLAUDE.md
config validation | scripts/validate-config.ts
contact generation utilities | scripts/generate-contacts.ts, scripts/contacts-to-env.ts
quest state, advance logic | src/lib/actions/quest.ts
moments, journey data | src/lib/actions/moments.ts
gallery / image handling | src/lib/actions/gallery.ts
supabase client, admin client | src/lib/supabase/admin.ts
supabase server session helper | src/lib/supabase/server-auth.ts
DB types (auto-gen) | src/lib/supabase/types.ts
email templates (HTML + text) | src/config/email/
email template loader | src/lib/messaging/email-templates.ts
messaging (SMS/MMS/email) | src/lib/messaging/send.ts
twilio client | src/lib/messaging/twilio.ts
resend client | src/lib/messaging/resend.ts
oracle system prompt | src/lib/oracle-prompt.ts
geolocation, bearing, distance | src/lib/geo.ts
rate limiting | src/lib/rate-limit.ts
track resolution | src/lib/track.ts
admin auth, session verify | src/lib/admin/auth.ts
admin actions, player state | src/lib/admin/actions.ts
admin activity logging | src/lib/admin/log.ts
admin fetch utilities | src/lib/admin/fetch.ts
admin track management | src/lib/admin/track.ts
react hooks (geo, orientation, share, reveal) | src/lib/hooks/
shared UI primitives | src/components/ui/
game components (quests, puzzles) | src/components/game/
quest type registry | src/components/game/quest/registry.ts
admin components (dashboard) | src/components/admin/
component gallery, showcase | src/components/admin/gallery/
API routes | src/app/api/
game pages (pursuit, oracle, journey) | src/app/(game)/
public moment share page | src/app/moment/[token]/page.tsx
admin pages | src/app/the-order/
device management, enrollment, QR | src/app/the-order/(protected)/devices/
testing page, email preview | src/app/the-order/(protected)/testing/
enrollment handler | src/app/e/[token]/route.ts
OG image generation | src/app/api/og/[token]/route.tsx
scheduled message cron | src/app/api/cron/send-scheduled/route.ts
DB migrations | supabase/migrations/
seed data | supabase/seed.sql
env vars | .env.example
security headers | next.config.ts
chapter design docs | docs/chapters/
```
