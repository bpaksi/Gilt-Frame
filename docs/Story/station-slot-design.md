# Gilt-Frame: Station / Slot Model (Design)

Status: draft for Bob. Design only; no code changed yet.
Based on the Oct 15, 2026 review of `website/src/config/config.ts` and `lib/actions/quest.ts`.

## 1. Goals
- Every station can go in any slot. No station assumes it comes before or after another.
- Only the **Prologue** (slot 0) and the **Final Frame** (last slot) are fixed.
- The emotional beat, fragment number and difficulty belong to the **slot**, not the place.
- Christine's experience still feels ordered and building, even though stations are dealt in any order.
- One deal per track (test, live), so we can rehearse a full deal on the test track.
- Each station can be tested on its own in the Gallery, and any deal can be tested end to end on the Testing page.

What's wrong today: each chapter (`ch1` Kellogg, `ch2` AIC) mixes place, puzzle, beat, seal, dates and wording,
and the code runs steps in a fixed `order`. Copy hard-codes places ("Gallery 273") and the 2026 dates.

## 2. Concepts
- **Station**: one real place plus one woman's story. Written once, knows nothing about its order.
- **Slot**: one position in the arc. Carries the beat, fragment, difficulty, seal and slot-level messages.
- **Deal**: per track, which station fills which slot. A chapter is built at runtime as `slot + station`.
- **Fixed slots**: Prologue and Final Frame have their own content and never take a station.

## 3. Station card schema
File per station: `src/config/stations/<id>.ts` (one exported object).

```ts
type Station = {
  id: string;                    // "kellogg-sundial", "aic-palmer"
  place: { name: string; city: string; address?: string; hours_note?: string };
  woman: { name: string; dates?: string; one_line: string };
  checkable_fact: string;        // something true Christine can verify on site
  coordinates?: { pin: LatLng; target: LatLng };  // pin = where she's sent, target = the puzzle spot
  wayfinding: { text: string; distance_gates?: DistanceGate[]; hints: string[] };
  inbound_clue: string;          // "how to find me": the text/email clue that sends her here
  core_story: string;            // the woman's story, 1-2 paragraphs, beat-neutral
  beat_paragraphs: Record<Beat, string>; // one short paragraph per beat; the slot picks one
  puzzles: StationPuzzles;       // content per puzzle type, see below
  portrait: { image: string; caption: string; credit?: string }; // used in the finale gallery
  logistics: { vetted: boolean; vetted_on?: string; notes: string; access?: string; risks?: string };
  backup: { name: string; coordinates?: LatLng; note: string }; // fallback if the main spot is closed
};

type StationPuzzles = {           // content only; difficulty comes from the slot
  find_by_gps?:   { title_lines?: string[]; instruction: string; questions?: PoolQuestionItem[] };
  find_by_text?:  { guidance_text: string; hints: string[]; question: PoolQuestionItem };
  multiple_choice?: { instruction?: string; questions: PoolQuestionItem[] };
  align_bearing?: { compass_target: number; instruction?: string };
  passphrase?:    { passphrase: string; hints?: string[] };
  reveal?:        { primary: string; secondary?: string };
  sequence: PuzzleType[];         // which puzzles run here, in order (within the station only)
};
```

Rules: a station never names another station, a slot number, a fragment or a date.
Copy that needs those uses placeholders (section 6).

## 4. Slot schema
One file: `src/config/slots.ts`.

```ts
type Beat = "attention" | "courage" | "risk" | "being_seen" | "loss" | "love_anyway";

type Slot = {
  index: number;                 // 1..N (0 = Prologue and N+1 = Final Frame are separate fixed defs)
  beat: Beat;
  fragment: number;              // which piece of the frame she earns
  difficulty: {
    hint_count: number;          // how many station hints are shown (taken from the front of the list)
    wrong_answer_allowance: number; // misses before an extra hint or a softer path
    num_distractors: number;     // overrides MultipleChoice wrong-option count
    geofence_radius_m: number;
    compass_tolerance_deg: number;
    hold_seconds: number;
  };
  seal: { name: string; description?: string };
  messages: SlotMessage[];       // slot-level texts/emails, templated (see section 6)
};

type SlotMessage = {
  id: string;                    // "briefing", "summons", "arrival", "post_solve", "debrief"
  type: "sms" | "email" | "letter";
  to: Recipient;
  trigger: "manual" | "auto";
  delay_minutes?: number;
  when: "before_station" | "on_arrival" | "after_solve";
  subject?: string;
  body_or_template: string;      // text with placeholders, or an email template name
  companion_message?: CompanionMessage;
};
```

