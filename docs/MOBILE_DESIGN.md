# Mobile-First Design Spec — The Order of the Gilt Frame

**Primary device:** Phone (iPhone / Android)
**Secondary:** Tablet, Desktop (enhanced, not required)
**Philosophy:** The Order guides you. You don't browse.

---

## Navigation: Bottom Tab Bar

Three persistent tabs anchored to the bottom of the screen. No hamburger menus, no sidebars, no top nav. The tab bar is the only navigation the player ever sees.

```
┌─────────────────────────────────┐
│                                 │
│         (content area)          │
│                                 │
│                                 │
├──────────┬──────────┬───────────┤
│  Current │  Journey │   Oracle  │
│    ◈     │    ◈     │     ◈     │
└──────────┴──────────┴───────────┘
```

### Tab 1: Current

**Icon:** The Marker (hourglass symbol — the V3 SVG at tiny scale)
**Purpose:** Always shows whatever is happening right now.

The content rotates depending on game state:

| State | What Shows |
|-------|-----------|
| **Active Question** | The current puzzle — clue text, multiple choice options, submit. One question at a time. Exception: the landing page passphrase is the only text-entry puzzle. |
| **Clue Received** | A new clue or hint that's just arrived. Styled as a message from the Order. |
| **Waiting** | *"The Order will contact you when ready…"* — atmospheric holding state with subtle animation (flickering candle, drifting particles, the Marker slowly pulsing). |
| **Chapter Complete** | Brief congratulatory moment — vault item reveal, then transitions to waiting. |
| **New Summons** | A chapter unlock notification with dramatic presentation (seal breaking, parchment unrolling). |

**Key behavior:** This tab never shows a list. It is always singular — one thing, right now. If there's nothing active, it holds the waiting state. The waiting state is not empty; it's atmospheric and intentional.

### Tab 2: The Journey

**Icon:** Open book or scroll
**Purpose:** The chronicle. Everything that's happened, told as a story.

Structured as a vertical scroll of "moments" — each completed quest, chapter milestone, and significant event rendered as a narrative entry. Think of it as a journal that writes itself.

**Content hierarchy (top to bottom):**
1. **Current chapter title** (header, always visible)
2. **Completed moments** — most recent first, scrolling down to the beginning
3. **The beginning** — the first summons, the passphrase entry

Each moment entry contains:
- A short narrative paragraph (written in-story, Order voice)
- The date/time it happened
- Optional: vault item thumbnail if one was earned
- A share button (see Sharing below)

**Replay:** Tapping a moment expands it to show the full quest experience — the clue, the answer the player gave, the vault reward. This is the replay mechanism: she can revisit any solved puzzle and re-read the full exchange.

**Assets are accessible.** Any images, vault items, or media associated with a moment (e.g., the Giverny sundial sketch, a map fragment, a photo from a location) are viewable within the expanded moment. Assets can be tapped to view full-screen and long-pressed to save. When a moment is shared, its assets are included in the shared view.

### Tab 3: The Oracle

**Icon:** Eye or flame
**Purpose:** AI-powered lore access. The Order answers directly.

**Two modes:**

1. **Ask the Oracle** — Free-form text input. Christine types a question about the lore, the world, the Order, anything. The system sends it to Gemini with the Lore Bible as context and returns a response in the Order's voice. (The Oracle is not a separate character — it's the Order itself in conversational mode.)

   **Sliding delay mechanism** (rate limit mitigation): Responses don't always arrive instantly. The delay increases with usage to manage API rate limits and add atmosphere:
   - Questions 1–5 per day: Near-instant (5–15 seconds)
   - Questions 6–10 per day: Moderate wait (30–90 seconds) — "The Oracle contemplates…"
   - Questions 11+ per day: Long wait (3–10 minutes) — "The Oracle retreats into silence. It will return when it is ready."

   This serves double duty: it prevents API rate limit issues with Gemini, and it makes the Oracle feel like a living entity that tires of too many questions. The counter resets daily.

   Bob can still review and flag Oracle responses from the admin panel.

