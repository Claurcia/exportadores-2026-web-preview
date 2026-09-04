/* Capa de movimiento · referencia festivent.ca (extraída de su mainJs.js):
   - Scroll nativo (Lenis descartado el 4 set: se sentía pesado).
   - GSAP + ScrollTrigger: textos que entran por líneas (yPercent 100→0, stagger .06, expo.out),
     imágenes que se revelan con clip-path, parallax de la foto del hero (velocidad 2, hacia abajo).
   - Marquee continuo (tira de fotos) y carrusel con autoplay cada 3 s (Flickity: autoPlay 3000, wrapAround).
   - Cortina de carga breve con la marca.
   Todo degrada: sin GSAP queda el reveal CSS; con ?static=1 o prefers-reduced-motion no se anima. */
(function () {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || /static=1/.test(location.search);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // ---------- Cortina de entrada ----------
  function curtain() {
    const c = $('.curtain'); if (!c) return;
    if (reduce || sessionStorage.getItem('curtain')) { c.remove(); return; }
    sessionStorage.setItem('curtain', '1');
    document.documentElement.classList.add('is-loading');
    const done = () => { c.classList.add('is-done'); document.documentElement.classList.remove('is-loading'); setTimeout(() => c.remove(), 900); };
    if (document.readyState === 'complete') setTimeout(done, 500); else { window.addEventListener('load', () => setTimeout(done, 300), { once: true }); setTimeout(done, 2200); }
  }

  // ---------- Partir titulares en palabras (para animarlas por línea) ----------
  // Recorre solo los nodos de texto: conserva <b>, <em>, <small> y los spans de línea del titular.
  function splitWords(el) {
    if (el.dataset.split) return;
    el.dataset.split = '1';
    (function walk(node) {
      Array.from(node.childNodes).forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(w => {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
            const o = document.createElement('span'); o.className = 'w';
            const i = document.createElement('span'); i.className = 'wi'; i.textContent = w;
            o.appendChild(i); frag.appendChild(o);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.classList.contains('w')) walk(n);
      });
    })(el);
  }

  function motion() {
    if (reduce || !window.gsap || !window.ScrollTrigger) { document.documentElement.classList.add('no-motion'); return; }
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add('has-motion');

    // Scroll nativo a propósito: el smooth-scroll secuestrado (Lenis) se sentía pesado y choca con scroll-behavior: smooth del CSS.

    // Titulares por palabras
    $$('h1, h2, .footer__quote').forEach(splitWords);
    $$('h1, h2, .footer__quote').forEach(el => {
      gsap.fromTo(el.querySelectorAll('.wi'), { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .9, ease: 'expo.out', stagger: .06, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });

    // Imágenes: revelado con clip-path desde abajo (como festivent)
    $$('.etapa__photo, .step__photo, .pv__thumb').forEach(el => {
      gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power4.out', onComplete: () => gsap.set(el, { clearProps: 'clipPath' }), scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
    // anillos del premio: aparecen creciendo (sin clip-path, que recortaba el anillo de color)
    $$('.prize__ring').forEach(el => {
      gsap.fromTo(el, { scale: .72, opacity: 0 }, { scale: 1, opacity: 1, duration: .9, ease: 'back.out(1.6)', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });

    // Stickers: aparecen girando
    $$('.sticker').forEach(el => {
      const rot = getComputedStyle(el).getPropertyValue('--rot') || '-3deg';
      gsap.fromTo(el, { scale: .6, opacity: 0, rotate: parseFloat(rot) * 3 }, { scale: 1, opacity: 1, rotate: parseFloat(rot), duration: .7, ease: 'back.out(2)', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
    });

    // Parallax del hero (velocidad 2, hacia abajo) y de las bandas de foto
    const heroImg = $('.hero__photo img');
    if (heroImg) gsap.fromTo(heroImg, { scale: 1.04, yPercent: 0, transformOrigin: '50% 100%' }, { scale: 1.04, yPercent: 3.5, ease: 'none', scrollTrigger: { trigger: '.hero__photo', start: 'top 20%', end: 'bottom top', scrub: true } });
    const mundoImg = $('.bienvenida__photo img');
    if (mundoImg) gsap.fromTo(mundoImg, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.bienvenida__photo', start: 'top bottom', end: 'bottom top', scrub: true } });

    // Las ondas de fondo se desplazan a distinta velocidad que el contenido
    $$('[data-wavebg] svg').forEach((svg, i) => {
      gsap.fromTo(svg, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: svg.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // Contador de días
    $$('[data-days-left]').forEach(el => {
      const end = Number(el.textContent) || 0; const o = { v: 0 };
      gsap.to(o, { v: end, duration: 1.4, ease: 'power2.out', onUpdate: () => el.textContent = Math.round(o.v), scrollTrigger: { trigger: el, start: 'top 95%', once: true } });
    });
  }

  // ---------- Carrusel con autoplay (vista previa de videos) ----------
  // Como Flickity (autoPlay, wrapAround): avanza una tarjeta cada 4 s y al llegar al final vuelve al inicio.
  // Los puntos representan las POSICIONES alcanzables (tarjetas − visibles + 1), no las tarjetas: así nunca
  // quedan puntos sin efecto ni tarjetas cortadas en reposo. El usuario que interactúa apaga el autoplay.
  function carousel() {
    const track = $('[data-carousel]'); if (!track) return;
    const items = $$('.pv', track); if (items.length < 2) return;
    const wrap = track.parentElement, dots = $('.dots', wrap);
    let i = 0, timer = null, positions = 1, step = 1;
    const measure = () => {
      const gap = parseFloat(getComputedStyle(track).gap) || 16;
      step = items[0].offsetWidth + gap;
      const per = Math.max(1, Math.round((track.clientWidth + gap) / step));
      positions = Math.max(1, items.length - per + 1);
      if (dots) dots.innerHTML = Array.from({ length: positions }, (_, k) => `<i${k === i ? ' class="on"' : ''}></i>`).join('');
      if (dots) $$('i', dots).forEach((d, k) => d.addEventListener('click', () => { go(k); stop(); }));
    };
    const paint = () => $$('i', dots || wrap).forEach((d, k) => d.classList.toggle('on', k === i));
    const go = (n) => { i = (n + positions) % positions; track.scrollTo({ left: Math.round(i * step), behavior: reduce ? 'auto' : 'smooth' }); paint(); };
    // el scroll manual (dedo, trackpad) también actualiza el punto activo
    let raf; track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const k = Math.round(track.scrollLeft / step); if (k !== i && k >= 0 && k < positions) { i = k; paint(); } }); }, { passive: true });
    $$('[data-prev]', wrap).forEach(b => b.addEventListener('click', () => { go(i - 1); stop(); }));
    $$('[data-next]', wrap).forEach(b => b.addEventListener('click', () => { go(i + 1); stop(); }));
    const start = () => { if (reduce || timer) return; timer = setInterval(() => { if (document.hidden) return; go(i + 1); }, 4000); };
    const stop = () => { clearInterval(timer); timer = null; stopped = true; };
    let stopped = false;
    track.addEventListener('pointerenter', () => { clearInterval(timer); timer = null; });
    track.addEventListener('pointerleave', () => { if (!stopped) start(); });
    track.addEventListener('touchstart', stop, { passive: true });
    window.addEventListener('resize', () => { measure(); go(Math.min(i, positions - 1)); });
    measure(); start();
  }

  // ---------- Marquee de fotos: duplica el contenido para el bucle ----------
  function marquee() {
    $$('.strip').forEach(s => { if (reduce) return; const set = s.innerHTML; s.innerHTML = `<div class="strip__track"><div class="strip__set">${set}</div><div class="strip__set" aria-hidden="true">${set}</div></div>`; s.classList.add('is-marquee'); });
  }

  curtain();
  document.addEventListener('DOMContentLoaded', () => { marquee(); carousel(); motion(); });
})();
