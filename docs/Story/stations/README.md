# Station Cards (order-free)

Under Gamewright's station/slot model, play is order-free. A **station** holds what belongs to its place: the woman, the facts, the puzzle, a backup spot, an inbound clue, the beat overlays, and its art. A **slot** holds what belongs to play order: beat, vault fragment, difficulty, and bird degree. Only **Prologue** and **Final Frame** are fixed slots. The Vault gallery collects the women in the order Christine meets them. The finale shows them in that order, with Christine's frame last.

Beats and fragments come from [Story_Spine.md](../Story_Spine.md): 1 Attention, 2 Courage, 3 Risk, 4 Being seen, 5 Loss, 6 Love anyway. Fragment texts belong to slots and are unchanged. **Fragment 6's private line is still a placeholder for Bob:** `[HOOK: BOB WRITES THIS LINE. Do not sign it.]` No station card fills it.

Start from [STATION-CARD-TEMPLATE.md](STATION-CARD-TEMPLATE.md).

| Card | Woman | Tier | Suggested puzzle | Status |
|---|---|---|---|---|
| [kellogg.md](kellogg.md) | Dr. Carrie Staines Kellogg (proposed) | Local | FindByGps, MultipleChoice, AlignBearing | Locked content, woman proposed |
| [aic.md](aic.md) | Bertha Palmer | Planned trip | FindByText, MultipleChoice | Locked content |
| [ladies-library.md](ladies-library.md) | Lucinda Hinsdale Stone | Local | PassphraseEntry (Webster window) | Candidate |
| [cranbrook.md](cranbrook.md) | Ellen Scripps Booth | Michigan day trip | PassphraseEntry or MultipleChoice | Candidate |
| [mountain-home-cemetery.md](mountain-home-cemetery.md) | Lucinda Hinsdale Stone (or Caroline Bartlett Crane) | Local | FindByGps, AlignBearing, FindByText | Candidate |
| [kia.md](kia.md) | Anna Louise Raymond | Local | PassphraseEntry (Thursday) | Candidate |
| [crystal-bridges.md](crystal-bridges.md) | Alice Walton (with Cassatt's *The Reader*) | Planned trip (AR) | FindByText, MultipleChoice; backup PassphraseEntry "52" | Candidate (old stop) |
| [meijer-gardens.md](meijer-gardens.md) | Lena Meijer | Michigan day trip | FindByGps, AlignBearing (windmill), MultipleChoice | Candidate (old stop) |
| [shedd.md](shedd.md) | Helen Shedd Keith (proposed, thin) or Bridget Coughlin | Planned trip (Chicago) | FindByGps, MultipleChoice | Candidate, not dealable until Helen Shedd Keith is confirmed |

### Candidates without a card
- **Edsel & Eleanor Ford House**, Grosse Pointe Shores: Eleanor Clay Ford (1896-1976). Named in the Oct 15 2026 research pass, whose notes file was never added to the repo, so it has no source on file. Find sources before writing a card.
- Sleeping Bear Dunes: an old stop with no real woman identified. No card.

## Assumptions
- Beat names, fragments, and bird degrees come from `Story_Spine.md` and `Chapter_Map.md`. Each card has a base paragraph plus an overlay for beats 1 through 5. Beat 6 belongs to the Final Frame, a fixed slot at the Kellogg gazebo (reached by boat) that is never dealt, so stations write nothing for it.
- Puzzle content for Kellogg and AIC is reused from `website/src/config/config.ts` (`ch1`, `ch2`), with slot ties and the 255 degree bearing removed.
- The new model needs a woman at every station. Kellogg's canon figure is W. K. Kellogg, so Carrie Staines Kellogg is proposed (web-sourced).
- Cards live in `docs/Story/stations/` to match the repo's existing `docs/Story` casing.
- **Next-stop pointers** are added by the slot at play time, never by a station or a Vault key (Gamewright ruling #3). No card contains one. An AlignBearing inside a station (such as the Kellogg windmill backup) is only a local find.
- **Dealing rule:** a deal must not pick a station whose woman is unconfirmed. Today that blocks `shedd.md` (Helen Shedd Keith not confirmed), and Kellogg until Bob confirms Carrie Staines Kellogg (open question 2).
- **Companion messages** stay at slot level and never go on cards (Gamewright ruling #8).
- `Chapter_Map.md` and `config.ts` are not changed. They still describe the old fixed-chapter model.

## Open questions for Bob
1. **Christine's include/exclude list.** Which places should never be used (for example, KIA, where she is a docent, or a cemetery)? Which places should she not see coming?
2. **Kellogg woman.** Is Carrie Staines Kellogg right? Or should W. K. Kellogg stay as the figure even though he breaks the "chain of women"?
3. ~~**The 255 degree bearing.**~~ **Closed (Gamewright #3):** removed from the Kellogg and AIC cards. Pointers belong to the slot at play time.
4. **Stone duplicate.** She anchors both Ladies' Library and Mountain Home. Should the cemetery use Caroline Bartlett Crane, or should Stone get one portrait and two stations?
5. ~~**Which station hosts the Final Frame?**~~ **Closed (Bob's decision 8, `station-slot-design.md`):** no station hosts it. The Final Frame is a fixed slot at the Kellogg gazebo, reached by boat, and is never dealt.
6. **Supporting women** (Cassatt, Wood, Hull, Walton). Do they get gallery portraits or only caption mentions?
7. **Fragment 6 private line.** Only Bob can write it.
8. ~~**Companion messages.**~~ **Closed (Gamewright #8):** they stay at slot level, not on cards.
9. **Living women** (Alice Walton, Bridget Coughlin). Should real living people be gallery portraits, and how do we handle images and permission? Should the Walton family tragedies from the old lore stay out?
10. **Shedd's woman.** Helen Shedd Keith, Coughlin, or drop Shedd?
11. **Lena Meijer's dementia** (from repo notes, not sourced to a URL). Leave it out?

## Source gaps (do not use in player copy until confirmed)
- Ruth Webster window: wording and location (LLA).
- Stone plot location (Section E, Lot 176 comes from a search summary) and Mountain Home gate hours.
- AlignBearing angles at Kellogg's windmill backup and Mountain Home. Measure on site.
- Dates for Anna Louise Raymond, Kathryn Wood, Blanche Hull, Caroline Bartlett Crane, and Bertha Palmer's birth year.
- Which KIA Cassatt prints are on view. Any KIA donor wall naming Raymond.
- Any on-site plaque at Cranbrook showing 1 June 1908.
- Whether today's Kellogg sundial is the one from the rose garden.
- Licensable portraits for every gallery woman.
- AIC: no fallback if the Zorn portrait is off display.
- Carrie Staines Kellogg facts come from search summaries (MSU, KBS, Adventist encyclopedia, Find a Grave). Load the pages to confirm.
- Crystal Bridges: *The Reader* has been listed "Not on view". Is the spring's 52 F posted on site? Facts come from repo research notes with no URLs, so re-check them.
- Meijer: which Degas bronze is on view and where; the windmill bearing; Lena Meijer portrait licensing.
- Shedd: Helen Shedd Keith's dates and relation to the Shedd family; opening date conflict (May 30 1930 vs Dec 1929, not used); street address; any plaque. Facts come from search summaries.
