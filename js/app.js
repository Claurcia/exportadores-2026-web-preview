/* Exportadores 2026 · plantilla festivent. Sin dependencias.
   Ondas SVG generadas con formas distintas por sección, reveal al hacer scroll, fechas. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const W = 2880; // dos períodos de 1440: el bucle de deriva desplaza 1440 y no se ve la costura

  /* ---------- Generador de ondas ----------
     shape: suave (senoidal), cresta (asimétrica, cae rápido), espuma (dos frecuencias), ripple (muchas crestas
     pequeñas), doble (senoidal con línea fina encima). amp = amplitud en unidades del viewBox (140 de alto). */
  function sine(base, amp, crests, skew = 0) {
    const L = 1440 / crests; let d = `M0,${base}`;
    for (let x = 0; x < W; x += L) {
      const a = L * (1 / 3 + skew), b = L * (2 / 3 + skew);
      d += ` C${(x + a).toFixed(1)},${(base + amp).toFixed(1)} ${(x + b).toFixed(1)},${(base - amp).toFixed(1)} ${(x + L).toFixed(1)},${base}`;
    }
    return d + ` L${W},400 L0,400 Z`;
  }
  function line(base, amp, crests) { // misma curva sin cierre: se usa como trazo
    return sine(base, amp, crests).replace(/ L2880,400 L0,400 Z$/, '');
  }
  const SPEEDS = ['drift drift--3', 'drift drift--2', 'drift'];
  const layer = (cls, dy, fill, d, extra = '') => `<g transform="translate(0,${dy})"><g class="${cls}" fill="${fill}" ${extra}><path d="${d}"/></g></g>`;

  function buildWave(w) {
    const shape = w.dataset.shape || 'suave';
    const to = w.dataset.to, from = w.dataset.from || 'transparent';
    const layers = (w.dataset.layers || '#DCEFFB,#5FB3E8,#0D3B8E').split(',').map(s => s.trim());
    const amp = Number(w.dataset.amp || (shape === 'cresta' ? 46 : shape === 'ripple' ? 10 : 24));
    const crests = Number(w.dataset.crests || (shape === 'ripple' ? 6 : shape === 'espuma' ? 3 : 2));
    const step = Number(w.dataset.step || Math.max(18, Math.round(amp * .9)));
    let g = '';
    if (shape === 'espuma') {
      // capas con frecuencias distintas: la espuma nace del cruce
      g += layer(SPEEDS[0], 0, layers[0], sine(30, amp, 2));
      g += layer(SPEEDS[1], step, layers[1], sine(30, amp * .8, 3));
      g += layer(SPEEDS[2], step * 2, layers[2] || layers[1], sine(30, amp * .6, 5));
      g += layer('drift drift--2', step * 2 + 20, to, sine(30, amp * .5, 3));
    } else if (shape === 'doble') {
      g += layer(SPEEDS[1], 0, layers[0], sine(30, amp, crests));
      g += `<g transform="translate(0,${step})"><g class="drift" fill="none" stroke="${layers[1]}" stroke-width="3" stroke-linecap="round"><path d="${line(30, amp, crests)}"/></g></g>`;
      g += layer('drift', step + 14, to, sine(30, amp, crests));
    } else {
      const skew = shape === 'cresta' ? -0.14 : 0;
      layers.forEach((c, k) => { g += layer(SPEEDS[k % 3], k * step, c, sine(30, amp - k * (amp / 6), crests, skew)); });
      g += layer('drift drift--2', layers.length * step, to, sine(30, amp * .7, crests, skew));
    }
    w.style.background = from; w.setAttribute('aria-hidden', 'true');
    w.innerHTML = `<svg viewBox="0 0 1440 140" preserveAspectRatio="none" focusable="false">${g}</svg>`;
  }

  // Fondos de ondas grandes y translúcidas (cabecera, pasos, síguelo) — sin recortar la sección
  function buildWaveBg(el) {
    const cols = (el.dataset.wavebg || '#DCEFFB,#5FB3E8').split(',').map(s => s.trim());
    const H = Number(el.dataset.h || 300), amp = Number(el.dataset.amp || 34);
    const path = (y, a, c) => sine(y, a, c).replace(/ L2880,400 L0,400 Z$/, ` L${W},${H + 400} L0,${H + 400} Z`);
    el.innerHTML = `<svg viewBox="0 0 1440 ${H}" preserveAspectRatio="none" focusable="false" aria-hidden="true">
      <g class="drift drift--3" fill="${cols[0]}" opacity=".6"><path d="${path(H * .5, amp, 2)}"/></g>
      <g class="drift drift--2" fill="${cols[1]}" opacity=".35"><path d="${path(H * .66, amp * .8, 3)}"/></g>
      <g class="drift" fill="${cols[0]}" opacity=".7"><path d="${path(H * .82, amp * .6, 2)}"/></g>${bottom()}</svg>`;
    // data-wavebg-bottom="#c1,#c2,#c3": capas opacas escalonadas en el tramo inferior (desde data-bottom, fracción de la altura)
    function bottom() {
      const cols = (el.dataset.wavebgBottom || '').split(',').map(s => s.trim()).filter(Boolean); if (!cols.length) return '';
      const b0 = Number(el.dataset.bottom || .74), n = cols.length;
      return cols.map((c, i) => `<g class="drift${i % 2 ? ' drift--2' : ''}" fill="${c}"><path d="${path(H * (b0 + (1 - b0) * i / n), amp * (.7 - i * .15), 2 + i % 2)}"/></g>`).join('');
    }
  }

  function initWaves() { $$('.wave[data-to]').forEach(buildWave); $$('[data-wavebg]').forEach(buildWaveBg); }

  function initReveal() {
    const els = $$('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(e => io.observe(e));
  }
  function initDates() {
    const fin = new Date('2026-10-11T23:59:59-05:00');
    const d = Math.max(0, Math.floor((fin - Date.now()) / 86400000));
    $$('[data-days-left]').forEach(el => el.textContent = d);
  }
  function initPending() {
    $$('a[data-pending]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); a.classList.add('is-shake'); setTimeout(() => a.classList.remove('is-shake'), 500); }));
  }
  function initNav() {
    const page = document.body.dataset.page;
    $$('[data-nav]').forEach(a => a.classList.toggle('is-active', a.dataset.nav === page));
  }
  document.addEventListener('DOMContentLoaded', () => { initWaves(); initReveal(); initDates(); initPending(); initNav(); });
})();