2. **Scrolls of Knowledge** — A curated FAQ / lore compendium that grows as the player progresses. Each completed chapter unlocks new lore entries. These are static, hand-written by Bob, stored in the database.

   Examples:
   - "Who is the Order of the Gilt Frame?"
   - "What is the Marker?"
   - "Why an hourglass?"
   - "What are the Impressionists hiding?"

**Behavior:** Oracle responses are stored and visible in a conversation history within this tab. Christine can scroll back through past questions.

---

## Sharing & Replay

### The Problem
Christine wants to show friends what she's experiencing. She also wants to revisit moments herself after the game is over (or during long gaps between chapters).

### The Solution: Share Links

Each "moment" in The Journey has a share button that generates a unique URL:

```
giltframe.org/moment/[token]
```

This URL opens a read-only, beautifully rendered view of that specific moment — the narrative text, the quest clue, the answer, the vault item. No passphrase required. No access to anything else.

**What friends see:**
- The moment itself, fully styled
- A teaser line: *"This is one moment from a larger journey. The Order sees all."*
- No navigation to other moments, no way to browse the game

**What friends don't see:**
- Other moments, puzzles, or answers
- The Oracle
- Any navigation or game state
- Any connection to Bob

### Replay Mode

After the game is complete (all chapters finished), Christine unlocks a "Replay" mode on The Journey tab. This lets her:
- Scroll through all moments chronologically
- Expand any moment to see the full puzzle + answer
- Share any moment individually
- View a complete timeline as a single scrollable story

This mode activates automatically when the final chapter is marked complete.

---

## Authentication & Device Gating

### The Problem
Christine should be the only person who can access the game. If she texts the URL to a friend, they should see the landing animation and nothing else. No passphrase field, no way in.

### The Solution: Secret Device Enrollment

Bob pre-installs device tokens on Christine's devices before the game begins. She has three Apple devices: iPhone, iPad, and MacBook Air.

**How it works:**

1. Bob visits `giltframe.org/admin/enroll` from the admin panel. This generates a one-time enrollment URL with a short-lived token (e.g., `giltframe.org/e/x8kQ2n`).
2. Bob opens that URL on Christine's device (while "borrowing her phone" or when she's not looking). The page plants an httpOnly `device_token` cookie (90-day expiry), then redirects to a blank page or simply closes. No visible trace left behind.
3. Repeat for each of her 3 devices. Each enrollment link is single-use.

**What each visitor sees:**

| Visitor | Has device_token? | Has session cookie? | Experience |
|---------|------------------|--------------------|----|
| Christine, first visit | Yes | No | Full animation → passphrase field → enters game |
| Christine, return visit | Yes | Yes (30-day) | Straight to `/current` |
| Christine, expired session | Yes | No | Full animation → passphrase field again |
| Friend with shared URL | No | No | Full animation → "You are not the one." |
| Random person | No | No | Full animation → "You are not the one." |

**Two cookies, two purposes:**
- `device_token` (httpOnly, 90-day, planted by Bob): Proves this is an enrolled device. Without it, no passphrase field ever appears.
- `session` (httpOnly, 30-day, set after correct passphrase): Proves she's authenticated. Allows skipping the passphrase on return visits.

**Cross-device play:** Christine can play on any of her 3 enrolled devices. The session cookie is per-device, so she'll need to enter the passphrase once on each device, but after that, the 30-day session handles return visits. Game state is server-side (Supabase), so progress syncs across devices automatically.

**If a cookie expires:** The device token lasts 90 days. If both cookies expire, Bob can generate a new enrollment link from the admin panel. If only the session expires, she just re-enters the passphrase.

**Admin enrollment page (`/admin/settings/enroll`):**
- Shows a list of currently enrolled devices (last seen, user agent, **track assignment**)
- Button to generate a new single-use enrollment URL — **must select track (test or live)** at generation time
- Button to revoke a device token
- Maximum 5 enrolled devices per track (safety limit)
- Track is baked into the device_token cookie — cannot be changed after enrollment (revoke and re-enroll to switch)

---

## Screen Layouts

### Landing Page (Pre-Auth)

Full-screen, no navigation. The experience differs based on device enrollment:

