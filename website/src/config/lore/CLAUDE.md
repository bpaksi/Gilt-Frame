# Lore & Oracle System

## What This Folder Contains

The `.md` files here (excluding this one) are **Scrolls of Knowledge** — in-universe lore entries written in the voice of the Order of the Gilt Frame. They are loaded at runtime by `src/lib/lore.ts` and serve two purposes:

1. **Displayed on the Oracle page** as unlockable narrative content
2. **Injected into the Oracle's Gemini system prompt** to give it knowledge to draw from

## Lore File Format

Each scroll is a Markdown file with YAML frontmatter:

```markdown
---
title: "The Founding of the Order"
order: 1
unlock_chapter_id: null
---
Body content written in the Order's narrative voice...
```

| Field | Purpose |
|---|---|
| `title` | Display name on the Oracle page |
| `order` | Sort order for display |
| `unlock_chapter_id` | Chapter ID that must be completed to unlock (`null` = always visible) |

Filename convention: `NN-slug.md`. The filename (minus `.md`) becomes the entry `id`.

## How the Oracle Works

The Oracle is a Gemini-powered conversational interface where the player ("Sparrow") can ask questions about the Order, their journey, and the world of the game.

### API Flow (`src/app/api/oracle/route.ts`)

1. **Authenticate** — resolve the player's track from their `device_token` cookie
2. **Fetch today's conversations** — used for both rate-limiting and conversation history
3. **Apply delay throttling** — progressive delays based on daily usage (5-15s for questions 2-5, 30-60s for 6-10, hard wall at 11+)
4. **Build context** — query completed chapters, load unlocked lore
5. **Assemble system prompt** — character persona + completed chapters + unlocked scrolls (`src/lib/oracle-prompt.ts`)
6. **Build multi-turn contents** — sliding window of recent Q&A history + the new question
7. **Stream response** from Gemini and persist the Q&A pair to `oracle_conversations`

### Progressive Knowledge

The Oracle's knowledge grows as the player progresses through the game:

- **Lore gating**: Each scroll has an `unlock_chapter_id`. Scrolls locked behind incomplete chapters are excluded from the system prompt entirely. The Oracle literally cannot reference what it doesn't have.
- **Chapter awareness**: Completed chapter names and locations are listed in the prompt. The Oracle can reflect on completed trials but deflects about future ones.
- **Result**: Early in the game the Oracle has minimal context (3 always-unlocked scrolls). As chapters are completed, new scrolls unlock, and the Oracle gains richer knowledge to draw from.

### Conversation Memory

The Oracle remembers recent questions within the same day:

- **Sliding window**: Last 6 exchanges from today's `oracle_conversations`
- **Character budget**: 3000 chars max — oldest exchanges drop first if exceeded
- **Scope**: Today only. Each new day the Oracle starts fresh.
- **Storage**: All Q&A pairs are persisted to `oracle_conversations` regardless of the window, so the full history exists in the DB.

### Deflection Behavior

When asked about something outside its current knowledge, the Oracle never says "I don't know." Instead it:

- Frames the gap as "you're not ready yet" — the knowledge exists, the Sparrow hasn't earned it
- Varies its phrasing every time (never repeats a deflection)
- Mirrors the Sparrow's tone — playful questions get wit, serious ones get gravity, frustrated ones get empathy

### Key Constraints

| Constraint | Value |
|---|---|
| Model | `gemini-2.0-flash` |
| Temperature | 0.7 |
| Max output tokens | 300 |
| Max history turns | 6 |
| Max history chars | 3000 |
| Daily question wall | 11 |

## Adding a New Scroll

1. Create `src/config/lore/NN-slug.md` with frontmatter (`title`, `order`, `unlock_chapter_id`)
2. Set `unlock_chapter_id` to a chapter ID to lock behind chapter completion, or `null` for always-unlocked
3. The lore loader picks it up automatically — no code changes needed
