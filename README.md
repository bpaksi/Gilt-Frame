# The Order of the Gilt Frame

An immersive, location-based interactive narrative experience. See [`CLAUDE.md`](CLAUDE.md) for the full architecture/domain overview and [`docs/INDEX.md`](docs/INDEX.md) for the story bible.

## Repo Layout

- **`website/`** — the Next.js app (all source code)
- **`supabase/`** — database schema, migrations, seed data
- **`docs/`** — story bible and build planning

## Getting Started

```bash
cd website
pnpm install
cp src/config/contacts.example.ts src/config/contacts.ts   # gitignored, PII
cp .env.example .env.local                                 # fill in API keys
pnpm db:start   # starts local Supabase (requires Docker running)
pnpm dev        # http://localhost:3501
```

See [`CLAUDE.md`](CLAUDE.md#local-development) for the full local dev workflow and [`supabase/README.md`](supabase/README.md) for database commands.
