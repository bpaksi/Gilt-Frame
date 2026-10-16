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
  beat_paragraphs: Record<MiddleBeat, string>; // one short paragraph per beat 1-5; the slot picks; no love_anyway (Final Frame only)
  puzzles: StationPuzzles;       // content per puzzle type, see below
  portrait: { image: string; caption: string; credit?: string }; // used in the finale gallery
  logistics: { vetted: boolean; vetted_on?: string; notes: string; access?: string; risks?: string };
  backup: { name: string; coordinates?: LatLng; note: string }; // fallback if the main spot is closed
  difficulty_floor?: DifficultyLevel; // never plays below this level, whatever slot it is dealt into (decision 4)
};

type StationPuzzles = {           // content only; difficulty comes from the slot, raised to the station's floor
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
type MiddleBeat = Exclude<Beat, "love_anyway">; // love_anyway lives only in the fixed Final Frame (Story_Spine §6)

type DifficultyLevel = 1 | 2 | 3 | 4 | 5;
type DifficultyKnobs = {
  hint_count: number;            // how many station hints are shown (taken from the front of the list)
  wrong_answer_allowance: number; // misses before an extra hint or a softer path
  num_distractors: number;       // overrides MultipleChoice wrong-option count
  geofence_radius_m: number;
  compass_tolerance_deg: number;
  hold_seconds: number;
};
const DIFFICULTY: Record<DifficultyLevel, DifficultyKnobs>; // one table; level 5 is hardest

type Slot = {
  index: number;                 // 1..N (0 = Prologue and N+1 = Final Frame are separate fixed defs)
  kind: "beat" | "connective";
  beats: MiddleBeat[];           // "beat": one beat, or two adjacent beats folded together (courage + risk);
                                 // "connective": the one beat already in play, deepened, not advanced
  fragment: number | null;       // which piece of the frame she earns; one per "beat" slot, even when folded;
                                 // null for "connective" (adds nothing to the letter)
  difficulty: DifficultyLevel;   // rises by slot; effective level = max(slot.difficulty, station.difficulty_floor ?? 1)
  seal: { name: string; description?: string };
  messages: SlotMessage[];       // slot-level texts/emails, templated (see section 6)
};

type SlotMessage = {
  id: string;                    // "briefing", "summons", "arrival", "post_solve", "debrief"
  type: "sms" | "email" | "letter";
  to: Recipient;
  when: "before_station" | "on_arrival" | "after_solve"; // when it becomes ready; Bob still sends it by hand
  subject?: string;
  body_or_template: string;      // text with placeholders, or an email template name
  companion_message?: CompanionMessage;
};
```

The slot sets the order Christine feels: beats 1 → 5 across the middle slots, beat 6 (love anyway) and its
fragment only in the fixed Final Frame, difficulty rising. Folding and connective slots follow Story_Spine §6
and decision 1. The station supplies the place and the words. For a folded slot both beat paragraphs play, in
beat order.

Slot messages have no trigger, delay or schedule. Each one is ready once its `when` is reached, and it goes out
only when Bob sends it from the admin (decision 9). Slot messages do not use QStash delayed delivery.

### Pointers belong to the slot
A direction pointer from one stop to the next (a bearing, a heading, or a 'look toward' clue) belongs to the slot, never to a station card. The deal decides which stations end up next to each other, so a pointer can only be written once both neighbors are dealt. For that reason the 255° bearing has been taken off the Kellogg station card. If a slot needs a pointer, it is written when the deal is made and saved in the deal record.

## 5. Deal record (per track)
Stored in Supabase (`deals` table) so Bob can re-deal from the admin without a deploy, with a
config default for tests.

```ts
type Deal = {
  track: "test" | "live";
  slots: Record<number, string>;  // slot index -> station id
  clue_sent: Record<number, string>; // slot index -> when its inbound clue went out; that slot is locked
  updated_at: string;
};
```

Checks (run by `validate:config` for the config default and by the admin before saving):
- Every slot 1..N has a station.
- No station is used twice.
- Every station in the live deal has `logistics.vetted = true`.
- Each station has content for every puzzle type in its `sequence`, and a paragraph for each of the slot's beats.
- A slot whose inbound clue has been sent can't change (`clue_sent`, decision 3). Sending the clue writes
  the entry, and from then on that slot keeps its station even if it hasn't started.
- Slot shape: a `beat` slot has one beat, or two adjacent beats, and a fragment; a
  `connective` slot has one beat already in play and no fragment. No middle slot has `love_anyway`.
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
  `station_id` column recorded when the slot's inbound clue is sent. The station is data, not the key.
- `step_progress.step_id` becomes `"<slot>:<step>"`, e.g. `3:find_by_text`, `3:msg:arrival`.
- When a slot's inbound clue is sent, the slot locks in the deal and its station is frozen into the progress
  row, so later re-deals can't change history.
- `advanceQuest` gets the built chapter from `slot + frozen station`. While we're in there, it should
  also check answers on the server (review finding).

## 8. Finale (Final Frame)
- Built from the played slots in order: one gallery card per station (`portrait`, `woman`,
  `checkable_fact`, the beat paragraph she read).
- The cards appear one by one, ending with an empty gilt frame that becomes **Christine's frame**,
  last. Copy comes from the fixed finale def and uses `{played_women}`, `{first_place}` and so on.
- Fragments collected = the middle slots' fragment numbers, then fragment 6 (love anyway), which belongs to the
  Final Frame itself. The finale checks that all middle fragments are earned.

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

## Addendum: Bob's decisions (Oct 16 2026)
1. The number of middle slots equals the number of stops the 2027 trips support. If there are fewer stops than beats, beats double up as the Story Spine §6 says: courage pairs with risk, and loss never pairs with love. If there are more stops than beats, the extra stops become connective stops.
2. The deal adapts to the travel plans. Each trip's stops fill the middle slots, and beats are assigned in trip order.
3. A slot can be re-dealt to a different station only until Christine's inbound clue for it goes out. Once that clue is sent, the slot is locked.
4. Puzzle difficulty rises by slot. Some stations have a difficulty floor they never play below.
5. A fragment's art and text come from its slot and are fixed by the slot's place in the story. The fragment sequence stays the same whichever station is dealt.
6. The Prologue passphrase is a new acrostic. The physical letter stays.
7. Companion messages are tied to the slot, not the station. This follows from decision 5.
8. The Final Frame is a fixed place: the Kellogg gazebo, reached by boat. It is a fixed final slot and is never dealt.
9. Slots have no dates. Every send happens only when Bob triggers it by hand from the admin.