**Enrolled device (Christine):**
- The full animated Marker sequence (star ignite → border trace → hourglass reveal)
- A single passphrase field at the bottom — no labels, no "login", just an empty field with a faint cursor
- Incorrect passphrase: *"You have not been summoned."* (fades in, fades out)
- Correct passphrase: Transitions into the app → bottom nav appears

**Non-enrolled device (everyone else):**
- The full animated Marker sequence plays identically (same beautiful animation)
- Instead of a passphrase field: *"You are not the one."* fades in after the animation completes
- No input field, no way to proceed, no indication that a passphrase even exists

**First visit vs. return visits:** The full animation + passphrase only plays on the first visit per device. Subsequent visits use the 30-day session cookie and go straight to `/current`, bypassing the landing page entirely.

**Replay from The Journey:** The "the beginning" entry at the bottom of The Journey tab is tappable. It opens a full-screen replay of the original landing page animation — same star, same border trace, same hourglass reveal — but instead of the passphrase text field at the end, it shows a "Return to The Journey" button. This lets Christine relive that first moment anytime. See `poc/landing-page-prototype.html` for the full animation reference.

### Current Tab — Active Question (Multiple Choice)

```
┌─────────────────────────────────┐
│                                 │
│   Chapter II: The Water Lilies  │
│                                 │
│   ─────────────────────────     │
│                                 │
│   "The artist painted the       │
│    same bridge thirty times.    │
│    What did he see that         │
│    changed each time?"          │
│                                 │
│   ┌─────────────────────────┐   │
│   │  ○  The water            │   │
│   │  ○  The light            │   │
│   │  ○  The seasons          │   │
│   │  ○  The bridge itself    │   │
│   └─────────────────────────┘   │
│            [Submit]             │
│                                 │
│        [Request a Hint]         │
│                                 │
├──────────┬──────────┬───────────┤
│● Current │  Journey │   Oracle  │
└──────────┴──────────┴───────────┘
```

**Answers are primarily multiple choice.** The only text-entry puzzle is the landing page passphrase. All in-game quests present 2–5 options.

**Hints are manual.** No auto-unlock timers. The player must tap "Request a Hint" to receive one. Hints may also be pushed by the admin at any time.

### Current Tab — Waiting State

```
┌─────────────────────────────────┐
│                                 │
│                                 │
│                                 │
│          [The Marker]           │
│        (slowly pulsing)         │
│                                 │
│    The Order will contact you   │
│         when ready…             │
│                                 │
│                                 │
│                                 │
│                                 │
│                                 │
├──────────┬──────────┬───────────┤
│● Current │  Journey │   Oracle  │
└──────────┴──────────┴───────────┘
```

### The Journey Tab

```
┌─────────────────────────────────┐
│  THE JOURNEY                    │
│  Chapter II: The Water Lilies   │
│  ───────────────────────────    │
│                                 │
│  ┌───────────────────────────┐  │
│  │ The Bridge at Giverny     │  │
│  │ Feb 14, 2026              │  │
│  │                           │  │
│  │ She saw what Monet saw —  │  │
│  │ that the light was never  │  │
│  │ the same twice...         │  │
│  │              [↗ Share]    │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ The First Summons         │  │
│  │ Feb 1, 2026               │  │
│  │                           │  │
│  │ A letter arrived bearing  │  │
│  │ a seal she had never...   │  │
│  │              [↗ Share]    │  │
│  └───────────────────────────┘  │
│                                 │
├──────────┬──────────┬───────────┤
│  Current │● Journey │   Oracle  │
└──────────┴──────────┴───────────┘
```

### The Oracle Tab

```
┌─────────────────────────────────┐
│  THE ORACLE                     │
│  ───────────────────────────    │
│                                 │
│  ┌───────────────────────────┐  │
│  │ Scrolls of Knowledge      │  │
│  │ ● Who is the Order?       │  │
│  │ ● What is the Marker?     │  │
│  │ ● Why an hourglass?       │  │
│  │ ○ [locked — Ch. 2]        │  │
│  │ ○ [locked — Ch. 3]        │  │
│  └───────────────────────────┘  │
│                                 │
│  Previous Questions             │
│  ─────────────────              │
│  "Why does the Order speak      │
│   in riddles?"                  │
│   → "Consider: does a mirror…"  │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Ask the Oracle…          │    │
│  └─────────────────────────┘    │
│                                 │
├──────────┬──────────┬───────────┤
│  Current │  Journey │ ● Oracle  │
└──────────┴──────────┴───────────┘
```

