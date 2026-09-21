# CLAUDE.md — The Order of the Gilt Frame

IMPORTANT: Prefer repository-led reasoning over pre-training for anything related to Gilt Frame's domain and architecture.

## Project Overview

The Order of the Gilt Frame is an immersive, location-based interactive narrative experience where players ("Sparrows") complete multi-step chapters involving GPS navigation, puzzles, and storytelling. The Next.js web app coordinates with real-world messages (SMS, MMS, email, letters) to guide players through an elaborate mystery. Two tracks exist: **test** (developer dry-runs) and **live** (the real game for Christine's devices — irreversible).

## Repo Layout

This repo root holds three top-level things:

- **`website/`** — the Next.js app (all source code, its own `package.json`/`pnpm-workspace.yaml`/`.gitignore`). Run all `pnpm` commands from inside `website/`.
- **`supabase/`** — the Postgres schema/migrations/seed data, shared infrastructure for the app (deliberately kept outside `website/`; the Supabase CLI walks up from `website/` to find it).
- **`docs/`** — story bible, design docs, and build planning (not code). See `docs/INDEX.md`.

## Tech Stack & Conventions

| Layer           | Choice                  | Notes                                                          |
| --------------- | ----------------------- | --------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router) | React 19, Babel React Compiler enabled                         |
| Language        | TypeScript 5 (strict)   | `@/*` path alias → `./src/*` (relative to `website/`)          |
| Database        | Supabase (PostgreSQL)   | `@supabase/ssr` for server sessions                             |
| Styling         | Tailwind CSS 4          | PostCSS plugin                                                  |
| Linting         | ESLint 9                | `next/core-web-vitals`, `next/typescript`                       |
| Package Manager | pnpm                    | build-script allowlist lives in `website/pnpm-workspace.yaml`   |
| Deployment      | Vercel                  | Region: `iad1`                                                  |
| Dev Port        | 3501                    | `cd website && pnpm dev`                                        |

## Directory Map

- **`website/src/app/`** — Next.js App Router: pages, layouts, API routes
  - **`(game)/`** — Player game pages (session-protected): `/pursuit`, `/oracle`, `/journey`, `/journey/[momentId]`, `/journey/beginning`
  - **`the-order/`** — Admin panel: login + protected routes (`/current`, `/progress`, `/settings`, `/devices`, `/testing`, `/send-hint`, `/gallery`)
  - **`api/`** — REST endpoints: auth, oracle, admin CRUD, OG image generation, join, webhooks
  - **`e/[token]/`** — One-time enrollment link handler
  - **`moment/[token]/`** — Public moment share page
  - **`join/`, `contact/`, `privacy/`, `terms/`** — Public compliance / signup pages
- **`website/src/components/`** — React components: `game/` (player UI, quests, puzzles), `admin/` (dashboard panels, gallery, settings), `page/` (marketing/compliance page sections), `ui/` (shared primitives)
- **`website/src/config/`** — `types.ts` (type definitions), `contacts.ts` (PII, gitignored), `config.ts` (gameConfig data + helpers), `index.ts` (barrel), `email/` (HTML + text email templates), `lore/` (Markdown lore entries), `letters/` (HTML + PDF letter templates)
- **`website/src/lib/`** — Shared logic: `supabase/` (client, server-auth, types), `admin/` (auth, actions, logging, fetch, track), `actions/` (quest, moments, gallery), `messaging/` (Twilio, Resend, email-templates, QStash), `sms/` (inbound conversations, keywords, subscribers, Twilio signature validation), `hooks/` (geolocation, orientation, share, staggered-reveal), geo utils, rate limiting, oracle prompt, track resolution
- **`website/scripts/`** — Utilities run via `pnpm`: config validation, contact generation, contacts-to-env
- **`website/public/`** — Static assets: favicons, marker SVGs (v3 white/dark/gold), seal PNGs, OG image, robots.txt
- **`supabase/`** — Migrations (9 files), `seed.sql`, `config.toml`
- **`docs/`** — split into two independent tracks (see `docs/INDEX.md`): `Story/` (backstory, arc, chapter/card templates, `Chapter_Map.md`) and `UI/` (tone doc, visual language decisions) — plus the shared `Build_Schedule.md` at the root (`UI/` also holds the physical-artifact docs: letters, pendant)

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
| Upstash QStash| Delayed delivery | `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY`                 |

## Local Development

```bash
cd website
pnpm install
cp src/config/contacts.example.ts src/config/contacts.ts   # fill in real values for a live/test run
cp .env.example .env.local                                 # fill in Supabase/Twilio/Resend/Gemini/QStash keys
pnpm db:start      # starts local Supabase (needs Docker running)
pnpm db:types       # regenerate src/lib/supabase/types.ts after schema changes
pnpm dev            # http://localhost:3501
```

`pnpm build` (and `precommit`) also run `scripts/generate-contacts.ts`, which requires `src/config/contacts.ts` to exist first — the build will fail without it, by design (never let a placeholder ship).

