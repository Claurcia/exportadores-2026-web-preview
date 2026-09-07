"""Estampa una versión (?v=AAAAMMDD-HHMM) en todos los archivos locales que enlazan las páginas HTML
(css, js e imágenes en href/src/srcset) y en <meta name="version">. Así cada publicación cambia las URLs
y el cliente nunca ve una versión cacheada. Lo ejecuta el hook pre-commit (tools/install-hook.sh);
también se puede correr a mano: python tools/version.py [version]"""
import re, sys, pathlib, datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGES = ["index.html", "galeria.html", "inscripcion.html"]
VERSION = sys.argv[1] if len(sys.argv) > 1 else datetime.datetime.now().strftime("%Y%m%d-%H%M")
LOCAL = re.compile(r'((?:href|src)=")((?:css|js|assets)/[^"?#]+)(?:\?v=[^"#]*)?("|#)')
SRCSET = re.compile(r'(srcset=")([^"]+)(")')

def stamp_srcset(m):
    parts = []
    for cand in m.group(2).split(","):
        cand = cand.strip()
        if not cand: continue
        bits = cand.split()
        url = bits[0].split("?v=")[0]
        if url.startswith(("css/", "js/", "assets/")): url += f"?v={VERSION}"
        parts.append(" ".join([url] + bits[1:]))
    return m.group(1) + ", ".join(parts) + m.group(3)

changed = []
for name in PAGES:
    p = ROOT / name; s = p.read_text(encoding="utf-8")
    n = LOCAL.sub(lambda m: f'{m.group(1)}{m.group(2)}?v={VERSION}{m.group(3)}', s)
    n = SRCSET.sub(stamp_srcset, n)
    meta = f'<meta name="version" content="{VERSION}">'
    if 'name="version"' in n: n = re.sub(r'<meta name="version" content="[^"]*">', meta, n)
    else: n = n.replace('<meta name="robots"', meta + '\n' + '<meta name="robots"', 1)
    if n != s: p.write_text(n, encoding="utf-8"); changed.append(name)
print(f"versión {VERSION} · archivos actualizados: {', '.join(changed) or 'ninguno'}")
