# The Order of the Gilt Frame — Website Build Prompt

**Project:** giltframe.org
**Stack:** Next.js (App Router) + Supabase + Vercel, tailwind, shadcn. Use latest release versions of each
**Convention:** `./src` directory structure

---

## Reference Documents

### Design & Lore

- `./website/docs/MOBILE_DESIGN.md` — Mobile-first design spec (3-tab nav, sharing, replay)
- `./website/docs/Order_of_the_Gilt_Frame_Website_Design.docx` — Full website design spec
- `./chapters/Order_of_the_Gilt_Frame_Game_Design.docx` — Master game design with chapter index
- `./Order_of_the_Gilt_Frame_Lore_Bible.docx` — Oracle AI knowledge base (the Order's voice)
- `./Order_of_the_Gilt_Frame_Content_Playbook.docx` — Voice, tone, content strategy

### Lockdown Documents (Source of Truth for Finalized Chapters)

- `./chapters/prologue/Prologue_Lockdown.docx` — Exact copy, mechanics, auth flow, asset manifest
- `./chapters/chapter-1-compass-and-sundial/Chapter_1_Lockdown.docx` — Full 8-state quest flow, coordinates, compass puzzle, all player-facing copy
- `./chapters/chapter-1-compass-and-sundial/SMS_PLAN.md` — Single MMS trigger for Ch1

### Proof of Concept Prototypes (Implementation Reference)

- `./poc/ch1-full-prototype.html` — **Complete Chapter 1 flow** — all 8 states (wayfinding → geofence → questions → Sparrow moment → compass puzzle → solve animation → reward → waiting). This is the definitive reference for how location-based quests work.
- `./poc/compass-puzzle-prototype.html` — Compass puzzle with constant compass elements, variable Marker intensity, integrated puzzle-solve animation
- `./poc/puzzle-solve-prototype.html` — Reusable puzzle-solve celebration: particles → orb → frame trace → hourglass → "Press to Unlock"
- `./poc/landing-page-prototype.html` — Landing page with animated V3 Marker and passphrase gate (Prologue)

### Communications Config

- `./website/src/config/chapters.jsonc` — All SMS messages, emails, companion messages, progress keys, and quest definitions (by chapter)

### Assets

- `./assets/marker-v3-gold.svg` / `.png` (32, 64, 128, 256, 512px) — The Marker (gold, primary game use)
- `./assets/marker-v3-dark.svg` / `.png` (128, 256, 512px) — The Marker (dark variant)
- `./assets/marker-v3-white.svg` / `.png` (256, 512px) — The Marker (white variant)
- `./assets/prologue-sms-marker.png` — MMS Marker image (used in all chapter SMS triggers)
- `./assets/prologue-letter-v2.pdf` — Physical letter PDF (for reference only)
- `./assets/favicon.svg` / `.ico` / `.png` (16, 32, 48px) — Favicons
- `./assets/apple-touch-icon.svg` / `.png` — iOS home screen icon
- `./assets/og-default.png` — Default Open Graph image

---

## Supabase Local Development — Port Configuration

This project runs alongside existing local Supabase instances. To avoid port collisions, use a **+20 offset** from the defaults in `supabase/config.toml`:

```toml
[api]
port = 54341

[db]
port = 54342

[studio]
port = 54343

[inbucket]
port = 54344
smtp_port = 54345
pop3_port = 54346
```

**Before starting**, run `lsof -i :54341-54346` to confirm these ports are free. If any are in use, increment to the next block (+30: 54351–54356).

The `project_id` in `config.toml` must be unique across all local projects. Use: `gilt-frame`

---

## Phase 1: Project Setup & Skeleton

**Goal:** A running Next.js app with Supabase connected, deployed to Vercel, with the basic route structure and auth gate in place. No game logic yet — just the scaffolding.

### 1.1 Initialize Next.js

```bash
cd ./website
npx create-next-app@latest . --app --src-dir --tailwind --eslint --typescript --no-import-alias
```

**Preferences:**

- App Router (not Pages)
- `./src` directory (`src/app/`, `src/components/`, `src/lib/`, etc.)
- Tailwind CSS for styling
- TypeScript (JavaScript files are fine for quick prototyping, but types preferred)
- No `import-alias` — use relative paths or configure `@/` manually

### 1.2 Initialize Supabase

```bash
cd ./website
npx supabase init
```

Then edit `supabase/config.toml`:

- Set `project_id = "gilt-frame"`
- Apply the port offsets from the table above
- Set unique JWT secrets:
  ```bash
  openssl rand -hex 32  # for anon_key seed
  openssl rand -hex 32  # for service_role_key seed
  ```

Start local Supabase:

```bash
npx supabase start
```

Verify all services are running:

```bash
npx supabase status
```

### 1.3 Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 1.4 Project Structure

```
website/
├── supabase/
│   ├── config.toml          ← Port config, project_id
│   ├── migrations/          ← SQL migrations (Phase 2+)
│   └── seed.sql             ← Seed data (Phase 2+)
├── src/
│   ├── app/
│   │   ├── layout.js             ← Root layout (fonts, metadata, providers)
│   │   ├── page.js               ← Landing page (device check → passphrase or rejection)
│   │   ├── e/
│   │   │   └── [token]/
│   │   │       └── page.js       ← Device enrollment (plants cookie, single-use)
│   │   ├── moment/
│   │   │   └── [token]/
│   │   │       └── page.js       ← Public shared moment (no auth required)
│   │   ├── (game)/               ← Route group: authenticated player
│   │   │   ├── layout.js         ← Auth check + bottom tab bar
│   │   │   ├── current/
│   │   │   │   └── page.js       ← Tab 1: Current (quest/clue/waiting)
│   │   │   ├── journey/
│   │   │   │   ├── page.js       ← Tab 2: The Journey (chronicle)
│   │   │   │   ├── beginning/
│   │   │   │   │   └── page.js   ← Landing animation replay (no passphrase, "Return" btn)
│   │   │   │   └── [momentId]/
│   │   │   │       └── page.js   ← Expanded moment (replay)
│   │   │   └── oracle/
│   │   │       └── page.js       ← Tab 3: The Oracle (AI lore Q&A)
│   │   ├── admin/                ← Admin panel (2-tab + settings, separate visual identity)
│   │   │   ├── layout.js         ← Admin layout (light theme, sans-serif, 404 gate, bottom tabs)
│   │   │   ├── login/
│   │   │   │   └── page.js       ← Hidden login (email + password)
│   │   │   ├── current/
│   │   │   │   └── page.js       ← Tab 1: Mission control + send buttons
│   │   │   ├── progress/
│   │   │   │   └── page.js       ← Tab 2: Chronological event timeline
│   │   │   └── settings/
│   │   │       ├── page.js       ← Settings hub
│   │   │       ├── chapters/
│   │   │       │   └── page.js   ← Chapter & quest CRUD
│   │   │       ├── oracle/
│   │   │       │   └── page.js   ← Review/flag Oracle responses
│   │   │       ├── enroll/
│   │   │       │   └── page.js   ← Generate/revoke device enrollment links
│   │   │       ├── moments/
│   │   │       │   └── page.js   ← Manage shared moments + analytics
│   │   │       └── summons/
│   │   │           └── page.js   ← Orchestrated chapter triggers
│   │   └── api/
│   │       ├── auth/
│   │       │   └── passphrase/
│   │       │       └── route.js
│   │       ├── oracle/
│   │       │   └── route.js      ← Gemini API proxy
│   │       ├── share/
│   │       │   └── route.js      ← Generate share tokens
│   │       └── og/
│   │           └── [token]/
│   │               └── route.js  ← Dynamic OG image for shared moments
│   ├── components/
│   │   ├── ui/                   ← Shared UI (TabBar, Card, Input, etc.)
│   │   └── game/                 ← Game-specific quest state components:
│   │       ├── MarkerSVG.js      ← V3 Marker hourglass (sizes/colors)
│   │       ├── WayfindingCompass.js ← GPS compass + thematic distance
│   │       ├── MarkerButton.js   ← Tappable Marker with pulsing text
│   │       ├── MultipleChoice.js ← Sequential questions, gold lock-in
│   │       ├── NarrativeMoment.js ← Fade-in story text + action
│   │       ├── CompassPuzzle.js  ← Device orientation puzzle
│   │       ├── PuzzleSolve.js    ← Solve celebration animation
│   │       ├── RewardReveal.js   ← Completion text + Continue
│   │       └── WaitingState.js   ← Pulsing Marker + atmospheric text
│   ├── config/
│   │   └── chapters.jsonc       ← All SMS/email content, contacts, companion messages (by chapter)
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.js         ← Browser Supabase client
│   │   │   ├── server.js         ← Server Supabase client
│   │   │   └── middleware.js     ← Auth middleware helper
│   │   └── utils.js
│   └── styles/
│       └── globals.css           ← Tailwind + custom CSS variables
├── public/
│   ├── images/                   ← Order crest, backgrounds, etc.
│   ├── marker/                   ← Marker SVGs and PNGs (copy from ../assets/marker-v3-*)
│   ├── favicon.ico               ← Copy from ../assets/favicon.ico
│   ├── favicon.svg               ← Copy from ../assets/favicon.svg
│   ├── apple-touch-icon.png      ← Copy from ../assets/apple-touch-icon.png
│   └── og-default.png            ← Copy from ../assets/og-default.png
├── docs/                         ← Design docs (this folder)
│   ├── BUILD_PROMPT.md
│   ├── MOBILE_DESIGN.md          ← Mobile-first design spec
│   ├── INDEX.md
│   └── Order_of_the_Gilt_Frame_Website_Design.docx
├── .env.local                    ← Supabase URL + keys (gitignored)
├── .env.example                  ← Template for .env.local
└── package.json
```

### 1.5 Environment Variables

Create `.env.local` from Supabase status output:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54341
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase status>
SUPABASE_SERVICE_ROLE_KEY=<from supabase status>
```

Create `.env.example` (committed to git):

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
RESEND_API_KEY=
GEMINI_API_KEY=
```

### 1.6 Landing Page (Passphrase Gate)

The landing page at `/` is the only public route. Full-screen, no navigation:

- The animated Marker (V3 hourglass SVG — see `poc/landing-page-prototype.html`)
- A single passphrase input at the bottom — no labels, no "login", just an empty field with a faint cursor
- No navigation, no header, no footer

Incorrect passphrase: _"You have not been summoned."_ (fades in, fades out)
Correct passphrase: Transition into the app → bottom tab bar appears → `/current` loads.

**First visit vs. return visits:** The full animated sequence (star ignite → border trace → hourglass reveal → passphrase) plays only on the first visit. Return visits have a persisted session and go straight to `/current`.

**Landing page replay:** The "the beginning" entry at the bottom of The Journey tab opens a full-screen replay of the landing animation. Same animation, but ends with a "Return to The Journey" button instead of the passphrase field. This is a dedicated route: `/journey/beginning`. See `poc/landing-page-prototype.html` for animation reference.

For Phase 1, the passphrase check can be a simple hash comparison against an environment variable. Full Supabase auth comes in Phase 2.

### 1.7 Bottom Tab Bar

The `(game)/layout.js` renders a persistent bottom tab bar with three tabs. See `MOBILE_DESIGN.md` for full specs. For Phase 1, each tab loads a placeholder.

| Tab         | Route      | Icon                | Phase 1 Content                               |
| ----------- | ---------- | ------------------- | --------------------------------------------- |
| Current     | `/current` | The Marker (V3 SVG) | Waiting state with pulsing Marker             |
| The Journey | `/journey` | Open book           | "Your journey has not yet begun."             |
| The Oracle  | `/oracle`  | Sun/eye             | "The Oracle listens. Ask when you are ready." |

### 1.8 Phase 1 Deliverables Checklist

- [ ] Next.js app runs locally at `localhost:3000`
- [ ] Supabase runs locally with custom ports (no collisions)
- [ ] `supabase status` shows all services healthy
- [ ] Landing page renders with passphrase input and animated Marker
- [ ] Incorrect passphrase shows "You have not been summoned."
- [ ] Correct passphrase redirects to `/current`
- [ ] Bottom tab bar with 3 tabs (Current, Journey, Oracle)
- [ ] All game routes show placeholder content
- [ ] Admin routes exist with placeholder pages
- [ ] `/moment/[token]` route exists (placeholder)
- [ ] `.env.local` is gitignored
- [ ] `.env.example` is committed
- [ ] `src/` directory structure matches the spec above
- [ ] Tailwind configured with dark atmospheric theme (golds, deep browns, parchment)
- [ ] Mobile-first: all layouts work at 375px width
- [ ] Marker SVGs and PNGs copied from `../assets/` to `public/marker/`
- [ ] Favicons and apple-touch-icon copied from `../assets/` to `public/`
- [ ] OG default image in place at `public/og-default.png`

---

## Phase 2: Database Schema & Auth

**Goal:** Full Supabase schema, Row Level Security, passphrase-based session auth, and admin auth.

### 2.1 Database Migration

Create the core tables via Supabase migration:

```bash
npx supabase migration new create_core_tables
```

**Tables:**

| Table                  | Key Fields                                                                                                                          | Purpose                                                                                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chapter_progress`     | id, **track** (test/live), chapter_id, step_index (integer), status (locked/active/complete), started_at, completed_at      | Player's position in the unified `steps[]` array. The `step_index` indexes into the chapter's steps in `chapters.jsonc`. One row per track+chapter. |
| `quest_answers`        | id, **track**, chapter_id, step_index, question_index, selected_option, correct, answered_at                                        | Individual answers for MultipleChoice steps. One row per question answered.                                                                               |
| `hint_views`           | id, **track**, chapter_id, step_index, hint_tier, viewed_at                                                                         | Tracks which hints the player has viewed. One row per hint revealed.                                                                                      |
| `moments`              | id, quest_id, chapter_id, narrative_text, moment_type, share_token (unique), assets (JSONB — array of {url, alt, type}), created_at | Journey entries + shareable snapshots                                                                                                                     |
| `oracle_conversations` | id, question, response, gemini_model, tokens_used, flagged, created_at                                                              | Oracle Q&A history                                                                                                                                        |
| `lore_entries`         | id, title, content, unlock_chapter_id, order, created_at                                                                            | Scrolls of Knowledge (curated FAQ)                                                                                                                        |
| `summons`              | id, chapter_id, scheduled_at, sent_at, delivery_method, content                                                                     | Chapter triggers                                                                                                                                          |
| `vault_items`          | id, quest_id, name, description, image_url, collected_at                                                                            | Collectible tokens                                                                                                                                        |
| `marker_sightings`     | id, location, photo_url, confirmed, reported_at                                                                                     | Marker side quest                                                                                                                                         |
| `device_enrollments`   | id, token (unique), device_token (unique), **track** (test/live), user_agent, enrolled_at, last_seen, revoked                       | Enrolled device tracking — track determines game state isolation                                                                                          |

**Moment types:** `quest_complete`, `chapter_start`, `chapter_complete`, `summons_received`

### 2.2 Auth Model

This is NOT a traditional user auth system. There is exactly one player ("Sparrow") and one admin (Bob).

**Two-layer device + passphrase auth:**

1. **Device enrollment (pre-game):** Bob secretly plants an httpOnly `device_token` cookie (90-day expiry) on Christine's 3 Apple devices (iPhone, iPad, MacBook Air) before the game starts. Without this cookie, visitors see the landing animation then "You are not the one." — no passphrase field ever appears. See `MOBILE_DESIGN.md` for full enrollment flow.

2. **Passphrase auth (first visit per device):** On enrolled devices, the passphrase field appears after the landing animation. Correct entry creates a `session` cookie (httpOnly, 30-day). Passphrase is stored as a bcrypt hash in an environment variable or `config` table.

3. **Return visits:** The 30-day session cookie bypasses the landing page entirely → straight to `/current`. Game state is server-side (Supabase), so progress syncs across all her devices.

**Admin enrollment route:** `giltframe.org/admin/settings/enroll` — generates single-use enrollment URLs. Each URL is created with a **track assignment** (`test` or `live`). Bob enrolls his own phone(s) as `test` and Christine's devices as `live`. The track is baked into the device_token cookie. Max 5 devices per track. Admin can view/revoke enrolled devices.

- **Admin auth:** Supabase email/password auth for Bob only. Protected by RLS.

### 2.3 Row Level Security

- Player can read their own progress, chapters (where status != 'locked'), vault items, and messages
- Player can insert messages (sender = 'player') and quest attempts
- Admin (service_role) has full access
- All tables have RLS enabled by default

### 2.4 Seed Data

Create `supabase/seed.sql` with:

- Prologue and Chapter 1 data (status: 'active')
- Chapters 2–8 (status: 'locked')
- Prologue quest with clue text and solution hash
- Initial vault items (locked)

### 2.5 Phase 2 Deliverables Checklist

- [ ] All tables created via migration
- [ ] RLS policies in place
- [ ] Device enrollment route (`/e/[token]`) plants httpOnly cookie (90-day) **with track encoded** (test or live)
- [ ] Admin enrollment page generates/revokes single-use enrollment URLs **with track selection**
- [ ] Landing page checks for device_token — no token = "You are not the one." (no passphrase field)
- [ ] Passphrase auth creates 30-day session cookie (enrolled devices only)
- [ ] Admin login works with email/password
- [ ] Seed data loads with `supabase db reset`
- [ ] Player can only see unlocked chapters
- [ ] API routes use server-side Supabase client with proper auth checks

---

## Universal Chapter Steps (The Ritual)

**Every chapter follows the same 9-step ritual.** This is the core architectural principle of the website. By making the step sequence identical across chapters, we build one set of reusable components that load different content per chapter. The Prologue is Chapter 0.

### The 9 Steps

| Step                    | Channel            | Component                                             | What Happens                                                                                                                                                   |
| ----------------------- | ------------------ | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. **The Letter**       | Physical mail      | _(offline)_                                           | Sealed letter from the Order. Sets the tone, hints at the chapter's theme. Arrives days before the trial.                                                      |
| 2. **The Briefing**     | Email              | _(offline)_                                           | Detailed instructions, lore context, backstory. The "assignment." Sent by Bob from admin panel.                                                                |
| 3. **The Summons**      | SMS/MMS            | _(offline)_                                           | Short, commanding. May include coordinates or a location hint. "Prepare yourself." The Marker image is always attached.                                        |
| 4. **The Arrival**      | SMS/MMS            | _(offline)_                                           | Location-specific trigger. "You have arrived." Contains the giltframe.org link. This is when the player opens the website.                                     |
| 5. **The Wayfinding**   | Website `/current` | `WayfindingCompass`                                   | Compass, map, or directional guidance to get her to the exact spot within the location. GPS + device compass for outdoor. Gallery/floor directions for indoor. |
| 6. **The Confirmation** | Website `/current` | `MultipleChoice`                                      | Multiple-choice questions proving she's physically present. Answers require in-person observation.                                                             |
| 7. **The Puzzle**       | Website `/current` | `CompassPuzzle` / `MultipleChoice` / chapter-specific | The chapter's unique challenge. Compass bearing, painting identification, etc.                                                                                 |
| 8. **The Seal**         | Website `/current` | `PuzzleSolve` → `RewardReveal`                        | Puzzle-solve celebration animation → "Press to Unlock" → reward text → vault fragment. Continue button.                                                        |
| 9. **The Wait**         | Website `/current` | `WaitingState`                                        | "You will be contacted when the time is right." Pulsing Marker. Chapter complete.                                                                              |

### Key Architectural Implications

**Steps 1–4 are offline (admin-triggered).** The website doesn't need to know about them — they're tracked in `message_progress` for the admin panel, but the player-facing `/current` tab doesn't render them. The admin panel's chapter message list (from `chapters.jsonc`) handles sending these.

**Steps 5–9 are the website quest steps.** These are the states that the `/current` tab renders. Every chapter's quest is a state machine that progresses through some subset of these 5 components. The state machine is driven by the `step_states` array in the quest configuration.

**Not every chapter uses every step identically.** Step 5 (wayfinding) might be a full GPS compass outdoors or a simple "find Gallery 273" text indoors. Step 7 (puzzle) might be a compass bearing, a painting identification, or something else entirely. But the step shape is always the same: locate → confirm → solve → unlock → wait.

**The website components are reusable.** Build them once, configure them per chapter:

| Component           | Configured By                                                                     |
| ------------------- | --------------------------------------------------------------------------------- |
| `WayfindingCompass` | `target_lat`, `target_lng`, `geofence_radius` (GPS) or `wayfinding_text` (indoor) |
| `MultipleChoice`    | `questions` JSONB array (question text, options, correct index)                   |
| `CompassPuzzle`     | `compass_target`, `compass_tolerance`                                             |
| `PuzzleSolve`       | Reusable animation, no per-chapter config needed                                  |
| `RewardReveal`      | `reward_text` (primary, highlighted) + `vault_text` (secondary, muted)            |
| `WaitingState`      | Static — same every chapter                                                       |

### How Existing Chapters Map to the Flow

**Prologue (Chapter 0):**

| Step            | Prologue Implementation                                                                |
| --------------- | -------------------------------------------------------------------------------------- |
| 1. Letter       | Physical letter with hidden "SEE TRULY" acrostic + giltframe.org URL                   |
| 2. Briefing     | _(skipped — letter IS the briefing for Prologue)_                                      |
| 3. Summons      | MMS: "The sign has arrived. giltframe.org" with Marker image                           |
| 4. Arrival      | _(combined with step 3 — she's already home)_                                          |
| 5. Wayfinding   | _(skipped — no physical location)_                                                     |
| 6. Confirmation | Passphrase entry (the only text-input puzzle in the game)                              |
| 7. Puzzle       | _(skipped — passphrase IS the puzzle)_                                                 |
| 8. Seal         | Landing animation plays → welcomed as Sparrow → app loads                              |
| 9. Wait         | "Your acceptance has been recorded. The Order will call upon you when the time comes." |

**Chapter 1 — The Compass and the Sundial:**

| Step            | Ch1 Implementation                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 1. Letter       | _(skipped — Ch1 is SMS-only, no letter)_                                                                                  |
| 2. Briefing     | _(skipped — Ch1 is SMS-only, no email)_                                                                                   |
| 3. Summons      | MMS: "The Order has placed a Marker at 42.406256, -85.402025. Your first trial begins now. giltframe.org"                 |
| 4. Arrival      | _(combined with step 3 — single SMS)_                                                                                     |
| 5. Wayfinding   | GPS compass from PIN to sundial (125m walk). Thematic distance text. Geofence at 30m.                                     |
| 6. Confirmation | "Four guardians encircle the dial. What form do they take?" + 2 more questions                                            |
| 7. Puzzle       | Compass bearing puzzle (255°, ±15° tolerance, 1.5s hold). Preceded by Sparrow moment narrative.                           |
| 8. Seal         | Puzzle-solve animation → "Press to Unlock" → "The needle has shown you the way. Take flight, young bird, destiny awaits." |
| 9. Wait         | Pulsing Marker + "You will be contacted when the time is right."                                                          |

**Chapter 2 — The Gallery of Whispers:**

| Step            | Ch2 Implementation                                                                                                               |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 1. Letter       | Pre-trip letter from the Archivist (~4-5 days before Chicago). References "the great Fair" and a patron.                         |
| 2. Briefing     | Email: "The Gallery of Whispers — Your Second Trial." Full lore about Palmer, 1893 Exposition, instructions to find Gallery 273. |
| 3. Summons      | MMS: "The lions are waiting, Sparrow." (day before or morning of museum visit)                                                   |
| 4. Arrival      | MMS: "You are close. Ascend to the second floor. Gallery 273. She is waiting. giltframe.org" (triggered via FindMyPhone)         |
| 5. Wayfinding   | Text-based directions on /current: "Gallery 273. Find the patron who shaped the Order." + progressive hint system (4 tiers)      |
| 6. Confirmation | "What does she hold?" (ivory gavel) + "What adorns her head?" (jeweled tiara)                                                    |
| 7. Puzzle       | _(confirmation IS the puzzle for Ch2 — identifying the painting is the challenge)_                                               |
| 8. Seal         | Puzzle-solve animation → reveal about Palmer's connection to Mary Cassatt and Crystal Bridges                                    |
| 9. Wait         | Pulsing Marker + "You will be contacted when the time is right."                                                                 |

### Data Architecture: Config vs. State

**Content lives in `chapters.jsonc`. State lives in Supabase.** This is the fundamental split:

| What                                                                                  | Where                       | Why                                                                     |
| ------------------------------------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------- |
| **Unified steps** — ALL steps (letter, email, SMS, website components) with typed args | `src/config/chapters.jsonc` | Version-controlled, easy to author, no database needed for content      |
| Component props (questions, coordinates, reward text, hints, narratives)              | `src/config/chapters.jsonc` | Nested inside each website step's `config` object                  |
| Message content (subject, body, companion messages, trigger notes)                    | `src/config/chapters.jsonc` | Nested inside each offline step                                    |
| Flow type schemas and component prop schemas                                          | `src/config/chapters.jsonc` | `step_types` and `component_props` sections — the self-documenting spec |
| Player's current step index (which step they're on)                                   | Supabase `chapter_progress` | Must persist across sessions and devices                                |
| Chapter status (locked/active/complete)                                               | Supabase `chapter_progress` | Admin can unlock chapters dynamically                                   |
| Which answers the player gave                                                         | Supabase `quest_answers`    | Tracking engagement                                                     |
| Which hints the player viewed                                                         | Supabase `hint_views`       | Tracking engagement                                                     |
| Message delivery status (sent/pending/failed)                                         | Supabase `message_progress` | Admin panel tracks delivery                                             |
| Oracle conversations, moments, vault items                                            | Supabase                    | Dynamic, user-generated data                                            |

### The Unified Steps (One State Machine, Two Consumers)

**Each chapter has a single `steps[]` array** that covers ALL steps in chronological order — offline (letter, email, SMS/MMS) AND website (quest components). The `step_index` in Supabase indexes into this array and drives **both** the player app and the admin panel.

**How it works:**

1. **Storage:** `chapter_progress` table stores `{ track, chapter_id, step_index, status }`.
2. **Offline steps:** When the admin sends a message, `step_index` advances to the next step. Admin sees a SEND button.
3. **Website steps:** When the player completes a quest component, `QuestStateMachine` advances `step_index`. Admin sees "Player active on [step name]" read-only.
4. **Player app:** The `/current` tab checks `step_index`. Offline step → atmospheric waiting ("The Order will summon you"). Website step → render the component.
5. **Admin panel:** Renders the FULL step sequence as a sequential list. Steps before index = ✓ sent. Current step = SEND button (offline) or player status (website). Steps after = ○ locked.
6. **Auto-triggers:** Steps with `trigger: "auto:*"` fire automatically when their condition is met.
7. **Chapter lifecycle:** Starts when admin sets `status='active'`. Completes when all steps are done.

**Adding a chapter = editing `chapters.jsonc` + deploying.** No database migration. The JSON IS the chapter authoring format. Supabase is purely a state tracker.

### Step Types

Each step entry has a `type` field that determines its shape. See `chapters.jsonc → step_types` for the full schema with (R)equired and (O)ptional field annotations.

| Type      | Channel        | Admin Action              | Fields                                         |
| --------- | -------------- | ------------------------- | ---------------------------------------------- |
| `letter`  | Physical mail  | Mark as mailed            | `body`, `signature`(O), `content_notes`(O)     |
| `email`   | Resend         | Send via Resend           | `subject`, `body` (line array), `signature`(O) |
| `sms`     | Twilio SMS     | Send via Twilio           | `body`                                         |
| `mms`     | Twilio MMS     | Send via Twilio MMS       | `body`, `image`(O)                             |
| `website` | `/current` tab | Read-only (player active) | `component`, `advance`, `config`               |

**Common offline fields:** `id`(R), `to`(R), `trigger`(R), `progress_key`(R), `trigger_note`(O), `companion_message`(O), `side_effect`(O)

### Unified Steps Config Example (Chapter 1)

```jsonc
"steps": [
  // Offline: The Summons (steps 3+4 combined — SMS-only chapter)
  {
    "id": "ch1_initiation",
    "type": "mms",
    "name": "The Summons",
    "to": "sparrow",
    "trigger": "manual",
    "body": "The Order has placed a Marker at 42.406256, -85.402025. Your first trial begins now. giltframe.org",
    "image": "assets/prologue-sms-marker.png",
    "side_effect": "activate_quest",
    "progress_key": "ch1.initiation_sent"
  },

  // Website: Quest components (steps 5–9)
  { "type": "website", "component": "WayfindingCompass", "advance": "geofence",
    "config": { "target_lat": 42.405278, "target_lng": -85.402778, "geofence_radius": 30 } },
  { "type": "website", "component": "MarkerButton", "advance": "tap",
    "config": { "marker_text": "The timekeeper stands before me" } },
  { "type": "website", "component": "MultipleChoice", "advance": "correct_answers",
    "config": { "questions": [{ "question": "...", "options": [...], "correct": 2 }] } },
  { "type": "website", "component": "NarrativeMoment", "advance": "tap",
    "config": { "lines": ["Line 1.", "Line 2."], "instruction": "...", "action_label": "Begin" } },
  { "type": "website", "component": "CompassPuzzle", "advance": "compass_alignment",
    "config": { "compass_target": 255 } },
  { "type": "website", "component": "PuzzleSolve", "advance": "animation_complete", "config": {} },
  { "type": "website", "component": "RewardReveal", "advance": "tap",
    "config": { "primary": "Reward text.", "secondary": "Vault fragment." } },
  { "type": "website", "component": "WaitingState", "advance": "admin_trigger", "config": {} },

  // Offline: Post-solve
  { "id": "ch1_post_solve", "type": "mms", "trigger": "auto:quest_complete",
    "body": "The Order sees clearly.", "progress_key": "ch1.post_solve_sent" }
]
```

**The engine maps step index to component automatically.** When `step_index` points to a website step, `QuestStateMachine` renders the component named in `step.component` and passes `step.config` as props. No switch statements, no chapter IDs in component code.

---

## Location-Based Quest Mechanics (Technical Reference)

The reusable components above need these underlying APIs for outdoor chapters. Indoor chapters skip GPS/compass and use text-based wayfinding instead.

**Reference implementation:** `poc/ch1-full-prototype.html` contains the complete working flow.

### GPS Wayfinding (Geolocation API)

```javascript
navigator.geolocation.watchPosition(onPosition, onError, {
  enableHighAccuracy: true,
  maximumAge: 2000,
  timeout: 10000,
});
```

**Haversine distance:**

```javascript
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
```

**Bearing to target:**

```javascript
function bearing(lat1, lng1, lat2, lng2) {
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}
```

**Thematic distance (no modern units):** "The Marker calls from afar" (>500m) → "The path draws nearer" (200-500m) → "You approach the threshold" (50-200m) → "Almost upon it" (<50m)

### Device Compass (DeviceOrientationEvent)

```javascript
// iOS requires permission from user gesture
if (typeof DeviceOrientationEvent.requestPermission === "function") {
  const permission = await DeviceOrientationEvent.requestPermission();
  if (permission !== "granted") return;
}
window.addEventListener("deviceorientation", (e) => {
  const heading = e.webkitCompassHeading ?? (360 - e.alpha) % 360;
  updateCompassNeedle(heading);
});
```

**Two UI layers:** constant (compass rose, needle) + variable (Marker intensity pulses with proximity).

### Geofencing

Silent arrival detection. State advances automatically when player enters radius — no button press.

```javascript
const GEOFENCE_RADIUS = 30; // meters
function checkGeofence(pLat, pLng, tLat, tLng) {
  return haversine(pLat, pLng, tLat, tLng) <= GEOFENCE_RADIUS;
}
```

### Compass Puzzle

Point device at target bearing. Solve conditions: heading within ±tolerance, minimum 90° rotation since start, held steady 1.5s. On solve: triggers `PuzzleSolve` animation.

---

## Phase 3: Player-Facing Features (3-Tab Architecture)

**Goal:** Build the three tab experiences — Current, The Journey, The Oracle — plus sharing.

See `MOBILE_DESIGN.md` for full UX specs, wireframes, and design notes.

### 3.1 Tab 1: Current (`/current`) — The Quest Engine

**The Current tab is a config-driven state machine.** It reads the active quest's `step_states` array from Supabase and renders the matching component for the current state. No chapter-specific code. Adding a new chapter means adding a quest row with the right config — the engine handles everything else.

#### 3.1.0 QuestStateMachine (The Engine)

The top-level component at `src/components/game/QuestStateMachine.js`. This is the heart of the game:

```
QuestStateMachine              ← reads unified steps[], filters website steps, manages current index
  └─ StateFader                ← 300ms cross-fade between all state transitions
      ├─ WayfindingCompass     ← Step 5: GPS outdoor OR text indoor
      │   └─ HintSystem        ← progressive hints (indoor wayfinding)
      ├─ MarkerButton          ← Step 5b: "arrived" confirmation tap
      ├─ MultipleChoice        ← Steps 6 & 7: sequential questions
      │   └─ HintSystem        ← "Request a Hint"
      ├─ NarrativeMoment       ← Between steps: story beats, Sparrow moments
      │   └─ TextReveal        ← line-by-line staggered fade
      ├─ CompassPuzzle         ← Step 7 variant: device orientation
      ├─ PuzzleSolve           ← Step 8a: celebration animation
      │   └─ MarkerButton      ← "Press to Unlock"
      ├─ RewardReveal          ← Step 8b: highlighted text + vault fragment
      │   └─ TextReveal        ← line-by-line staggered fade
      └─ WaitingState          ← Step 9: between chapters / offline step fallback
```

**How it works (unified steps):**

1. On mount, `QuestStateMachine` imports the chapter config from `chapters.jsonc` and finds the active chapter's `steps[]` array.
2. It fetches `step_index` from Supabase `chapter_progress` (the only DB call needed).
3. It looks up the step at `steps[step_index]`:
   - If `step.type === "website"` → render the component named in `step.component`, passing `step.config` as props.
   - If `step.type` is an offline type (letter/email/sms/mms) → render `WaitingState` with atmospheric "The Order will summon you" message. The player doesn't know about offline steps.
4. Each website component receives its `config` object as props. Props marked (R) in `component_props` are required; props marked (O) are optional and the component handles null gracefully (hide that feature, don't crash).
5. When a component's advance condition is met (geofence, correct answer, button tap, compass alignment, animation complete), it calls `onAdvance()` → increments `step_index` → persists to Supabase → `StateFader` cross-fades to the next component.
6. If the next step is also a website step, it renders immediately. If it's an offline step, it renders WaitingState until the admin advances the index by sending that message.
7. The quest is complete when `step_index` reaches the last website step (WaitingState).

**No chapter-specific logic lives in QuestStateMachine or any component.** The step sequence is entirely determined by the JSON config. This means:

- New chapters = add a steps array to `chapters.jsonc` + deploy
- Reordering steps = change the `steps[]` array order
- Skipping a step (e.g., no compass puzzle for Ch2) = omit it from `steps[]`
- Adding a narrative beat = insert a `{ type: "website", component: "NarrativeMoment" }` entry
- Adding offline messages = insert letter/email/sms/mms entries between website steps
- No database migrations for new content, ever

**Component reusability rules:**

- Every component must handle null/missing optional props gracefully — hide the feature, don't crash.
- Required props (R) cause the component not to render if missing (show error in dev, graceful fallback in prod).
- Optional props (O) have sensible defaults: `compass_tolerance` defaults to 15°, `hold_seconds` defaults to 1.5s, `geofence_radius` defaults to 30m, `action_label` null means auto-advance, etc.
- See `chapters.jsonc → component_props` for the full schema with (R)/(O) annotations per component.

**Shared sub-components:**

- `StateFader` — wraps every state in a fade transition (300ms). No state changes without a fade.
- `TextReveal` — staggered line-by-line fade animation. Used by `NarrativeMoment` and `RewardReveal`.
- `HintSystem` — "Request a Hint" button + progressive reveal. Used by `MultipleChoice` and `WayfindingCompass` (indoor mode). Only renders if `hints` prop is non-null.
- `MarkerSVG` — the V3 Marker hourglass. Used everywhere. Props: `size`, `variant` (gold/dark/white).

Each quest defines its `step_states` array, and the engine renders the matching component for the current state. The state advances when conditions are met (geofence trigger, correct answer, compass alignment, button tap, etc.).

The components map directly to the Universal Flow steps:

| Step       | Component                                             | Configured By                                                 | Advance Condition                                         |
| --------------- | ----------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------- |
| 5. Wayfinding   | `WayfindingCompass`                                   | GPS coords + geofence radius, OR `wayfinding_text` for indoor | Geofence trigger (outdoor) or "I'm here" tap (indoor)     |
| 6. Confirmation | `MultipleChoice`                                      | `questions` JSONB array                                       | All questions answered correctly                          |
| 7. Puzzle       | `CompassPuzzle` / `MultipleChoice` / chapter-specific | Per quest config                                              | Puzzle-specific solve condition                           |
| _narrative_     | `NarrativeMoment`                                     | `narrative` JSONB                                             | Button tap (can appear between any steps)                 |
| 8. Seal         | `PuzzleSolve` → `RewardReveal`                        | `reward_text` JSONB                                           | Animation complete → tap "Press to Unlock" → tap Continue |
| 9. Wait         | `WaitingState`                                        | Static                                                        | Admin triggers next chapter                               |

**Additional states** that can appear at any time:

| State                  | Display                                                                                               |
| ---------------------- | ----------------------------------------------------------------------------------------------------- |
| **Clue/Hint Received** | A new message from the Order, styled as a letter. Overlays the current state.                         |
| **New Summons**        | Chapter unlock with dramatic animation (seal breaking). Resets to step 5 of the new chapter. |

**Answers are primarily multiple choice.** The only text-entry puzzle is the landing page passphrase. All in-game quests present 2–5 selectable options with a submit button.

**Hints are manual only.** No auto-unlock timers. The player must tap a "Request a Hint" button. Hints may also be pushed by the admin at any time.

Each quest has sequential question unlocking, gold lock-in on correct answers, and vault fragment rewards.

### 3.1.1 Component Library

Build these as reusable components in `src/components/game/`. Each component receives its `config` object from the step in `chapters.jsonc`. No chapter-specific logic should live inside the components — they are pure, data-driven renderers. **(R) = required prop, (O) = optional/nullable. Components must handle null optional props gracefully — hide that feature, don't crash.**

| Component           | Required Props                                                      | Optional Props                                                                                      | Reference                             |
| ------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `WayfindingCompass` | `target_lat` + `target_lng` (outdoor) OR `wayfinding_text` (indoor) | `geofence_radius`(O, default 30), `hints`(O, array of {tier, hint})                                 | `poc/ch1-full-prototype.html`         |
| `MarkerButton`      | `marker_text`                                                       | —                                                                                                   | Tappable Marker SVG with pulsing text |
| `MultipleChoice`    | `questions[]` (question, options, correct)                          | `hints`(O, shared hint pool)                                                                        | Sequential, gold lock-in              |
| `NarrativeMoment`   | `lines[]`                                                           | `instruction`(O), `action_label`(O, null=auto-advance after 3s)                                     | Fade-in text with action button       |
| `CompassPuzzle`     | `compass_target` (degrees)                                          | `compass_tolerance`(O, default 15°), `min_rotation`(O, default 90°), `hold_seconds`(O, default 1.5) | `poc/compass-puzzle-prototype.html`   |
| `PuzzleSolve`       | — (config can be `{}`)                                              | —                                                                                                   | `poc/puzzle-solve-prototype.html`     |
| `RewardReveal`      | `primary` (highlighted text)                                        | `secondary`(O, muted vault text)                                                                    | Highlighted + Continue                |
| `WaitingState`      | — (config can be `{}`)                                              | `message`(O, custom text), `show_vault_teaser`(O, boolean)                                          | Pulsing Marker + atmospheric text     |
| `MarkerSVG`         | —                                                                   | `size`(O), `variant`(O, gold/dark/white)                                                            | V3 Marker hourglass                   |

**Full prop schemas with descriptions are documented in `chapters.jsonc → component_props`.** That is the canonical reference. The table above is a quick summary.

**Browser permissions:** Geolocation and DeviceOrientation both require user permission. The `WayfindingCompass` component should request these on first interaction (e.g., a "Begin" button) since iOS requires permission requests to originate from a user gesture.

### 3.2 Tab 2: The Journey (`/journey`)

A vertical scroll of "moments" — the chronicle told as a story, most recent first.

Each moment entry shows:

- Title and date
- Narrative paragraph (in-story, Order voice)
- Vault item thumbnail (if earned)
- Share button

**Replay:** Tapping a moment expands to show the full quest — the clue, the player's answer, the vault reward. Route: `/journey/[momentId]`

**Assets are accessible.** Any images or media tied to a moment (vault item artwork, map fragments, location photos) display within the expanded view. Tappable for full-screen viewing, long-press to save. Assets are included in shared moment views.

Moments are auto-generated when quests complete, chapters begin/end, or summons arrive. Stored in the `moments` table.

### 3.3 Tab 3: The Oracle (`/oracle`)

AI-powered lore access with two sections:

**Scrolls of Knowledge** — Curated FAQ entries that unlock as chapters complete. Hand-written by Bob, stored in `lore_entries` table.

**Ask the Oracle** — Free-form text input. System sends question + Lore Bible to Gemini API, responds in the Order's voice (the Oracle is the Order in conversational mode, not a separate character). Conversation history persists in `oracle_conversations` table.

**Sliding delay mechanism** (rate limit mitigation):

- Questions 1–5 per day: Near-instant (5–15 seconds)
- Questions 6–10 per day: Moderate wait (30–90 seconds) — "The Oracle contemplates…"
- Questions 11+ per day: Long wait (3–10 minutes) — "The Oracle retreats into silence…"

Daily counter resets at midnight. The delay counter is stored in `oracle_conversations` (count per day). This protects against Gemini API rate limits while adding atmosphere.

Bob can review/flag Oracle responses from admin panel.

### 3.4 Sharing (`/moment/[token]`)

Each Journey moment has a share button that generates a unique public URL. The shared moment page:

- No auth required
- Server-rendered (SSR) for social media previews
- Dynamic OG image via `/api/og/[token]`
- Styled identically to in-app moment view
- Footer: _"This is one moment from a larger journey."_
- No links to the main app

### 3.5 Phase 3 Deliverables Checklist

- [ ] Current tab renders as state machine — correct component for each quest state
- [ ] **WayfindingCompass** component: GPS tracking, Haversine distance, bearing needle, thematic distance text, Marker intensity varying with proximity
- [ ] **Geolocation permission** request triggered by user gesture (iOS requirement)
- [ ] **DeviceOrientation permission** request triggered by user gesture (iOS requirement)
- [ ] **Geofence detection**: silent state advance when player enters radius
- [ ] **CompassPuzzle** component: target bearing, ±tolerance, min rotation, hold-to-solve timer
- [ ] **PuzzleSolve** animation: particles → orb → frame trace → hourglass → unlock (reusable)
- [ ] **MarkerButton** component: tappable Marker SVG with pulsing text below
- [ ] **RewardReveal** component: highlighted primary text + muted secondary text + Continue
- [ ] Current tab renders active quest with multiple choice answers
- [ ] Sequential question unlocking works
- [ ] "Request a Hint" button reveals next hint (no auto-unlock)
- [ ] Waiting state shows with pulsing Marker animation + "You will be contacted when the time is right."
- [ ] Journey tab shows moment cards with narrative text
- [ ] Moment expansion (replay) shows full quest details
- [ ] "The beginning" entry links to `/journey/beginning` (landing animation replay with Return button)
- [ ] Share button generates unique URL and copies to clipboard
- [ ] Shared moment page renders without auth (SSR)
- [ ] OG meta tags and dynamic image for social sharing
- [ ] Oracle tab shows Scrolls of Knowledge (locked/unlocked)
- [ ] Oracle free-form input sends to Gemini API
- [ ] Sliding delay mechanism (instant → moderate → slow based on daily usage)
- [ ] Oracle responses display in conversation history
- [ ] Vault items appear on moment cards
- [ ] Twilio SMS notifications for new summons

---

## Phase 4: Admin Panel — Game Master Dashboard

**Goal:** Full game master control panel for Bob. Completely separate visual identity from the player-facing game. Centralized communications hub — all SMS, emails, and in-game triggers managed from one place.

See `MOBILE_DESIGN.md` → "Admin Panel — Game Master Dashboard" for full design spec.

### 4.0 Admin Visual Identity

The admin panel uses a **completely different design language** than the game:

- Light theme: `#f8f9fa` background, `#ffffff` cards, system sans-serif font
- Blue accent (`#2563eb`), green for success, red for alerts
- No gold, no serif fonts, no parchment, no game imagery
- Standard SaaS dashboard look (like Vercel or Linear)

### 4.1 Admin Auth

- Supabase email + password auth, Bob's email only
- `/admin` returns 404 for unauthenticated visitors (no login form exposed)
- Login page at `/admin/login` — must know the path
- Rate-limited: 5 failed attempts per 15 minutes
- RLS: only admin role can access admin tables

### 4.2 Navigation: 2 Tabs + Settings + Track Toggle

The admin has the same simplicity as the game — two bottom tabs and a gear icon:

- **Current** (`/admin/current`) — Mission control. Player state + send buttons + hint push + compose.
- **Progress** (`/admin/progress`) — Chronological timeline of all completed and upcoming events.
- **⚙ Settings** (`/admin/settings`) — Chapter CRUD, Oracle review, device enrollment, moments, summons.

**Dual track system:** A `TEST | LIVE` toggle at the top of the Current tab controls which track the admin targets. Test track sends to Bob's devices, live track sends to Christine's. See `MOBILE_DESIGN.md` → "Dual Track System" for full spec.

### 4.3 Tab 1: Current (`/admin/current`)

One scrollable page. Everything Bob needs in the field.

**Player state card** (top): Active chapter, current step name, time since last activity, last action summary.

**Unified step list** (primary UI): Reads `src/config/chapters.jsonc` and shows the active chapter's **entire `steps[]` array** as a sequential list — offline steps AND website steps in one timeline:

```
Chapter 1 — The Compass and the Sundial
Kellogg Manor, Michigan

  ✓  The Summons (MMS)         [sent 8:02 AM]
  ◉  The Wayfinding            [player active — 12 min]
  ○  The Arrival               [locked]
  ○  The Confirmation          [locked]
  ○  The Sparrow Moment        [locked]
  ○  The Compass Puzzle        [locked]
  ○  The Seal                  [locked]
  ○  The Reward                [locked]
  ○  The Wait                  [locked]
  ○  Post-Solve (MMS)          [locked — auto on quest complete]
```

**Button states** (driven by `step_index` in `chapter_progress`):

- `✓ sent/complete` — Delivered (offline) or completed (website). Timestamp. Greyed out.
- `● ready` — Enabled. Blue "SEND" button. Only for offline steps at the current index.
- `◉ active` — Player currently on this website step. Shows component name + elapsed time. Read-only for admin.
- `○ locked` — Disabled. Shows unlock condition (previous step must complete).
- `⏱ scheduled` — Queued. Shows time. Can cancel.

**One-tap send:** Press "SEND" → fires SMS via Twilio. If the message has a `companion_message`, both fire simultaneously. Progress row updates to `sent`.

**Companion indicator:** "+companion" badge on messages that also send to Bob or sister.

**Push hint** (below message list): Button to push a hint. Shows hint count and which Christine has viewed. Override content on the fly.

**Free-form compose** (bottom): Ad-hoc SMS or email for improvised in-character sends. Select channel and voice.

### 4.4 Tab 2: Progress (`/admin/progress`)

Chronological list of every completed and upcoming event.

**Completed events:** Checkmarks with timestamps — SMS sent, emails sent, quest attempts, hint requests, Oracle questions, chapter unlocks, moment shares, page visits.

**Upcoming events:** Pending items with trigger conditions (e.g., "waiting: quest complete", "scheduled: Mar 22 8:00 AM").

Filterable by chapter and channel type.

### 4.5 Settings (`/admin/settings`)

Gear icon in top-right. For everything that isn't day-to-day game operation:

- **Chapters & Quests** (`/admin/settings/chapters`) — CRUD for chapters, puzzles, MC options, hints, narrative text
- **Oracle Review** (`/admin/settings/oracle`) — View all Q&A, flag/edit responses, token usage
- **Device Enrollment** (`/admin/settings/enroll`) — Generate/revoke enrollment URLs, view enrolled devices (max 5)
- **Moments** (`/admin/settings/moments`) — View moments, edit narrative, share analytics
- **Summons** (`/admin/settings/summons`) — Trigger chapter unlocks (orchestrated SMS + email + state change), preview before sending

### 4.10 Communications Config (`src/config/chapters.jsonc`)

All chapter content — messages, quest components, and their configurations — lives in a single JSONC config file. The admin dashboard reads this config to render the unified steps timeline and provide send buttons. Supabase only tracks state (step index, delivery status, answers).

**Config structure (v2.0):**

- `contacts` — Christine ("sparrow"), companions (Bob, sister), Order addresses, test overrides
- `voice` — The Order's singular voice rules
- `channels` — Role, tone, and rules for each channel (mail, email, SMS)
- `step_types` — Schema documentation for each step type with (R)equired/(O)ptional field annotations
- `component_props` — Schema documentation for each website component's props with (R)/(O) annotations
- `chapters[]` — Ordered array. Each chapter has a unified `steps[]` with:
  - Offline steps (letter/email/sms/mms): `id`, `type`, `to`, `trigger`, `body`, `progress_key`, and channel-specific fields
  - Website steps: `type: "website"`, `component`, `advance`, `config` (props for the React component)
- `state_engine` — Documents how `step_index` drives both player app and admin panel
- `tracks` — Test/live dual track system

**Key benefit:** One array defines the entire chapter — both what the admin sends AND what the player interacts with. The admin panel and the quest engine read the same config. Adding a chapter = editing this file + deploying. No database migration needed.

### 4.11 Database Additions (Admin)

```sql
-- Core: Tracks player position in the unified steps[] array, per track + chapter
-- This is the CENTRAL state table — drives both player app and admin panel
create table chapter_progress (
  id uuid primary key default gen_random_uuid(),
  track text not null check (track in ('test', 'live')),
  chapter_id text not null,
  step_index integer default 0,
  status text default 'locked' check (status in ('locked', 'active', 'complete')),
  started_at timestamptz,
  completed_at timestamptz,
  unique(track, chapter_id)
);

-- Tracks delivery status for each offline step (letter/email/sms/mms)
create table message_progress (
  id uuid primary key default gen_random_uuid(),
  track text not null check (track in ('test', 'live')),
  progress_key text not null,
  status text default 'pending' check (status in ('pending', 'scheduled', 'sent', 'delivered', 'failed')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  delivered_at timestamptz,
  companion_status text default 'pending',
  companion_sent_at timestamptz,
  error text,
  created_at timestamptz default now(),
  unique(track, progress_key)
);

-- Tracks individual answers for MultipleChoice steps
create table quest_answers (
  id uuid primary key default gen_random_uuid(),
  track text not null,
  chapter_id text not null,
  step_index integer not null,
  question_index integer not null,
  selected_option integer not null,
  correct boolean not null,
  answered_at timestamptz default now()
);

-- Tracks which hints the player has viewed
create table hint_views (
  id uuid primary key default gen_random_uuid(),
  track text not null,
  chapter_id text not null,
  step_index integer not null,
  hint_tier integer not null,
  viewed_at timestamptz default now()
);

-- Audit trail
create table admin_activity_log (
  id uuid primary key default gen_random_uuid(),
  action_type text not null,
  details jsonb,
  created_at timestamptz default now()
);

-- Unified event stream for timeline (track-scoped)
create table player_events (
  id uuid primary key default gen_random_uuid(),
  track text not null check (track in ('test', 'live')),
  event_type text not null,
  details jsonb,
  created_at timestamptz default now()
);
```

### 4.8 Phase 4 Deliverables Checklist

- [ ] Admin visual identity: light theme, sans-serif, no game imagery
- [ ] Admin auth: email+password, 404 for unauthenticated, rate limiting
- [ ] 2-tab bottom nav (Current + Progress) + gear icon for settings
- [ ] **TEST | LIVE track toggle** on Current tab — controls recipient routing and game state isolation
- [ ] Current tab: player state card, chapter message list with send buttons, hint push, free-form compose
- [ ] One-tap send with companion message support (from chapters.jsonc)
- [ ] **Test mode: both player and companion SMS route to Bob's phone** (via test_overrides in config)
- [ ] **Reset Chapter button** (test track only) — wipes progress keys and quest state for one chapter
- [ ] Progress tab: chronological event timeline, **filterable by track**
- [ ] Settings: Chapter CRUD, Oracle review, device enrollment (**with track selection**), moments, summons
- [ ] SMS delivery via Twilio with companion-send support
- [ ] Email delivery from theorder@giltframe.org via Resend
- [ ] message_progress table tracks delivery state per track (unique on track + progress_key)

---

## Phase 5: Polish, Deployment & Launch

**Goal:** Production-ready deployment on Vercel with production Supabase.

### 5.1 Deployment

- Vercel deployment with custom domain (giltframe.org or similar)
- Production Supabase project
- SSL via Vercel (automatic)
- No visible connection to Bob: no personal domain, no GitHub username in URL, no discoverable analytics

### 5.2 Visual Polish

- Atmospheric dark theme (deep browns, golds, parchment tones)
- Animated onboarding sequence (parchment unrolling, seal breaking)
- Responsive design (primarily phone-based gameplay)
- Elegant typography (Georgia, serif — system font, no loading required)

### 5.3 Security

- Passphrase hash comparison (bcrypt)
- Admin routes return 404 for unauthenticated visitors (no login form exposed)
- Admin auth: Supabase email+password, rate-limited (5 attempts / 15 min)
- Rate limiting on passphrase attempts
- CORS configuration
- Environment variables for all secrets

### 5.4 Testing (Dual Track)

**Test track dry-runs** (Bob's phone):

- Enroll Bob's phone as a test device (`track: 'test'`)
- Dry-run each chapter independently via the admin Current tab (toggle set to TEST)
- Verify both player SMS and companion SMS arrive on Bob's phone (same device, seconds apart)
- Verify email delivery (player + companion emails both to Bob's inbox)
- Verify side effects fire against test track game state only
- Use "Reset Chapter" to re-run chapters as needed
- Confirm test track activity does NOT appear on Christine's live devices

**Live track verification:**

- Walkthrough the full Prologue as the player on a live-enrolled device
- Test manual hint system (verify no auto-unlock timers)
- Test Oracle response flow end-to-end
- Verify admin can intercept and edit Oracle responses
- Test on mobile (primary device)

**Location-based quest testing:**

- Test GPS wayfinding on physical phones (not just desktop)
- Verify DeviceOrientationEvent permission flow on iOS Safari
- Verify geofence triggers at correct distance
- Test compass puzzle solve conditions (rotation minimum, hold time, tolerance)
- Verify puzzle-solve animation renders on iOS + Android
- Test with poor GPS signal (indoor, obstructed sky) — verify graceful degradation
- Desktop simulation (mouse heading, click-to-walk) for development/demo purposes

### 5.5 Phase 5 Deliverables Checklist

- [ ] Production Supabase project created and migrated
- [ ] Vercel deployment with custom domain
- [ ] SSL active
- [ ] No discoverable connection to Bob
- [ ] Full Prologue walkthrough tested
- [ ] Mobile responsive
- [ ] Animated onboarding sequence
- [ ] Rate limiting on passphrase entry

---

## Design Principles (All Phases)

1. **Phone-first.** Christine will play on her phone. All layouts must work at 375px. Design for mobile, enhance for desktop. Touch targets minimum 44x44px. Input fields 48px height / 16px font to prevent iOS zoom.
2. **Three tabs, nothing more.** The bottom tab bar (Current, Journey, Oracle) is the only navigation. No hamburger menus, no sidebars, no top nav. Content flows within the frame. The tab bar never moves.
3. **Authenticity first.** Every pixel should feel like a real centuries-old organization. No game UI. No progress bars. No "Level 2!" celebrations. The Order is dignified.
4. **Atmospheric.** Dark backgrounds (#0a0a0a), gold accents (rgba(200,165,75)), serif typography (Georgia). Think museum archive, not web app.
5. **Shareable moments.** Every completed quest generates a shareable link. Friends see one beautifully rendered moment — a fragment, not the whole picture.
6. **Current is never empty.** The waiting state is atmospheric and intentional — pulsing Marker, ambient presence. The Order is always watching.
7. **Secrets in the code.** View-source Easter eggs, hidden URL paths, and metadata clues are part of the game. Build the site knowing a curious player will inspect everything.
8. **The real world is the game board.** Location-based quests use GPS and the device compass to make physical places part of the story. The phone becomes a magical instrument, not just a screen. Wayfinding should feel like following an ancient compass, not using Google Maps.
9. **POCs are the spec.** The `poc/` prototypes are tested, working implementations. When building quest components, match the behavior and feel of the POCs exactly. They contain hard-won UX decisions.
10. **Chapters are config, not code.** Each chapter's unified `steps[]` array defines ALL steps — offline messages (letter, email, SMS) AND website quest components — in one place. The `QuestStateMachine` renders the right component at each website step. The admin panel reads the same flow to show send buttons for offline steps. Adding a new chapter means adding a new `steps[]` array — not writing new components, page routes, or database migrations. If you're writing chapter-specific `if` statements, you're doing it wrong.
11. **Components are maximally reusable.** Every game component accepts a `config` prop with required (R) and optional (O) fields. Required fields are what makes the component meaningful (e.g., `questions[]` for `MultipleChoice`). Optional fields add features that not every chapter needs (e.g., `hints`, `geofence_radius`, `action_label`). When an optional prop is null, the component hides that feature gracefully — it never crashes. See `chapters.jsonc → component_props` for the canonical prop schemas.