---

## Route Architecture (Next.js App Router)

```
src/app/
├── layout.js                    ← Root layout, fonts, metadata
├── page.js                      ← Landing page (device check → passphrase or rejection)
├── e/
│   └── [token]/
│       └── page.js              ← Device enrollment (plants cookie, single-use)
├── moment/
│   └── [token]/
│       └── page.js              ← Public shared moment (no auth)
├── (game)/                      ← Route group: authenticated player
│   ├── layout.js                ← Auth check + bottom tab bar
│   ├── current/
│   │   └── page.js              ← Tab 1: Current state
│   ├── journey/
│   │   ├── page.js              ← Tab 2: The Journey (chronicle)
│   │   ├── beginning/
│   │   │   └── page.js          ← Landing animation replay (Return button)
│   │   └── [momentId]/
│   │       └── page.js          ← Expanded moment (replay)
│   └── oracle/
│       └── page.js              ← Tab 3: The Oracle
├── admin/                       ← Admin panel (2-tab + settings, separate visual identity)
│   ├── layout.js                ← Admin layout (light theme, sans-serif, bottom tabs, 404 gate)
│   ├── login/
│   │   └── page.js              ← Hidden login (email + password)
│   ├── current/
│   │   └── page.js              ← Tab 1: Mission control + send buttons
│   ├── progress/
│   │   └── page.js              ← Tab 2: Chronological event timeline
│   └── settings/
│       ├── page.js              ← Settings hub
│       ├── chapters/
│       │   └── page.js          ← Chapter & quest CRUD
│       ├── oracle/
│       │   └── page.js          ← Review/flag Oracle responses
│       ├── enroll/
│       │   └── page.js          ← Generate/revoke device enrollment links
│       ├── moments/
│       │   └── page.js          ← Manage shared moments + analytics
│       └── summons/
│           └── page.js          ← Orchestrated chapter triggers
└── api/
    ├── auth/
    │   └── passphrase/
    │       └── route.js
    ├── oracle/
    │   └── route.js             ← Gemini API proxy
    ├── share/
    │   └── route.js             ← Generate share tokens
    └── og/
        └── [token]/
            └── route.js         ← Dynamic OG image for shared moments
```

---

## Database Additions

New/modified tables for the 3-tab architecture:

| Table | Changes |
|-------|---------|
| `moments` (new) | id, quest_id, chapter_id, narrative_text, moment_type (quest_complete/chapter_start/chapter_complete/summons), share_token (unique), assets (JSONB — array of {url, alt, type}), created_at |
| `oracle_conversations` (new) | id, question, response, gemini_model, tokens_used, flagged, created_at |
| `lore_entries` (new) | id, title, content, unlock_chapter_id, order, created_at |
| `messages` (modified) | Renamed/repurposed — Oracle messaging now lives in oracle_conversations |

The `share_token` on moments is a short, URL-safe string (nanoid, 12 chars) generated when the player first shares that moment.

---

## Visual Design Notes

### Color Palette
- Background: `#0a0a0a` to `#1a1510` (near-black to deep brown)
- Primary text: `rgba(200, 165, 75, 0.7)` (aged gold)
- Secondary text: `rgba(200, 165, 75, 0.45)` (faded gold)
- Borders: `rgba(200, 165, 75, 0.15)` (barely visible gold)
- Active tab: `rgba(200, 165, 75, 0.9)` (bright gold)
- Inactive tab: `rgba(200, 165, 75, 0.35)` (muted)
- Cards: `rgba(30, 25, 18, 0.8)` (dark brown surface)

### Typography
- Body: Georgia, serif (system font — no loading)
- Headers: Georgia, uppercase, letter-spacing: 3-4px
- Oracle responses: Georgia, italic
- Tab labels: 10px, uppercase, letter-spacing: 2px

