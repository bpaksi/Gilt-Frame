# UI Track — README

**This track works off the [Tone & Creative North Star](Tone_North_Star.md) and the live Component Gallery. It needs zero real story content — no Location & Person Cards, no confirmed 2027 stops, no finished copy — to make progress.**

That independence isn't aspirational; it's already built into the code. Every UI primitive, game-UI building block, and quest component exports its own `showcase` fixture — a self-contained demo of that component with placeholder config, decoupled from `gameConfig` (the real chapter/story data). The admin **Component Gallery** (`/the-order/gallery`) renders every one of them in isolation, in a real device-size viewport, with a live config editor to tweak props on the fly. See `website/src/components/admin/gallery/showcaseRegistry.tsx` for the full registry.

## What you can do here, independent of the Story track

- Retheme colors, type, spacing (`website/src/components/ui/tokens.ts`, `website/src/app/globals.css`) and see every component update at once in the gallery.
- Design and test the daylight/outdoor mode (currently **not implemented** — see Visual_Language_Decisions.md) against real quest components, using their placeholder `showcase` config.
- Build or refine motion (`UnlockAnimation`, `OrbAnimation`, `CompletionCountdown`, `puzzleSolveAnimation.ts`) against the "unhurried, earned, never snappy" bar from the Tone doc.
- Add new UI primitives or refine existing ones (`website/src/components/ui/`) without writing a word of chapter copy.
- Judge every component against the Tone doc's five words (Reverent, Luminous, Secretive, Elegiac-but-warm, Handcrafted) and its guardrails (not occult, not gamey, not corporate, not pirate-map kitsch, not cold/cluttered).

## What this track still needs from local infra

The gallery page itself is a real, session-protected admin route — it needs the local Supabase stack running (`pnpm db:start`, see the root [CLAUDE.md](../../CLAUDE.md#local-development)) even though the *content* it renders is fixture data, not real story content. So: independent of the Story track's authoring pace, but not independent of `pnpm dev` + Docker.

```bash
cd website
pnpm db:start   # if not already running
pnpm dev
# open http://localhost:3501/the-order/login?k=<ADMIN_KEY from .env.local>
# then /the-order/gallery
```

## Workflow

1. Pick a component category in the gallery (UI / Game / Quest).
2. Select a component. It renders with its own default `showcase` config — no real chapter needed.
3. Tweak the config live via the built-in editor, or edit the component/tokens and hot-reload.
4. For anything that touches the shared visual language (color, type, the Marker, motion timing), record the decision in [Visual_Language_Decisions.md](Visual_Language_Decisions.md) so it doesn't have to be re-litigated per component.

## Where this hands back to the Story track

The UI track should never need to invent story content to make a design decision — if you find yourself needing real copy to judge whether a component "feels right," that's a sign to pull a placeholder line from the [Chapter Template](../Story/Chapter_Template.md) or an existing chapter (Kellogg/Art Institute are fully written) rather than wait on new locations. The two tracks meet only at `config.ts`, when a Location & Person Card is ready to be wired into real steps using components this track has already finished.
