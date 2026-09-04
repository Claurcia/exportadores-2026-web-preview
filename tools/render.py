"""Renderiza index / galeria / inscripcion en PC (1440) y móvil (390): PNG completo, tramos para revisar,
JPG y PDF de una página. Uso: python3 render.py [index galeria inscripcion]"""
import sys, pathlib, shutil
from playwright.sync_api import sync_playwright
from PIL import Image
HERE = pathlib.Path(__file__).resolve().parent; ROOT = HERE.parent; OUT = ROOT / "out"; OUT.mkdir(exist_ok=True)
SL = OUT / "slices"; shutil.rmtree(SL, ignore_errors=True); SL.mkdir()
PAGES = [a for a in sys.argv[1:]] or ["index", "galeria", "inscripcion"]
VIEWS = {"pc": dict(viewport={"width": 1440, "height": 900}), "movil": dict(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)}
with sync_playwright() as p:
    b = p.chromium.launch()
    for page_name in PAGES:
        for name, opts in VIEWS.items():
            ctx = b.new_context(**opts); pg = ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            pg.goto((ROOT / f"{page_name}.html").as_uri() + "?static=1", wait_until="load", timeout=90000); pg.wait_for_timeout(1800)
            info = pg.evaluate("""async () => { document.documentElement.style.scrollBehavior='auto';
              const h=document.documentElement.scrollHeight, s=Math.round(innerHeight*.6);
              for (let y=0;y<h;y+=s){ scrollTo({top:y,behavior:'instant'}); await new Promise(r=>setTimeout(r,110)); }
              scrollTo({top:0,behavior:'instant'}); await new Promise(r=>setTimeout(r,300));
              const all=document.querySelectorAll('.reveal').length, inn=document.querySelectorAll('.reveal.in').length;
              document.querySelectorAll('.reveal:not(.in)').forEach(e=>e.classList.add('in'));
              const over=[...document.querySelectorAll('body *')].filter(el=>{ if(el.closest('svg')) return false; const r=el.getBoundingClientRect(); return r.width>0 && r.right>document.documentElement.clientWidth+1 && getComputedStyle(el).position!=='fixed' && !el.closest('.ticker,.polaroid,.mascota,.glow,.chips,.ranking__list,.strip,.carousel__track,.curtain'); }).slice(0,6).map(e=>e.tagName+'.'+String(e.className).split(' ')[0]);
              return {scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth, reveal: inn+'/'+all, over}; }""")
            pg.wait_for_timeout(700)
            png = OUT / f"{page_name}-{name}.png"; pg.screenshot(path=str(png), full_page=True)
            im = Image.open(png).convert("RGB"); w, h = im.size
            im.save(OUT / f"Exportadores-2026-{page_name}-{name}.jpg", quality=86, optimize=True)
            im.save(OUT / f"Exportadores-2026-{page_name}-{name}.pdf", "PDF", resolution=144, quality=86)
            step = 1300 if name == "pc" else 1500; n = 0
            for y in range(0, h, step): im.crop((0, y, w, min(h, y + step))).save(SL / f"{page_name}-{name}-{n:02d}.png"); n += 1
            print(page_name, name, (w, h), n, "tramos |", info, "| errores JS:", errs[:2]); ctx.close()
    b.close()
