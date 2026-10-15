# Art Direction — The Order of the Gilt Frame

Owner: Illusionist (visuals). Code changes belong to Wright, so this folder holds only docs and mocks.

| File | What it is |
|---|---|
| [visual-audit.md](visual-audit.md) | What exists, what is missing for release, and leftover starter files |
| [art-direction.md](art-direction.md) | The look and voice of the Order: type, palette, frames, materials, motion, share cards, and `@theme` tokens |
| [per-stop-asset-kit.md](per-stop-asset-kit.md) | A checklist and prompt template for each stop, keyed to Gamewright's **Gilt-Frame Chapter Kit** |
| [mocks/](mocks/) | Static HTML sources, `render.py` (Playwright), and the rendered PNGs |

To re-render the mocks: `pip install playwright && playwright install chromium && python mocks/render.py`. `render.py` fetches the SIL OFL 1.1 fonts (Cormorant Garamond and EB Garamond) from google/fonts into `mocks/fonts/` on first run. That folder is gitignored.

Upstream sources: `docs/UI/Tone_North_Star.md` and `docs/UI/Visual_Language_Decisions.md`, plus `docs/Story/*`. These live on the local branch `docs/ui-visual-decisions` and were **not on `origin/main` when this was written (2026-10-15)**. This direction follows the decisions in those files: Candlelight is the Gallery surface, Museum Placard is the Field surface, and the type is a Garamond pair.