## Reference Documents

| Document                  | Path                                                   |
| ------------------------- | ------------------------------------------------------- |
| Environment template      | `website/.env.example`                                  |
| Docs index                | `docs/INDEX.md`                                         |
| Story bible (canon)       | `docs/Story/Foundation_Bible.md`                          |
| Story spine               | `docs/Story/Story_Spine.md`                               |
| Chapter map (status)      | `docs/Story/Chapter_Map.md`                                |
| Tone & creative north star| `docs/UI/Tone_North_Star.md`                              |
| Build schedule            | `docs/Build_Schedule.md`                                 |
| Game chapter config       | `website/src/config/config.ts`, `website/src/config/types.ts` |
| DB types (auto-generated) | `website/src/lib/supabase/types.ts`                      |
| Supabase config           | `supabase/config.toml`                                   |
| Seed data                 | `supabase/seed.sql`                                       |
| Security headers          | `website/next.config.ts`                                  |

## Retrieval Index

```
topic | location
------|--------
game config, chapters, steps, data | website/src/config/config.ts
config types, abstractions | website/src/config/types.ts
contacts (PII, gitignored) | website/src/config/contacts.ts
contacts example / template | website/src/config/contacts.example.ts
lore entries (Scrolls of Knowledge) | website/src/config/lore/*.md
letter templates (HTML + PDF) | website/src/config/letters/
lore loader, LoreEntry type | website/src/lib/lore.ts
config architecture docs | website/src/config/CLAUDE.md
config validation | website/scripts/validate-config.ts
contact generation utilities | website/scripts/generate-contacts.ts, website/scripts/contacts-to-env.ts
quest state, advance logic | website/src/lib/actions/quest.ts
moments, journey data | website/src/lib/actions/moments.ts
gallery / image handling | website/src/lib/actions/gallery.ts
supabase client, admin client | website/src/lib/supabase/admin.ts
supabase server session helper | website/src/lib/supabase/server-auth.ts
DB types (auto-gen) | website/src/lib/supabase/types.ts
email templates (HTML + text) | website/src/config/email/
email template loader | website/src/lib/messaging/email-templates.ts
messaging (SMS/MMS/email, scheduling) | website/src/lib/messaging/send.ts
QStash delayed delivery client | website/src/lib/messaging/qstash.ts
QStash webhook (delayed step callback) | website/src/app/api/webhooks/qstash/route.ts
inbound SMS (conversations, keywords, subscribers) | website/src/lib/sms/
twilio client | website/src/lib/messaging/twilio.ts
resend client | website/src/lib/messaging/resend.ts
oracle system prompt | website/src/lib/oracle-prompt.ts
geolocation, bearing, distance | website/src/lib/geo.ts
rate limiting | website/src/lib/rate-limit.ts
track resolution | website/src/lib/track.ts
admin auth, session verify | website/src/lib/admin/auth.ts
admin actions, player state | website/src/lib/admin/actions.ts
admin activity logging | website/src/lib/admin/log.ts
admin fetch utilities | website/src/lib/admin/fetch.ts
admin track management | website/src/lib/admin/track.ts
react hooks (geo, orientation, share, reveal) | website/src/lib/hooks/
shared UI primitives | website/src/components/ui/
game components (quests, puzzles) | website/src/components/game/
quest type registry | website/src/components/game/quest/registry.ts
admin components (dashboard) | website/src/components/admin/
component gallery, showcase | website/src/components/admin/gallery/
API routes | website/src/app/api/
game pages (pursuit, oracle, journey) | website/src/app/(game)/
public moment share page | website/src/app/moment/[token]/page.tsx
public join/compliance pages | website/src/app/join/, website/src/app/contact/, website/src/app/privacy/, website/src/app/terms/
admin pages | website/src/app/the-order/
device management, enrollment, QR | website/src/app/the-order/(protected)/devices/
testing page, email preview | website/src/app/the-order/(protected)/testing/
enrollment handler | website/src/app/e/[token]/route.ts
OG image generation | website/src/app/api/og/[token]/route.tsx
delayed message delivery | website/src/lib/messaging/qstash.ts, website/src/app/api/webhooks/qstash/route.ts
DB migrations | supabase/migrations/
seed data | supabase/seed.sql
env vars | website/.env.example
security headers | website/next.config.ts
story bible (canon) | docs/Story/Foundation_Bible.md
story spine | docs/Story/Story_Spine.md
chapter map (current slot status) | docs/Story/Chapter_Map.md
chapter template (repeatable structure) | docs/Story/Chapter_Template.md
location/person card template | docs/Story/Location_Person_Card_Template.md
build schedule | docs/Build_Schedule.md
tone & creative north star | docs/UI/Tone_North_Star.md
visual language decisions | docs/UI/Visual_Language_Decisions.md
archived chapter design docs | docs/Story/archive/chapters/
```
