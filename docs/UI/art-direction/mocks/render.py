from playwright.sync_api import sync_playwright
import pathlib
d=pathlib.Path(__file__).parent.resolve()
# Fonts: SIL OFL 1.1, fetched from google/fonts on first run (not committed)
import urllib.request
F=d/"fonts";F.mkdir(exist_ok=True)
for local,remote in {"CormorantGaramondwght.ttf":"cormorantgaramond/CormorantGaramond%5Bwght%5D.ttf","CormorantGaramond-Italicwght.ttf":"cormorantgaramond/CormorantGaramond-Italic%5Bwght%5D.ttf","EBGaramondwght.ttf":"ebgaramond/EBGaramond%5Bwght%5D.ttf","EBGaramond-Italicwght.ttf":"ebgaramond/EBGaramond-Italic%5Bwght%5D.ttf"}.items():
    if not (F/local).exists(): urllib.request.urlretrieve("https://github.com/google/fonts/raw/main/ofl/"+remote,F/local)
jobs=[("vault-reveal.html#1","vault-frame-1.png",1170,2532),("vault-reveal.html#2","vault-frame-2.png",1170,2532),("vault-reveal.html#3","vault-frame-3.png",1170,2532),("waiting.html","waiting-screen.png",1170,2532),("og-card.html","moment-og-card.png",1200,630)]
with sync_playwright() as p:
    b=p.chromium.launch()
    for src,out,w,h in jobs:
        pg=b.new_page(viewport={"width":w,"height":h})
        pg.goto(f"file://{d}/{src}");pg.wait_for_timeout(600)
        pg.evaluate("document.fonts.ready");pg.screenshot(path=str(d/out));pg.close()
    b.close()