### Tab Bar Design
- Background: `#0a0a0a` with top border `rgba(200, 165, 75, 0.12)`
- Height: 60px (comfortable thumb targets)
- Icons: 24px SVG, gold tones
- Active indicator: small dot below icon, or brighter opacity
- No bounce, no color shift — subtle opacity change only

### Animations
- Tab transitions: 200ms fade (no slide, no bounce)
- Waiting state Marker: slow pulse (2s cycle, 0.4→0.7 opacity)
- New content arrival: fade in from 0→1 opacity over 400ms
- Share button: brief gold flash on tap

### Touch Targets
- All interactive elements: minimum 44x44px
- Input fields: 48px height, 16px font (prevents iOS zoom)
- Submit buttons: full-width, 52px height
- Tab bar icons: 44px tap area including label

---

## Sharing Implementation Details

### Share Flow
1. Player taps "Share" on a Journey moment
2. System generates a `share_token` (if not already generated) and stores it on the moment
3. **On phone (primary):** Native share sheet opens via Web Share API — she can text it, AirDrop it, WhatsApp it, whatever her phone offers. The share payload includes the moment title, narrative text as preview, and the URL.
4. **On desktop (fallback):** URL is copied to clipboard with a toast confirmation.

```javascript
// Web Share API — works on iOS Safari, Android Chrome
if (navigator.share) {
  navigator.share({
    title: moment.title + ' — The Order of the Gilt Frame',
    text: moment.narrative,
    url: 'https://giltframe.org/moment/' + moment.share_token,
  });
} else {
  // Desktop: copy to clipboard
  navigator.clipboard.writeText(url);
}
```

### Shared Moment Page (`/moment/[token]`)
- No auth required
- Server-rendered (SSR) for social media previews
- Open Graph meta tags with moment title + narrative preview
- Styled identically to the in-app moment view
- Footer: *"This is one moment from a larger journey."*
- No links to the main app, no "sign up" prompts
- The Marker appears faintly in the background

### Social Preview
```html
<meta property="og:title" content="The Bridge at Giverny — The Order of the Gilt Frame" />
<meta property="og:description" content="She saw what Monet saw — that the light was never the same twice." />
<meta property="og:image" content="/api/og/[token]" />
```

The OG image is dynamically generated (Next.js `ImageResponse`) — dark background, gold text, the Marker watermark.

---

## Admin Panel — Game Master Dashboard

### Design Philosophy

The admin panel is a **completely separate visual identity** from the player-facing game. If Christine ever glimpsed Bob's screen, it should look like a generic work tool — no gold, no Georgia, no atmospheric darkness. Think Vercel dashboard, not ancient order.

**Visual language:**
- Background: `#f8f9fa` (light gray) with `#ffffff` cards
- Text: `#1a1a2e` (near-black) — body in system sans-serif (`-apple-system, system-ui, sans-serif`)
- Accent: `#2563eb` (blue) for actions, `#10b981` (green) for success, `#ef4444` (red) for alerts
- No serif fonts, no gold, no parchment textures, no game imagery anywhere
- Clean data tables, status badges, form inputs — standard SaaS dashboard aesthetic

### Authentication

