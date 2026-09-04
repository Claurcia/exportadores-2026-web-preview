"""Prueba la capa de movimiento en un navegador real (sin ?static): clases, errores JS, marquee, carrusel, cortina, 4xx."""
import pathlib, json
from playwright.sync_api import sync_playwright
HERE = pathlib.Path(__file__).resolve().parent; ROOT = HERE.parent
with sync_playwright() as p:
    b = p.chromium.launch()
    for vw in (1440, 390):
        ctx = b.new_context(viewport={"width": vw, "height": 900 if vw > 500 else 844}); pg = ctx.new_page()
        errs, bad = [], []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: errs.append('console:' + m.text) if m.type == 'error' else None)
        pg.on("response", lambda r: bad.append((r.status, r.url[-60:])) if r.status >= 400 else None)
        pg.goto((ROOT / "index.html").as_uri(), wait_until="load"); pg.wait_for_timeout(2600)
        info = pg.evaluate("""() => {
          const t = document.querySelector('.strip__track');
          const cs = t && getComputedStyle(t);
          const m1 = t && cs.transform; 
          return {
            htmlClass: document.documentElement.className, curtain: !!document.querySelector('.curtain'),
            gsap: !!window.gsap, lenis: !!window.Lenis, st: !!window.ScrollTrigger,
            words: document.querySelectorAll('.wi').length,
            strip: t ? {sets: t.children.length, items: t.querelectorAll ? 0 : t.querySelectorAll('a').length, anim: cs.animationName, dur: cs.animationDuration, transform: m1} : null,
            dots: document.querySelectorAll('.dots i').length, dotsOn: document.querySelector('.dots i.on') && [...document.querySelectorAll('.dots i')].indexOf(document.querySelector('.dots i.on')),
            trackScroll: document.querySelector('[data-carousel]').scrollLeft,
            heroImg: (() => { const i = document.querySelector('.hero__photo img'); const r = i.getBoundingClientRect(); return {src: i.currentSrc.split('/').pop(), w: Math.round(r.width), h: Math.round(r.height), transform: getComputedStyle(i).transform}; })(),
            h1Opacity: getComputedStyle(document.querySelector('h1 .wi')).opacity,
          }; }""")
        # transform del marquee tras 1 s (debe cambiar) y autoplay del carrusel tras 3.2 s
        pg.wait_for_timeout(1000)
        info2 = pg.evaluate("""() => ({ transform: getComputedStyle(document.querySelector('.strip__track')).transform, trackScroll: document.querySelector('[data-carousel]').scrollLeft, dotOn: [...document.querySelectorAll('.dots i')].findIndex(d => d.classList.contains('on')) })""")
        pg.wait_for_timeout(2600)
        info3 = pg.evaluate("""() => ({ trackScroll: document.querySelector('[data-carousel]').scrollLeft, dotOn: [...document.querySelectorAll('.dots i')].findIndex(d => d.classList.contains('on')) })""")
        # scroll hasta el final para disparar los reveals y comprobar que todo quedó visible
        pg.evaluate("""async () => { const h = document.documentElement.scrollHeight; for (let y = 0; y < h; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); } }""")
        pg.wait_for_timeout(1500)
        info4 = pg.evaluate("""() => { const hidden = [...document.querySelectorAll('.wi, .stage__arch, .step__photo, .pv__thumb, .prize__ring img, .sticker')].filter(e => { const cs = getComputedStyle(e); return cs.opacity < .95 || (cs.clipPath && cs.clipPath !== 'none' && !/inset\\(0(px|%)?(,? 0(px|%)?){3}\\)/.test(cs.clipPath.replace(/\\s+/g,' ')) && cs.clipPath !== 'inset(0% 0% 0% 0%)' && cs.clipPath !== 'inset(0px)'); }).slice(0, 5).map(e => e.tagName + '.' + String(e.className).split(' ')[0] + ' ' + getComputedStyle(e).opacity + ' ' + getComputedStyle(e).clipPath); return {hidden, scrollY: scrollY}; }""")
        print(vw, json.dumps(info, ensure_ascii=False)); print('  +1s', info2); print('  +3.6s', info3); print('  end', info4); print('  errores:', errs[:4], '| 4xx:', bad[:4])
        ctx.close()
    b.close()
