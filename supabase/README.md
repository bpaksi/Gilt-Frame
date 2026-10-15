# Supabase — Local Development

This folder holds the schema (`migrations/`), seed data (`seed.sql`), and local dev config (`config.toml`) for the Gilt Frame database. It's kept at the repo root (a sibling of `website/`, not inside it) because the Supabase CLI walks up from your working directory to find it — running commands from `website/` still works.

All commands below assume you're in `website/` (they're wired up as `pnpm` scripts there) and that Docker is running.

```bash
cd website

pnpm db:start    # start the local stack (Studio, Postgres, Auth, Storage, Mailpit)
pnpm db:stop     # stop it

pnpm db:reset    # drop + re-apply all migrations + seed.sql — destructive, local only
pnpm db:push     # push local migrations to the linked remote project

pnpm db:types    # regenerate website/src/lib/supabase/types.ts from the local schema

# raw CLI, if you need something not wrapped above
pnpm supabase db reset
pnpm supabase db lint --level warning
```

New migration:

```bash
pnpm supabase migration new <name>
```

Never run `db:reset` or `db:push` against `live` track data without explicit confirmation — see the track-isolation rules in the root [`CLAUDE.md`](../CLAUDE.md).
