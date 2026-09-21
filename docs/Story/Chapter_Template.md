# The Gilt Frame — Chapter Template

**The repeatable structure every movement follows, independent of which location and person get dealt into it.**

This is the piece that was promised in the Build Schedule (Phase 1: "Lock the Chapter Template") and never written down on its own. It exists so a chapter can be authored, end to end, the moment a [Location & Person Card](Location_Person_Card_Template.md) is filled in — without re-deriving the shape from scratch each time, and without waiting for every stop on the real 2027 route to be confirmed first.

Two chapters are already built to this shape (Kellogg — "The Compass and the Sundial", Art Institute of Chicago — "The Gallery of Whispers"). This document reverse-engineers what they have in common, corrects it against the [Foundation Bible](Foundation_Bible.md) and [Story Spine](Story_Spine.md), and folds in the fixes the [Story Review](Story_Review_Continuity_and_Themes.md) called for — chiefly, that the decodable-fact "key" (the 255° bearing) should be the *rule* for every movement, not a one-off.

---

## The eight beats of a chapter

Every chapter, regardless of location, moves through the same eight beats. A beat may be thin (one SMS) or rich (a full on-site puzzle) depending on the chapter's weight in the overall arc, but none are skipped.

| # | Beat | Purpose | Channel(s) |
|---|------|---------|------------|
| 1 | **The Summons** | The Order opens contact. Names the destination obliquely, never plainly. Sets the register (see Tone doc) for this chapter. | Letter (movement-opening chapters) or SMS/email (mid-arc) |
| 2 | **The Briefing** | Orients her to what she's looking for, without naming the answer. Plants the real historical figure and the real place as things to notice, not facts to memorize. | Email |
| 3 | **The Approach** | Gets her physically to the location. `FindByGps` (full mode with coordinates once locked, lite mode as a narrative beat if there's no real geofence yet). | Website |
| 4 | **The Riddle Key** *(mandatory — see below)* | One real, verifiable fact at this location, decoded, that points to the *next* chapter's person or place. This is the bearing-template from Ch1→Ch2. Every chapter has exactly one. | Website (`AlignBearing`, or a `MultipleChoice`/`FindByText` built so the *correct answer itself* is the pointer, not just a pass/fail gate) |
| 5 | **The Recognition** | She identifies the real person through their work. Multiple-choice or text-search against real, checkable facts (per the Foundation Bible's hard rule: never a fact she could disprove on the placard). | Website (`MultipleChoice` / `FindByText`) |
| 6 | **The Reflection** | Free-response, no-fail by design (this is deliberate — see Story Review §4 — but pair it with beat 4 so *something* in the chapter is genuinely solvable/failable). Where the companion thread gets a touch, per beat's slot (see below). | Website or in-person |
| 7 | **The Vault Fragment** | The chapter's reward. One of the six fragments from the Story Spine, delivered as ordinary Order praise. Which fragment depends on which of the six beats (Story Spine §2) this chapter is carrying — see the mapping rule below. | `RevealNarrative` |
| 8 | **The Release** | Chapter close. Bird-degree address (if this chapter crosses a threshold), danger-register line for this beat, sets up the next summons. | Website / SMS |

**Beat 4 is the addition this template makes.** Ch1 (Kellogg) has it — the 255° bearing that secretly points to Chicago. Ch2 (Art Institute) does not yet, and per the Story Review that's the gap to close, not the pattern to repeat. Every future chapter needs its own version: a fact at *this* location that, decoded, is the pointer to the next one. That's the "Dan Brown" spine the review asked for, made structural instead of occasional.

---

## Mapping a chapter to a Story Spine beat

The [Story Spine](Story_Spine.md) defines six emotional beats (Attention → Courage → Risk → Being Seen → Loss → Love Anyway), each tied to a bird degree and a vault fragment. A chapter's *beat assignment*, not its location, determines:

- which vault fragment it delivers (beat 7)
- which bird degree she's addressed as afterward (beat 8)
- how explicit the danger register gets (threaded through beats 1, 2, and 8)

This mapping happens in the [Chapter Map](Chapter_Map.md), not here — this document is location-and-beat agnostic on purpose. When a new stop's geography firms up, look up its assigned beat in the Chapter Map, then write beats 1–8 above to hit that beat's emotional register and deliver that beat's fragment. The location supplies beats 1, 2, 3, 4, 5 (the surface). The beat assignment supplies beats 6, 7, 8 (the spine).

If N (total chapter count) ends up fewer or more than 6, see Story Spine §6 for how beats fold together or stretch — that rule lives there, not here, so it only has to be decided once.

---

## What must be true before a chapter can be written

Per the Foundation Bible's pluggable doctrine (§4) and the Location & Person Card template, a chapter is ready to author once its card has:

- [ ] A real person with at least one real, checkable fact
- [ ] A real, visitable location (or a firm fallback if the primary work isn't on display — see Story_Review §4 on art rotation)
- [ ] A decoded whether it's a **true link** or an **Order attribution** (Foundation Bible §4) — this determines how confidently the Order can claim the connection
- [ ] Its beat assignment from the Chapter Map (which fragment, which bird degree, which danger register)
- [ ] Its beat-4 riddle key: the one fact that points forward

Until all five are filled in, the slot stays a stub in `config.ts` — that's expected and correct, not a bug. See [Chapter_Map.md](Chapter_Map.md) for what's currently locked vs. still open.

---

## Companion thread

Per Story Review §3: the companion/sister thread ("you walk beside the one we seek... do not interfere") fades after Ch3 in the old draft and must not. Every chapter's beat 6 (Reflection) should touch it at least lightly — a line acknowledging the companion's presence — so that its Story 2 payoff ("the companions have been instructed" = they were asked to be there for you) has continuous evidence to draw on at the reveal, not just a Ch1–3 memory.

---

## Voice checklist (every beat, every chapter)

Before a chapter is considered done, check every player-facing line against:

1. **The dual-meaning key** (Story Spine §5) — does this line read innocently as Order lore *and* carry the Story 2 meaning underneath?
2. **No em dashes.** Commas instead. (Foundation Bible §9, Story Spine header note.)
3. **No disprovable facts.** Anything the Order claims as history must be real; only the connection/meaning is invented. (Foundation Bible §4.)
4. **The Order never breaks character**, including in the Oracle's answers, which draw only from what she's unlocked so far.