The slot sets the order Christine feels: beat 1 → 6, fragments 1 → 6, difficulty rising.
The station supplies the place and the words.

## 5. Deal record (per track)
Stored in Supabase (`deals` table) so Bob can re-deal from the admin without a deploy, with a
config default for tests.

```ts
type Deal = {
  track: "test" | "live";
  slots: Record<number, string>;  // slot index -> station id
  locked_through?: number;        // slots already played can't be re-dealt
  updated_at: string;
};
```

Checks (run by `validate:config` for the config default and by the admin before saving):
- Every slot 1..N has a station.
- No station is used twice.
- Every station in the live deal has `logistics.vetted = true`.
- Each station has content for every puzzle type in its `sequence`, and a paragraph for the slot's beat.
- Slots that are already played or in progress can't change (`locked_through`).
- Warning only: the station needs coordinates if its sequence uses FindByGps with navigation.

## 6. Template placeholders
Resolved at send/render time from the deal + progress, never baked into copy.

| Placeholder | Source |
|---|---|
| `{place}`, `{city}` | current station |
| `{woman}` | current station's woman.name |
| `{beat}`, `{beat_paragraph}` | slot beat; station's paragraph for that beat |
| `{fragment}`, `{fragments_total}` | slot |
| `{seal}` | slot seal name |
| `{inbound_clue}` | current station |
| `{first_place}`, `{first_woman}` | station in slot 1 |
| `{prev_place}`, `{prev_woman}` | station in the previous slot (empty for slot 1) |
| `{next_clue}` | next slot's station inbound_clue |
| `{played_women}` | list of women in played stations |
| `{site_url}` | env |

Unknown or empty placeholders fail `validate:config`, and sending is blocked rather than going out with
`{place}` in the text. One resolver (`lib/templates.ts`) is used by `send.ts`, the email templates,
RevealNarrative and the admin preview.

## 7. Progress keyed by slot
- `chapter_progress.chapter_id` becomes `slot_index` (plus `prologue` / `finale`), with a
  `station_id` column recorded when the slot starts. The station is data, not the key.
- `step_progress.step_id` becomes `"<slot>:<step>"`, e.g. `3:find_by_text`, `3:msg:arrival`.
- When a slot starts, the station is frozen into the progress row, so later re-deals can't change history.
- `advanceQuest` gets the built chapter from `slot + frozen station`. While we're in there, it should
  also check answers on the server (review finding).

## 8. Finale (Final Frame)
- Built from the played slots in order: one gallery card per station (`portrait`, `woman`,
  `checkable_fact`, the beat paragraph she read).
- The cards appear one by one, ending with an empty gilt frame that becomes **Christine's frame**,
  last. Copy comes from the fixed finale def and uses `{played_women}`, `{first_place}` and so on.
- Fragments collected = the slots' fragment numbers. The finale checks that all fragments are earned.

## 9. Gallery and Testing page
- **Gallery** (`/the-order/gallery`): presets list **Station × Slot**. Pick a station, pick a slot
  (or "difficulty: easy/hard"), and the chapter-builder shows the merged config in `ConfigEditor`.
  You can still test each puzzle on its own, which fits the one-puzzle-at-a-time UI refresh.
  Gallery actions only ever touch the test track.
- **Testing** (`/the-order/testing`): shows the test track's deal, lets you re-deal (shuffle or pick),
  runs validation, then activates slot by slot. Message previews show resolved placeholders.
  A dry-run toggle logs sends instead of calling Twilio/Resend (review finding).
- The GPS test becomes a station card fixture marked `dev: true`, which live deals and the
  chapter list skip.

## 10. Migration from today's config
1. Add the new types next to the old ones, plus `buildChapter(slot, station)`, which returns today's
   `Chapter` shape. Existing QuestRunner and puzzle components keep working unchanged.
