# The Gilt Frame — Location & Person Card Template

**The reusable, pluggable unit of content. One card per real-world stop.**

This is the artifact the [Foundation Bible's pluggable doctrine](Foundation_Bible.md#4-the-pluggable-doctrine-the-engine-as-canon) runs on: "each chapter, Christine identifies a real historical figure through their work at a real location, and a real fact about that person becomes the key that points to the next person and place." A card is the complete, self-contained answer to "what happens at this stop," written so it can be authored the moment a location is confirmed and then slotted into the [Chapter Template](Chapter_Template.md) without touching the Story Spine.

Two cards already exist in practice (Kellogg Manor, Art Institute of Chicago) even though they were never written down in this shape. They're filled in below as worked examples. Everything after them is open — to be authored once Build Schedule Phase 2 ("confirm the real 2027 stops") locks in.

---

## The template

```markdown
### Card: <Location Name>

**Status:** Locked / Candidate / TBD
**Assigned beat (Chapter Map):** <1-6, see Chapter_Map.md>
**Real person:** <name>
**Real, verifiable facts:**
- <fact 1 — must be disprovable-checkable; this is the seduction>
- <fact 2>

**The Order's reframe (fiction):** <the invented title/role and meaning — "The Keeper," "The Patron," etc.>

**Link type:** True link | Order attribution
  <If true link: cite the real historical connection.>
  <If attribution: name what history does NOT record, and how the Order "remembers a reason." Never invent a disprovable fact — only the connection.>

**Location:** <place, city/state>
**Logistics:**
- Hours / access notes
- What's on display, and confirm-on-date (art rotates — see fallback)
- GPS coordinates (once scouted)
- Geofence radius recommendation

**Fallback if primary work isn't on display:** <alternate work/detail at same location, or note none exists yet>

**The Riddle Key (Beat 4, mandatory):** <the one real, decodable fact at this location that points to the NEXT chapter's person/place — the 255°-bearing pattern>

**Companion thread touch:** <how the companion is present/acknowledged here, however lightly>

**Vault fragment delivered:** Fragment <1-6> — <name>, per beat assignment
**Bird degree on completion:** <Sparrow/Wren/Kestrel/Merlin/Peregrine/Eagle>
**Danger register:** <per Story Spine beat table — eerie/atmospheric, first whisper of cost, etc.>

**Notes:**
- <anything chapter-specific that doesn't fit above>
```

---

## Worked example 1 — Kellogg Manor (locked, Beat 1)

```markdown
### Card: Kellogg Manor

**Status:** Locked
**Assigned beat:** 1 — Attention (Sparrow)
**Real person:** W. K. Kellogg
**Real, verifiable facts:**
- Cereal magnate; built the Gull Lake manor and its windmill
- Went blind (glaucoma) in his later years

**The Order's reframe (fiction):** "The Keeper." Carried a bearing north from the White City and set it into the bones of his estate. His sight was "taken."

**Link type:** Order attribution (Kellogg has no real documented tie to the 1893 Order narrative — the Order claims a hidden reason where history records none)

**Location:** Kellogg Manor, Michigan
**Logistics:** Grounds-accessible; sundial and windmill on the property; local for Bob, no travel scouting required.

**Fallback if primary work isn't on display:** N/A — the sundial/windmill are permanent fixtures, not rotating art.

**The Riddle Key (Beat 4):** The 255° compass bearing embedded at the sundial, decoded via `AlignBearing`, secretly points toward Chicago — paid off only when she later sees "Zorn / Chicago 1893" at the Art Institute. Per the Story Review, this is the template every other chapter's key should follow.

**Companion thread touch:** Established here — "you walk beside the one we seek... do not interfere."

**Vault fragment delivered:** Fragment 1 — Attention
**Bird degree on completion:** Sparrow → Wren
**Danger register:** Eerie, atmospheric — first mention of Kellogg's blindness, no explicit threat yet.
```

## Worked example 2 — Art Institute of Chicago (locked, Beat 2)

```markdown
### Card: Art Institute of Chicago

**Status:** Locked
**Assigned beat:** 2 — Courage (Wren)
**Real person:** Bertha Palmer (primary); Anders Zorn and Claude Monet (supporting, same location)
**Real, verifiable facts:**
- Palmer: President of the Board of Lady Managers, 1893; shaped the Art Institute's Impressionist holdings; died 1918
- Zorn: painted the full-length portrait of Palmer (1893), hanging at the Art Institute
- Monet: *The Cliff Walk at Pourville* (1882); X-ray shows a third figure was painted in and removed

**The Order's reframe (fiction):** Palmer is "The Patron," who hid the Order's work in the palace of art beside the lake, taken in 1918. Zorn is the hand that captured the Patron's bearing. Monet is a Member — proof that a work hides what the eye cannot see until instructed.

**Link type:** True link (Palmer's Art Institute role and the Zorn portrait are both real, documented, on-site)

**Location:** Art Institute of Chicago
**Logistics:** Museum hours/admission apply; confirm Zorn portrait and Monet Cliff Walk are on display before each run (art rotates — see fallback).

**Fallback if primary work isn't on display:** Not yet defined — flag as an open item before this chapter runs again (Story Review §4, art rotation risk).

**The Riddle Key (Beat 4):** **Open / not yet written.** The Story Review flagged this chapter as missing its own decodable key — it currently resolves as recognition + reflection only. Needs a fact (Zorn portrait detail, or the Monet X-ray) turned into a pointer toward Chapter 3's location, following the Ch1 bearing pattern.

**Companion thread touch:** Present per Ch1–3 design; confirm it continues into whatever Ch3 becomes.

**Vault fragment delivered:** Fragment 2 — Courage
**Bird degree on completion:** Wren → Kestrel
**Danger register:** First whisper of cost — Palmer "taken" in 1918 named explicitly.
```

---

## Open slots (Beats 3–6)

Per Build Schedule Phase 2, these cannot be finalized until the real 2027 stops are confirmed. The Foundation Bible's historical spine (§5) already has candidate figures banked and ready to deal in once geography is known: Mary Cassatt ("The Advisor"), Edgar Degas ("the one who saw what she saw," pluggable), and the lost *Modern Woman* mural as the ultimate relic. The old design drafts (now in `Story/archive/`) explored Crystal Bridges, Meijer Gardens, and Sleeping Bear Dunes as candidate locations — treat those as *inspiration for what kind of stop could fill Beats 3-6*, not as decisions; nothing there is canon until a card is written here.

| Beat | Emotional function | Candidate person (from Foundation Bible §5) | Status |
|---|---|---|---|
| 3 | Risk (Kestrel) | Mary Cassatt — "The Advisor" | TBD — pending confirmed stop |
| 4 | Being Seen (Merlin) | Edgar Degas — bridge figure, pluggable | TBD — pending confirmed stop |
| 5 | Loss (Peregrine) | (open) | TBD — pending confirmed stop |
| 6 | Love Anyway (Eagle) / Finale | The lost mural as culminating relic; the Final Frame reveal | TBD — location only; the reveal mechanism itself is fully specified in Story Spine §4 regardless of where it happens |

**Do not treat `config.ts`'s current `ch3` stub ("Kalamazoo / KIA / Kellogg Manor") as a decision.** It predates this canon and is a leftover placeholder — see [Chapter_Map.md](Chapter_Map.md) for the current, authoritative status of every slot.
