# EXPORTADORES 2026 · Frontend

Sitio del concurso **EXPORTADORES 2026** (Perú → China). Cliente: Carlos Raffo. Organizan Cosco Shipping y
Puerto de Chancay (auspiciadores). Desarrolla Ludik. Frontend estático: HTML + CSS + JS, sin build.

Versión de referencia publicada: https://exportadores-2026-propuestas.vercel.app/home (estado del 4 set 2026).

## Estructura

```
index.html            Home
galeria.html          Videos y votación (demo en el navegador)
inscripcion.html      Ficha de inscripción (demo en el navegador)
css/styles.css        Estilos del sitio (tokens, componentes, ondas, movimiento)
css/pages.css         Componentes de galería e inscripción
js/app.js             Motor de ondas SVG, reveal, contador de días, navegación
js/motion.js          Capa de movimiento (GSAP + ScrollTrigger desde CDN)
js/shared/app.js      Lógica demo: buscador, filtros, voto con código, ranking, formulario
js/shared/data.js     Datos ficticios: fechas, regiones, categorías, 16 participantes
assets/cliente/       Fotos y logos del cliente (tal cual; portada escalada y ensanchada con IA)
assets/gen/           Imágenes generadas con IA (webp) + manifest.json con prompt y modelo
assets/src/           Mascotas recortadas
tools/render.py       Renderiza PC (1440) y móvil (390) a JPG/PDF y tramos → out/
tools/motion_test.py  Prueba la capa de movimiento en navegador real
vercel.json           Config de hosting (redirige /home → /, cabecera noindex)
```

## Cómo trabajar

**Ver**: abrir `index.html` en el navegador (rutas relativas, no necesita servidor) o
`python3 -m http.server 8000` en la raíz → http://localhost:8000/.

**Requisitos para las herramientas**: Python 3.10+, `pip install playwright pillow`, `playwright install chromium`.

```
python3 tools/render.py                 # las 3 páginas, PC y móvil → out/
python3 tools/render.py index           # una sola
python3 tools/motion_test.py            # animaciones: clases, marquee, carrusel, errores JS
```

**Caché**: `tools/version.py` estampa `?v=AAAAMMDD-HHMMSS` en todos los css/js/imágenes que enlazan las páginas (y en
`<meta name="version">`); lo corre solo el hook pre-commit (instalar una vez por clon con `sh tools/install-hook.sh`).
Al compartir un link tras publicar, agregar la misma versión: `…/?v=AAAAMMDD-HHMMSS`, y el cliente nunca ve caché.

`?static=1` en la URL apaga las animaciones (lo usa `render.py`). Probar siempre en 390, 1440 y ≥1800 px.

**Publicar**: conectar el repo a Vercel (o cualquier hosting estático) con la raíz del repo como salida.
Las rutas son relativas, así que también funciona bajo un subdirectorio (GitHub Pages). Antes del
lanzamiento público quitar la cabecera `X-Robots-Tag: noindex` de `vercel.json`.

**Assets**: nuevas imágenes van en `assets/{cliente|gen|src}`. Si una ruta va en `srcset`, sin espacios ni
caracteres sin codificar: el navegador descarta la fuente en silencio.

## Reglas del cliente (no se cambian sin Carlos)

1. Fotos y logos del cliente tal cual (se pueden escalar o extender con IA, nunca alterar caras ni logos).
2. **EXPORTADORES 2026** siempre en mayúsculas al mencionar el concurso.
3. Frase de piso del hero: «**Tú también puedes exportar**»; «de Chancay a Shanghái» debajo, menor.
4. Fechas de inscripción en bloque rojo con letras blancas a los pies de la familia, no junto al titular.
5. El titular nunca tapa las caras.
6. **Un solo premio**: el viaje a China para los tres primeros puestos (CIIE 2026 + APEC 2026).
7. Nada que parezca página del Puerto de Chancay: es auspiciador.
8. Orden del home: hero → bienvenida (barco + texto corto + 4 pasos) → las 2 etapas (fondo azul oscuro,
   letras claras, burbuja celeste) → participantes → bases → premio → síguelo → footer.
9. Sin acordeones, sin cinta marquee de texto, sin arcos: tarjetas modernas con foto a sangre, número grande,
   chips y bloques de color. Evitar bloques blancos con solo texto y evitar que todo baje en blanco y celeste.
10. Ondas celeste/azul exageradas, superpuestas a los bordes de la foto del hero.
11. Una sola tipografía, **Nunito**; titulares en mayúscula inicial; mayúsculas solo en etiquetas cortas.
12. El rojo es obligatorio en CTA y acentos; nunca como fondo de párrafos largos.
13. Cronograma vigente: inscripciones 14 set – 11 oct, votación 14 set – 18 oct, Gran Final 23 oct en el
    Hotel Los Delfines, Lima.

## Sistema de diseño

**Tokens** (`:root` en `css/styles.css`): azul `#0D3B8E`, azul oscuro `#082A6B`, azul medio `#1C4FB0`,
rojo `#D9262E`, celeste `#5FB3E8`, celestes claros `#DCEFFB` `#EAF5FD` `#C7E6F8`, tinta `#0B1C3A`,
gris `#4A5A73`. Radio base 20 px. Breakpoints: 560, 700, 900, 1024, 1180.

**Ondas** (`js/app.js`, sin imágenes):

- Divisor: `<div class="wave" data-shape="suave|cresta|espuma|ripple|doble" data-amp="…" data-from="#color|transparent" data-to="#color" data-layers="#c1,#c2,#c3">`. `wave--lg` / `wave--xl` cambian la altura.
- Sobre la foto del hero: `.wave--over.wave--top` (invertida) y `.wave--over.wave--bottom`, absolutas dentro de `.hero__photo`.
- Fondo de sección: `<div data-wavebg="#c1,#c2" data-h="…" data-amp="…" [data-wavebg-bottom="#c3" data-bottom=".7"]>`.

**Movimiento** (`js/motion.js`): cortina de carga, titulares por palabras (respeta `<b>`/`<em>`), revelado
`clip-path` en fotos, parallax suave, contador, carrusel con autoplay y vuelta al inicio, tira de fotos en
marquee. Scroll nativo (Lenis se descartó). Con `prefers-reduced-motion` o `?static=1` no anima.

**Componentes**: `.pill`, `.sticker`, `.tagc`, `.hero__tag`, `.bienvenida` + `.steps`/`.step`, `.etapa`,
`.carousel` + `.pv`, `.bgrid` + `.bcard`, `.premio`, `.strip`, `.footer__card`.

## Qué es demo y qué falta

- Votación e inscripción funcionan solo en el navegador (`localStorage`). `js/shared/app.js` es el punto para
  reemplazar por llamadas a una API: inscripción (formulario → base de datos, validación del enlace de YouTube),
  moderación (≤ 48 h), voto con identidad verificada (código de un solo uso), ranking en vivo.
- Textos: borrador a partir de las notas de Carlos; él envía los definitivos.
- Fotos de los 4 pasos y de las etapas: generadas con IA, provisionales hasta recibir las suyas.
- PDF de bases (botón con `data-pending`), páginas de Privacidad y Términos, logos en vector, Open Graph, analítica.

## Imágenes con IA

Generadas en Higgsfield: `gpt_image_2` (escenas y fotos «de participante»), `flux_2_pro_outpaint` (extender
encuadres: la portada vertical se ensanchó a los lados para PC), `bytedance_image_upscale` (2K).
`assets/gen/manifest.json` guarda prompt y modelo. Regla: sin texto dentro de las imágenes.