**Method:** Supabase email + password auth (Bob's email only).

**Security measures:**
- `/admin` returns a 404 page to unauthenticated visitors (not a login form — Christine might try this URL)
- Login page lives at `/admin/login` — only accessible if you know the path
- Failed login attempts rate-limited (5 attempts per 15 minutes)
- Session persists via Supabase auth cookie
- RLS ensures only the admin role can access admin data

### Navigation: 2 Tabs + Settings

```
┌─────────────────────────────────┐
│  ⚙              GAME MASTER     │
├─────────────────────────────────┤
│                                 │
│         (content area)          │
│                                 │
├────────────────┬────────────────┤
│    Current     │    Progress    │
└────────────────┴────────────────┘
```

Two bottom tabs plus a gear icon in the top corner. That's it.

### Dual Track System (Test & Live)

The admin supports two parallel progress tracks that run simultaneously:

**Track toggle** — A prominent `TEST | LIVE` pill switch sits at the top of the Current tab, below the header. It controls which track the entire admin view targets.

```
┌─────────────────────────────────┐
│  ⚙              GAME MASTER     │
├─────────────────────────────────┤
│     [ TEST ● |   LIVE  ]       │
│                                 │
│         (content area)          │
│                                 │
├────────────────┬────────────────┤
│    Current     │    Progress    │
└────────────────┴────────────────┘
```

**TEST track:**
- Runs on Bob's phone(s), enrolled with `track: 'test'`
- All SMS messages redirect to Bob's phone number (not Christine's)
- All emails redirect to Bob's email
- Companion messages still fire (both arrive on Bob's same phone — useful for verifying timing)
- Any chapter can be dry-run independently, even while the live game is on a different chapter
- **Reset Chapter** button appears in test mode — wipes all progress keys and quest state for that chapter on the test track. Allows re-running from scratch.
- Side effects (quest activation, etc.) only affect test track game state

**LIVE track:**
- Runs on Christine's 3 enrolled devices (`track: 'live'`)
- SMS and emails go to Christine. Companion messages go to actual companions (Bob, sister).
- **No reset allowed.** Live is append-only and irreversible.
- The toggle has a visual distinction (e.g., LIVE pill is red/bold) to prevent accidental sends on the wrong track.

**How it works technically:** Each enrolled device has a `track` field in `device_enrollments`. The `device_token` cookie encodes the track, so when Bob visits giltframe.org on his test phone, the site serves test-track game state. When Christine visits on her iPhone, she gets live-track state. Same codebase, same URLs, completely isolated progress.

**The Progress tab also filters by track** — showing either test timeline or live timeline, matching the toggle selection.

### Tab 1: Current (`/admin/current`)

One scrollable page — mission control. Everything Bob needs in the field.

**Player state card** (top):
- Active track indicator (TEST or LIVE)
- Active chapter and quest name (for the selected track)
- Time since last activity on this track
- Last action (e.g., "Hint requested — 2 min ago")

**Chapter message list** (middle — the primary UI):

Reads `src/config/chapters.jsonc` and shows the active chapter's messages as a sequential list of send buttons. Each button state is driven by the `message_progress` table.

```
Chapter 1 — The Compass and the Sundial
Kellogg Manor, Michigan

  ✓  Morning Summons           [sent 8:02 AM]
  ●  On the Grounds            [ SEND ]  +companion
  ○  Post-Solve                [locked — requires quest complete]

  ── Email ──
  ✓  Ch1 Briefing              [sent Mar 2]
```

**Button states:**
- `✓ sent` — Delivered. Timestamp shown. Greyed out.
- `● ready` — Enabled. Blue "SEND" button. Next in sequence.
- `○ locked` — Disabled. Shows unlock condition.
- `⏱ scheduled` — Queued for future send. Shows time. Can cancel.

**One-tap send:** Press "SEND" → fires SMS to Christine via Twilio. If the message has a `companion_message` in the config, the companion SMS fires simultaneously. Both phones buzz at the same time. Progress row updates to `sent`.

**Companion indicator:** Messages with companion sends show "+companion" badge. Bob knows which messages will also hit his phone.

**Push hint** (below message list):
- Button to push a hint to the active quest
- Shows how many hints Christine has requested and viewed
- Override hint content on the fly

**Reset chapter** (test track only):
- Appears only when track toggle is set to TEST
- "Reset Chapter" button with confirmation dialog
- Wipes all `message_progress` rows for the current chapter on the test track
- Resets quest state (player_progress, moments) for that chapter on test track
- All send buttons return to their initial state — ready to re-run the chapter from scratch
- Does NOT affect the live track in any way

**Free-form compose** (bottom):
- Ad-hoc SMS or email for improvised in-character sends not in the config
- Select channel (SMS / email) — sent from `theorder@giltframe.org` for email, Order SMS number for texts
- Optional signature line for emails (e.g., "— The Registrar" or "— The Archivist") as institutional formality

### Tab 2: Progress (`/admin/progress`)

A single chronological list of every completed and upcoming event. The full story of the game told as a timeline.

**Completed events** show with checkmarks and timestamps:
- `✓ Mar 1 8:00 AM` — Prologue letter mailed
- `✓ Mar 1 2:15 PM` — Passphrase entered (correct)
- `✓ Mar 2 9:00 AM` — Ch1 email briefing sent
- `✓ Mar 3 8:02 AM` — Ch1 morning summons SMS sent
- `✓ Mar 3 11:30 AM` — Ch1 on-grounds SMS sent (+companion)

**Upcoming events** show as pending with trigger conditions:
- `○ Ch1 post-solve` — Waiting: quest complete
- `○ Ch2 pre-trip letter` — Manual: mail before Chicago trip
- `⏱ Ch2 tickler SMS` — Scheduled: Mar 22, 8:00 AM

**Event types in the stream:** SMS sent, emails sent, companion messages, quest attempts (correct/wrong), hint requests, Oracle questions, chapter unlocks, moment shares, page visits.

Filterable by chapter and channel type.

### Settings (⚙ gear icon, top-right)

A settings page for everything that isn't day-to-day game operation:

- **Chapters & Quests** — CRUD for chapters, puzzles, multiple choice options, hints, narrative text
- **Oracle Review** — View all Oracle Q&A, flag/edit responses, token usage stats
- **Device Enrollment** — Generate/revoke single-use enrollment URLs, view enrolled devices
- **Moments** — View generated moments, edit narrative text, share analytics
- **Summons** — Trigger chapter unlocks (coordinates SMS + email + in-game state change). Preview before sending.
- **Account** — Admin email/password, session management

### Admin Routes

```
/admin/login          ← Auth gate (hidden — 404 for unauthenticated users)
/admin/current        ← Tab 1: Mission control + send buttons
/admin/progress       ← Tab 2: Chronological event timeline
/admin/settings       ← Gear icon: chapter CRUD, Oracle, enrollment, moments
/admin/settings/chapters
/admin/settings/oracle
/admin/settings/enroll
/admin/settings/moments
/admin/settings/summons
```

### Communications Config (`src/config/chapters.jsonc`)

All SMS messages, email content, phone numbers, companion messages, and channel rules live in a single JSONC config file ordered by chapter. The admin dashboard reads this config to display what can be sent. The database only tracks delivery state via a `message_progress` table — no message content is stored in the DB.

Each message has a `progress_key` (e.g., `ch1.on_grounds_sent`) that maps to a row in `message_progress`, a `trigger` type (`manual`, `scheduled`, `manual:location`, `auto:quest_complete`), and an optional `companion_message` for simultaneous delivery to Bob or the sister.

### Database Additions (Admin)

| Table | Key Fields | Purpose |
|-------|-----------|---------|
| `message_progress` (new) | id, **track** (test/live), progress_key, status, scheduled_at, sent_at, delivered_at, companion_status, companion_sent_at, error — unique(track, progress_key) | Tracks delivery for each message in chapters.jsonc, per track |
| `admin_activity_log` (new) | id, action_type, details (JSONB), created_at | Audit trail of admin actions |
| `player_events` (new) | id, **track** (test/live), event_type, details (JSONB), created_at | Unified event stream for timeline — track-scoped so Progress tab filters correctly |

---

## Key Design Decisions

1. **Oracle uses sliding delays.** First 5 questions per day are near-instant. Questions 6–10 take 30–90 seconds. 11+ take minutes. This manages Gemini API rate limits while making the Oracle feel like a living entity that grows weary. The counter resets daily.

2. **The Journey is the replay system.** No separate "replay mode" — the chronicle IS the replay. Expanding a moment shows the full quest. After game completion, all moments are expanded by default.

3. **Share links are atomic.** Each share link shows exactly one moment. This is intentional — it creates intrigue without spoiling the full story. Friends see a fragment, not the whole picture.

4. **Current tab is never empty.** Even in the waiting state, there's atmosphere. The Order is always watching, even when it has nothing to say.

5. **No visible page transitions.** Content fades in/out within the tab frame. The tab bar never moves. This creates a sense of stability — the interface is a frame (like the Marker itself), and the content flows within it.
