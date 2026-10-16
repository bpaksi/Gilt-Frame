# Station Card Template

A **station** is one real place and everything that belongs to it. It is order-free: the same card must work no matter when Christine reaches it.

**Rules**
- A station never names a slot, a chapter number, a date, a bird degree, or another station.
- Slots (play order) own: beat, vault fragment, difficulty, bird degree. Only **Prologue** and **Final Frame** are fixed slots.
- Use placeholders where the copy needs context the slot or deal supplies. Use only the names in `station-slot-design.md` §6: `{place}`, `{city}`, `{woman}` (this station), `{first_place}`, `{first_woman}` (station in slot 1), `{prev_place}`, `{prev_woman}` (station in the previous slot; blocked in slot 1), `{fragment}`, `{fragments_total}`, `{seal}`, `{played_women}`, `{site_url}`. Any other name fails `validate:config` and blocks the send.
- Every fact in player copy must be sourced on this card. Mark anything unconfirmed `[UNVERIFIED]` and keep it out of player copy until recon confirms it (Foundation Bible §4: no fact she could disprove).
- Player-facing copy: no em dashes, no exclamation points, no tavern-speak. Plain, warm, a little mysterious. The Order says "we" (only Fragment 6 says "I", and fragments belong to slots, not stations).
- No talking avatar. Narrative is text only.

---

```markdown
# Station: <Place name>

**Status:** Locked / Candidate / Needs recon
**Travel tier:** Kalamazoo-local / Michigan day trip / Planned trip
**Address & GPS:** <street address>; <lat, lng> (scouted? y/n); geofence radius <m>

## The woman
**Name, dates:** <name (b.-d.)>  <!-- the real woman tied to this place; she goes in the Vault gallery -->
**Order title (fiction):** <"The Keeper", "The Patron", ...>
**Real fact(s) used in play:**
- <fact> [source #]
**Link type:** True link | Order attribution  <!-- if attribution: say what history does NOT record -->

## Puzzle
**Suggested type:** FindByGps | MultipleChoice | AlignBearing | RevealNarrative | PassphraseEntry | FindByText  <!-- usually FindByGps to arrive, then one solving step, then RevealNarrative -->
**Content:** <prompt text, correct answer, distractors / bearing / passphrase>
**Why it fits the place:** <one line>
**Difficulty knobs:** <what a slot can turn up or down: hints, distractor count, tolerance>

## Backup spot
<Alternate target at the same place if the primary is closed, moved, or off display.>

## Inbound clue
<The clue that leads her TO this place. Must not name a previous station; may use `{prev_place}`, but a card whose clue uses it cannot be dealt into slot 1 (the send is blocked there). One or two lines, Order voice.>

## Narrative (one short paragraph per beat)
The slot decides which beat plays. Write the base paragraph, then an overlay for each beat. Overlays replace the base when that beat is dealt here.
- **Base:** ...
- **Beat 1 Attention:** ...
- **Beat 2 Courage:** ...
- **Beat 3 Risk:** ...
- **Beat 4 Being seen:** ...
- **Beat 5 Loss:** ...
<!-- Beat 6 belongs to the Final Frame, a fixed slot at the Kellogg gazebo that is never dealt. Stations write nothing for it. -->

## Art (owned by the station)
- **Station still:** <the image shown on arrival / in the chapter: subject, framing, light>
- **Share card:** <the OG/share image: what it shows, what it must NOT reveal>
- **Gallery portrait:** <the woman's Vault portrait: source image, pose, frame treatment, caption line>

## Sources
1. <URL> (loaded / search summary)

## Open items
- <recon checks, permissions, unverified facts>
```