2. **ch0 (The Summons)** becomes the fixed Prologue def. Retire the "I SEE CLEARLY" passphrase and the
   2026 window; the passphrase moves to the prologue config, still to be chosen.
3. **ch1 Kellogg** becomes station `kellogg-sundial`: pin/target coords, wayfinding gates, AlignBearing
   bearing, reward text become `puzzles.reveal`. The briefing/summons/arrival/post-solve messages become
   slot messages with `{place}` instead of "Kellogg".
4. **ch2 AIC** becomes station `aic-palmer`: Palmer/Zorn portrait questions, Cassatt advisor trial,
   gallery hints. Timekeeper/mid-gap/debrief emails are split: lore that belongs to the place stays
   in the station; pacing emails move to slots.
5. The **ch3 stub** is deleted; Bob writes new station cards from the template.
6. `dev_gps_test` becomes a dev station fixture.
7. DB migration: add `deals`, `slot_index`, `station_id`. Existing test-track rows are reset; there's
   no live progress to keep.
8. Update `presets.ts`, the gallery, testing and `validate-config.ts` to go through the deal; then
   delete the old `chapters` record.
9. Letters (`config/letters/*.html`) become templates with placeholders where they mention places.

Rough order: types and builder → convert Kellogg/AIC → deal plus validation → progress migration →
templates resolver → Gallery/Testing → finale.

## 11. Open questions for Bob
1. How many middle slots: exactly 6 (one per beat), or fewer with some beats doubled up?
2. Who deals: you pick by hand, random shuffle with constraints, or the deal adapts to travel plans?
3. Can a slot be re-dealt after Christine has received its inbound clue, or only before?
4. Should difficulty rise strictly by slot, or should some stations have a fixed floor (e.g. AIC is hard)?
5. Does each fragment have its own fixed art and text, or is that from the station?
6. Prologue passphrase: new acrostic, and is the physical letter still part of it?
7. Do companions get per-slot messages, per-station ones, or both?
8. Finale location: fixed place, or the last played station?
9. Dates: drop the `window` field and schedule only from the admin, or keep target dates per slot?

## Addendum: station art fields (Illusionist)
Every station card also carries `art.still`, `art.share_card` and `art.gallery_portrait`. Art always belongs to the station, never to a slot, so it moves with the station into whichever slot it's dealt into. The finale gallery is built from the gallery portraits of the stations she actually played. Validation fails a live deal if any dealt station is missing one of the three, and each asset must fit the size limits in the per-stop asset kit.

## Addendum: old Chapter 3-6 stops become station candidates (Bob, Oct 16 2026)
Bob ruled: "Fold them into the new station design." The old chapter plan (archive/chapters/INDEX.md) is no longer an order. Each old stop is only a candidate station. It gets a station card like any other, or it is dropped.

| Old chapter | Place | Station status |
|---|---|---|
| Ch3 The Keeper's Archive | Crystal Bridges, Bentonville AR | Candidate, needs a card. Reuse its puzzle (acrostic) and the Walton/Cassatt facts. |
| Ch4 The Southern Vault | Frederik Meijer Gardens, Grand Rapids | Candidate, needs a card (Degas bronzes). Also in the Oct 15 research as 4C/5C. |
| Ch5 The Windmill Key | Kellogg Manor windmill | Not a separate station. It is already the backup spot on the Kellogg card. Keep it there. |
| Ch6 The Living Gallery | Shedd Aquarium, Chicago | Candidate, needs a card. Its woman and puzzle are not designed yet. |

How to fold an old stop into a card:
- Keep the place, its woman, the sourced facts, the puzzle and the art fields.
- Strip anything that names an order, a date, a chapter number, or the next stop (for example the "Ch3 -> Ch4" Degas hand-off). If that hand-off is wanted, it becomes a pointer the slot adds when the stops are dealt (section 4).
- Old beat labels (Risk, Being Seen, Loss, Love Anyway) belong to slots, not stations. A card can list the beats it suits.
- Facts that aren't confirmed stay out of player copy, as on the other cards.

Already carded from the Oct 15 research: Ladies' Library, KIA, Cranbrook, Mountain Home Cemetery. Edsel & Eleanor Ford House (5B) stays a candidate without a card until Bob wants it.
