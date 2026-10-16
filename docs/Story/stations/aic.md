# Station: Art Institute of Chicago

**Status:** Locked (puzzle content in `config.ts` `ch2`; this card strips slot ties)
**Travel tier:** Planned trip (Chicago)
**Address & GPS:** 111 S. Michigan Ave, Chicago. Zorn portrait in Gallery 273 per current config [confirm on run date].

## The woman
**Name, dates:** Bertha Honoré Palmer (d. 1918) [1]. Birth year not in repo [UNVERIFIED].
**Order title (fiction):** "The Patron."
**Real fact(s) used in play:**
- President of the Board of Lady Managers, 1893 World's Fair; used the role to commission and champion women artists [1].
- Commissioned Mary Cassatt's *Modern Woman* mural for the Woman's Building [1].
- Shaped the Art Institute's Impressionist holdings [1].
- Anders Zorn painted her full-length portrait (1893), which hangs at the Art Institute [1][2].
- Supporting: Mary Cassatt, *The Child's Bath* (bird's-eye perspective, Japanese woodblock influence) [2]; Monet, *The Cliff Walk at Pourville* (1882), X-ray shows a removed third figure [1].
**Link type:** True link.

## Puzzle
**Suggested type:** FindByText (find the portrait: "Mrs. Potter Palmer, Anders Zorn") -> MultipleChoice (observation: "An ivory gavel"; where painted: "Chicago") -> FindByText (Cassatt, *The Child's Bath*) -> MultipleChoice ("From above, looking down"; "Japanese woodblock prints") -> RevealNarrative. All authored in `config.ts`.
**Order-free change:** the "Chicago" question in `config.ts` cites the 255 degree bearing. Remove that reference (Gamewright ruling #3) and reword to stand alone: "The inscription names the city where she was painted. Name it."
**Difficulty knobs:** hint text naming the gallery number; distractor count.

## Backup spot
Cassatt: *On a Balcony* if *The Child's Bath* is off view (already noted in config). Zorn portrait: **no fallback defined** (open item carried from Location_Person_Card_Template).

## Inbound clue
"A woman once held a gavel over a city of white palaces. Her likeness still stands in the palace of art beside the lake, guarded by two lions. Go and find her face."

## Narrative
- **Base:** She stands in a gallery most visitors cross in a minute. She chose which painters a whole country would learn to love, and she chose women when no one else would. She is waiting for you to look up.
- **Beat 1 Attention:** Thousands pass her every day. They see a fine dress and a famous name. You saw the gavel in her hand. That is the whole of it, Sparrow. You look until the thing gives way.
- **Beat 2 Courage:** In 1893 she stood before a room of powerful men and asked for walls for women's work. It cost her. She asked anyway. To see clearly is not a comfort. It asks something of you, and she paid it.
- **Beat 3 Risk:** She gave her eye to this building and the building kept her collection. She did not keep herself. The Order lost her in 1918. Everything we love fully, we agree to lose.
- **Beat 4 Being seen:** Zorn painted her as she was, not as she posed. To be seen like that is rare. Somewhere in this building, someone once stood where you stand and saw her. We have been watching you the same way.
- **Beat 5 Loss:** The mural she commissioned is gone. No one knows where. Her portrait remains, and the women whose work she hung are still on these walls. Nothing that matters is permanent. That is why it matters.
- **Final Frame setting line:** The Zorn portrait, the gallery nearly empty, her gavel catching the light.

## Art
- **Station still:** Grand staircase or the lions at the Michigan Avenue entrance at dusk, gilt frame. Avoid showing the portrait itself (the reveal is the find).
- **Share card:** A hand-drawn ivory gavel on deep green, no names. Caption space: "The Patron has been found at {place}."
- **Gallery portrait:** A crop of Zorn's *Mrs. Potter Palmer* (1893) [check AIC image licensing; AIC publishes many public-domain images, confirm for this work, UNVERIFIED]. Caption: "The Patron. Bertha Palmer."

## Sources
1. Repo: `docs/Story/Foundation_Bible.md` (historical spine, cast table).
2. Repo: `website/src/config/config.ts` `ch2`; `docs/Story/archive/chapters/chapter-2-gallery-of-whispers/ch2-research-notes.md`.

## Open items
- Zorn fallback if off display.
- Bertha Palmer's birth year (for the gallery caption) needs a source.
- AIC open-access status of the Zorn image.
- Companion messages stay at slot level, not on cards (Gamewright ruling #8).
