/* ============================================================
   app.js — lógica compartida por las 3 propuestas (sin build).
   Cada propuesta aporta su HTML (plantillas <template>) y su CSS.
   Requiere: shared/data.js cargado antes (window.EXPO).
   ============================================================ */
(function () {
  'use strict';
  const D = window.EXPO || { participantes: [], bases: [], fechas: {}, regiones: [], categorias: [] };
  const body = document.body;
  const ASSETS = body.dataset.assets || '../../assets/';
  const PAGE = body.dataset.page || 'index';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const fmt = (n) => new Intl.NumberFormat('es-PE').format(n);
  const state = {
    q: '', cat: 'Todas', region: 'Todas', sort: 'votos', page: 1, perPage: 8, shown: 0,
    votedId: Number(localStorage.getItem('expo_voted') || 0) || null,
    current: null,
    data: D.participantes.map(p => ({ ...p }))
  };

  /* ---------- Utilidades ---------- */
  function toast(msg, ms = 3200) {
    let t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); body.appendChild(t); }
    t.textContent = msg; t.classList.add('is-visible');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('is-visible'), ms);
  }
  const initials = (name) => name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  function ytId(url) {
    if (!url) return null;
    const m = String(url).trim().match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/);
    return m ? m[1] : null;
  }
  function daysUntil(iso) {
    const end = new Date(iso + 'T23:59:59-05:00');
    return Math.max(0, Math.floor((end - Date.now()) / 86400000));
  }
  const fechaLarga = (iso) => new Date(iso + 'T12:00:00-05:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'long' });

  /* ---------- Olas SVG (separadores) ---------- */
  // <div class="wave" data-from="#fff" data-to="#EEF7FD" data-layers="#DCEFFB,#0D3B8E,#D9262E"></div>
  function initWaves() {
    // Onda de amplitud ±22 (y entre 8 y 52), dos períodos en UN solo path (sin costura entre copias).
    // El desfase vertical va en un <g> envolvente estático: la animación CSS de .drift pisaría
    // un atributo transform puesto en el mismo elemento.
    const P = 'M0,30 C240,52 480,8 720,30 C960,52 1200,8 1440,30 C1680,52 1920,8 2160,30 C2400,52 2640,8 2880,30 L2880,300 L0,300 Z';
    $$('.wave[data-to]').forEach((w, i) => {
      const from = w.dataset.from || 'transparent';
      const to = w.dataset.to;
      const layers = (w.dataset.layers || '#DCEFFB,#0D3B8E,#D9262E').split(',');
      const offsets = w.dataset.offsets ? w.dataset.offsets.split(',').map(Number) : [0, 24, 46];
      const speeds = ['drift drift--3', 'drift drift--2', 'drift'];
      const layer = (cls, dy, fill) => `<g transform="translate(0,${dy})"><g class="${cls}" fill="${fill}"><path d="${P}"/></g></g>`;
      let g = '';
      layers.forEach((c, k) => { g += layer(speeds[k % 3], offsets[k] || 0, c.trim()); });
      g += layer('drift drift--2', (offsets[offsets.length - 1] || 46) + 18, to);
      w.style.background = from;
      w.setAttribute('aria-hidden', 'true');
      w.innerHTML = `<svg viewBox="0 0 1440 140" preserveAspectRatio="none" focusable="false">${g}</svg>`;
    });
  }

  /* ---------- Navegación ---------- */
  function initNav() {
    $$('[data-nav]').forEach(a => { if (a.dataset.nav === PAGE) a.classList.add('is-active'); a.setAttribute('aria-current', a.dataset.nav === PAGE ? 'page' : 'false'); });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    const els = $$('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(e => io.observe(e));
  }

  /* ---------- Fechas / cuenta regresiva ---------- */
  function initDates() {
    const f = D.fechas;
    $$('[data-date]').forEach(el => { const k = el.dataset.date; if (f[k]) el.textContent = fechaLarga(f[k]); });
    $$('[data-days-left]').forEach(el => { const k = el.dataset.daysLeft; if (f[k]) el.textContent = daysUntil(f[k]); });
    const cd = $('[data-countdown]');
    if (cd && f.inscripcionesFin) {
      const end = new Date(f.inscripcionesFin + 'T23:59:59-05:00');
      const tick = () => {
        let diff = Math.max(0, end - Date.now());
        const d = Math.floor(diff / 86400000); diff -= d * 86400000;
        const h = Math.floor(diff / 3600000); diff -= h * 3600000;
        const m = Math.floor(diff / 60000); diff -= m * 60000;
        const s = Math.floor(diff / 1000);
        const set = (k, v) => { const el = cd.querySelector(`[data-cd="${k}"]`); if (el) el.textContent = String(v).padStart(2, '0'); };
        set('d', d); set('h', h); set('m', m); set('s', s);
      };
      tick(); setInterval(tick, 1000);
    }
  }

  /* ---------- Plantillas ---------- */
  function fill(node, p, rank) {
    node.querySelectorAll('[data-f]').forEach(el => {
      const k = el.dataset.f;
      switch (k) {
        case 'thumb': el.src = ASSETS + 'gen/' + p.thumb; el.alt = `Video de ${p.producto} por ${p.titular}`; el.loading = 'lazy'; el.width = 640; el.height = 360; break;
        case 'votos': el.textContent = fmt(p.votos); break;
        case 'vistas': el.textContent = fmt(p.vistas); break;
        case 'initials': el.textContent = initials(p.titular); break;
        case 'rank': el.textContent = rank ? `#${rank}` : ''; if (!rank) el.hidden = true; break;
        default: el.textContent = p[k] ?? '';
      }
    });
    node.querySelectorAll('[data-act="play"]').forEach(b => b.addEventListener('click', () => openVideo(p)));
    node.querySelectorAll('[data-act="vote"]').forEach(b => {
      b.dataset.id = p.id;
      syncVoteBtn(b, p);
      b.addEventListener('click', () => openVote(p));
    });
    node.querySelectorAll('[data-href]').forEach(a => a.href = a.dataset.href.replace('{id}', p.id));
    return node;
  }
  function syncVoteBtn(b, p) {
    if (state.votedId === p.id) { b.textContent = 'Tu voto'; b.classList.add('btn--voted'); b.disabled = true; b.setAttribute('aria-disabled', 'true'); }
    else if (state.votedId) { b.textContent = 'Ya votaste'; b.classList.add('btn--voted'); b.disabled = true; b.setAttribute('aria-disabled', 'true'); }
    else { b.textContent = b.dataset.label || 'Votar'; b.classList.remove('btn--voted'); b.disabled = false; b.removeAttribute('aria-disabled'); }
  }
  function renderList(container, tplId, items, withRank, reveal = true) {
    const tpl = $(tplId);
    if (!tpl || !container) return;
    container.innerHTML = '';
    const frag = document.createDocumentFragment();
    items.forEach((p, i) => {
      const node = tpl.content.firstElementChild.cloneNode(true);
      fill(node, p, withRank ? i + 1 : null);
      if (reveal) { node.classList.add('reveal'); node.dataset.delay = String((i % 3) + 1); }
      frag.appendChild(node);
    });
    container.appendChild(frag);
    requestAnimationFrame(() => initReveal());
  }

  /* ---------- Destacados (home) ---------- */
  function initFeatured() {
    const c = $('[data-featured]');
    if (!c) return;
    const n = Number(c.dataset.featured) || 3;
    const top = [...state.data].sort((a, b) => b.votos - a.votos).slice(0, n);
    renderList(c, '#tpl-card', top, true);
    const total = $('[data-total-videos]'); if (total) total.textContent = state.data.length;
    const totalVotes = $('[data-total-votos]'); if (totalVotes) totalVotes.textContent = fmt(state.data.reduce((s, p) => s + p.votos, 0));
  }

  /* ---------- Galería ---------- */
  function filtered() {
    const q = state.q.trim().toLowerCase();
    let list = state.data.filter(p =>
      (state.cat === 'Todas' || p.categoria === state.cat) &&
      (state.region === 'Todas' || p.region === state.region) &&
      (!q || [p.producto, p.titular, p.region, p.categoria].join(' ').toLowerCase().includes(q))
    );
    if (state.sort === 'votos') list.sort((a, b) => b.votos - a.votos);
    else if (state.sort === 'recientes') list.sort((a, b) => b.id - a.id);
    else if (state.sort === 'az') list.sort((a, b) => a.producto.localeCompare(b.producto, 'es'));
    return list;
  }
  function renderGallery(append = false) {
    // Carrusel horizontal con scroll infinito: pinta un lote y agrega el siguiente al acercarse al final (sin paginado)
    const grid = $('[data-grid]'); if (!grid) return;
    const list = filtered();
    if (!append) { grid.innerHTML = ''; state.shown = 0; grid.scrollLeft = 0; }
    const slice = list.slice(state.shown, state.shown + state.perPage);
    const ranked = state.sort === 'votos' && state.cat === 'Todas' && state.region === 'Todas' && !state.q;
    const tpl = $('#tpl-card');
    slice.forEach((p, i) => {
      const node = tpl.content.firstElementChild.cloneNode(true);
      fill(node, p, ranked ? state.shown + i + 1 : null);
      node.classList.add('reveal'); node.dataset.delay = String((i % 3) + 1);
      grid.appendChild(node);
    });
    state.shown += slice.length;
    grid.dataset.more = state.shown < list.length ? '1' : '';
    const empty = $('[data-empty]'); if (empty) empty.hidden = list.length > 0;
    const count = $('[data-count]'); if (count) count.textContent = list.length;
    requestAnimationFrame(() => initReveal());
  }
  function renderRanking() {
    const c = $('[data-ranking]'); if (!c) return;
    const top = [...state.data].sort((a, b) => b.votos - a.votos).slice(0, 5);
    renderList(c, '#tpl-rank', top, true, false);
    const max = top[0]?.votos || 1; // barra de votos relativa al primer puesto
    [...c.children].forEach((el, i) => el.style.setProperty('--p', (top[i].votos / max).toFixed(3)));
  }
  function initGallery() {
    if (!$('[data-grid]')) return;
    // chips de categoría
    const chips = $('[data-chips]');
    if (chips) {
      ['Todas', ...D.categorias].forEach(cat => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'chip' + (cat === 'Todas' ? ' is-active' : ''); b.textContent = cat;
        b.addEventListener('click', () => { state.cat = cat; state.page = 1; $$('.chip', chips).forEach(x => x.classList.toggle('is-active', x === b)); renderGallery(); });
        chips.appendChild(b);
      });
    }
    const reg = $('[data-region]');
    if (reg) { ['Todas', ...D.regiones].forEach(r => { const o = document.createElement('option'); o.value = r; o.textContent = r === 'Todas' ? 'Región: todas' : r; reg.appendChild(o); }); reg.addEventListener('change', () => { state.region = reg.value; state.page = 1; renderGallery(); }); }
    const sort = $('[data-sort]'); if (sort) sort.addEventListener('change', () => { state.sort = sort.value; state.page = 1; renderGallery(); });
    const q = $('[data-search]');
    if (q) { let h; q.addEventListener('input', () => { clearTimeout(h); h = setTimeout(() => { state.q = q.value; state.page = 1; renderGallery(); }, 180); }); }
    const reset = $('[data-reset]'); if (reset) reset.addEventListener('click', () => { state.q = ''; state.cat = 'Todas'; state.region = 'Todas'; if (q) q.value = ''; if (reg) reg.value = 'Todas'; $$('.chip').forEach((x, i) => x.classList.toggle('is-active', i === 0)); renderGallery(); });
    const demoReset = $('[data-demo-reset]');
    if (demoReset && !/demo/.test(location.search + location.hash)) demoReset.closest('a, button').hidden = true; // visible solo con ?demo=1
    if (demoReset) demoReset.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('expo_voted'); state.votedId = null; renderRanking(); renderGallery(); toast('Modo demo: voto reiniciado.'); });
    const grid = $('[data-grid]');
    grid.addEventListener('scroll', () => { if (grid.dataset.more && grid.scrollLeft + grid.clientWidth > grid.scrollWidth - 320) renderGallery(true); }, { passive: true });
    renderRanking(); renderGallery();
    // deep link #video-ID → abrir
    const m = location.hash.match(/#video-(\d+)/);
    if (m) { const p = state.data.find(x => x.id === Number(m[1])); if (p) setTimeout(() => openVideo(p), 400); }
  }

  /* ---------- Modal de video ---------- */
  function openVideo(p) {
    const dlg = $('#modal-video'); if (!dlg) return;
    const box = $('.modal__video', dlg);
    box.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${p.yt}?autoplay=1&rel=0" title="Video de ${p.producto}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
    $('[data-f="producto"]', dlg).textContent = p.producto;
    $('[data-f="titular"]', dlg).textContent = `${p.titular} · ${p.region}`;
    const vb = $('[data-act="vote"]', dlg); if (vb) { vb.onclick = () => { dlg.close(); openVote(p); }; syncVoteBtn(vb, p); }
    dlg.showModal();
    dlg.addEventListener('close', () => { box.innerHTML = ''; }, { once: true });
  }

  /* ---------- Modal de voto verificado ---------- */
  function showStep(dlg, n) {
    $$('.vote-step', dlg).forEach(s => s.classList.toggle('is-active', s.dataset.step === String(n)));
    const first = $(`.vote-step[data-step="${n}"] input`, dlg); if (first) setTimeout(() => first.focus(), 60);
  }
  function openVote(p) {
    const dlg = $('#modal-vote'); if (!dlg) return;
    if (state.votedId) { toast(state.votedId === p.id ? 'Ya votaste por este video. Una persona, un voto.' : 'Ya usaste tu voto. Una persona, un voto.'); return; }
    state.current = p;
    $$('[data-f="producto"]', dlg).forEach(e => e.textContent = p.producto);
    $$('[data-f="titular"]', dlg).forEach(e => e.textContent = p.titular);
    $$('.otp input', dlg).forEach(i => i.value = '');
    const em = $('[data-email]', dlg); if (em) { em.value = ''; em.closest('.field')?.classList.remove('is-invalid'); }
    showStep(dlg, 1);
    dlg.showModal();
  }
  function initVote() {
    const dlg = $('#modal-vote'); if (!dlg) return;
    const google = $('[data-google]', dlg);
    if (google) google.addEventListener('click', () => { google.classList.add('is-loading'); setTimeout(() => { google.classList.remove('is-loading'); $('[data-via]', dlg).textContent = 'tu cuenta de Google'; showStep(dlg, 3); confirmVote(); }, 1100); });
    const mailBtn = $('[data-mail]', dlg); if (mailBtn) mailBtn.addEventListener('click', () => showStep(dlg, 2));
    const sendCode = $('[data-send-code]', dlg);
    if (sendCode) sendCode.addEventListener('click', () => {
      const em = $('[data-email]', dlg); const f = em.closest('.field');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value)) { f.classList.add('is-invalid'); em.focus(); return; }
      f.classList.remove('is-invalid'); sendCode.classList.add('is-loading');
      setTimeout(() => { sendCode.classList.remove('is-loading'); $('[data-email-echo]', dlg).textContent = em.value; showStep(dlg, 'otp'); }, 900);
    });
    const otp = $$('.otp input', dlg);
    otp.forEach((inp, i) => {
      inp.addEventListener('input', () => { inp.value = inp.value.replace(/\D/g, '').slice(-1); if (inp.value && otp[i + 1]) otp[i + 1].focus(); if (otp.every(x => x.value)) { $('[data-verify]', dlg).click(); } });
      inp.addEventListener('keydown', (e) => { if (e.key === 'Backspace' && !inp.value && otp[i - 1]) otp[i - 1].focus(); });
      inp.addEventListener('paste', (e) => { const t = (e.clipboardData.getData('text') || '').replace(/\D/g, ''); if (t.length >= 6) { e.preventDefault(); otp.forEach((x, k) => x.value = t[k] || ''); $('[data-verify]', dlg).click(); } });
    });
    const verify = $('[data-verify]', dlg);
    if (verify) verify.addEventListener('click', () => {
      if (!otp.every(x => x.value)) { toast('Ingresa los 6 dígitos del código.'); return; }
      verify.classList.add('is-loading');
      setTimeout(() => { verify.classList.remove('is-loading'); $('[data-via]', dlg).textContent = 'tu correo'; showStep(dlg, 3); confirmVote(); }, 900);
    });
    $$('[data-back]', dlg).forEach(b => b.addEventListener('click', () => showStep(dlg, b.dataset.back)));
    $$('[data-close]', dlg).forEach(b => b.addEventListener('click', () => dlg.close()));
    $$('[data-goto-gallery]', dlg).forEach(b => b.addEventListener('click', () => { dlg.close(); }));
  }
  function confirmVote() {
    const p = state.current; if (!p) return;
    p.votos += 1; state.votedId = p.id; localStorage.setItem('expo_voted', String(p.id));
    $$('[data-act="vote"]').forEach(b => { const q = state.data.find(x => x.id === Number(b.dataset.id)); if (q) syncVoteBtn(b, q); });
    $$(`[data-f="votos"]`).forEach(el => { const card = el.closest('[data-id]'); });
    renderRanking(); if ($('[data-grid]')) renderGallery(); else initFeatured();
    toast('¡Voto registrado! Gracias por apoyar a un exportador peruano.');
  }
  function initModals() {
    $$('dialog').forEach(dlg => {
      $$('.modal__close', dlg).forEach(b => b.addEventListener('click', () => dlg.close()));
      // Cerrar al hacer clic en el fondo: solo si el objetivo es el propio <dialog> (no un descendiente).
      // Un .click() programático llega con clientX/Y = 0 y un cálculo por coordenadas lo tomaría como "fuera".
      dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    });
  }

  /* ---------- Bases (acordeón) ---------- */
  function initBases() {
    const c = $('[data-bases]'); if (!c) return;
    c.innerHTML = D.bases.map((b, i) => `
      <details ${i === 0 ? 'open' : ''}>
        <summary><span class="n">${String(i + 1).padStart(2, '0')}</span><span>${b.t}</span>
          <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary>
        <div class="body"><p>${b.d}</p></div>
      </details>`).join('');
  }

  /* ---------- Formulario de inscripción ---------- */
  function initForm() {
    const form = $('#form-inscripcion'); if (!form) return;
    const reg = $('[data-region-select]', form);
    if (reg) D.regiones.forEach(r => { const o = document.createElement('option'); o.value = r; o.textContent = r; reg.appendChild(o); });
    const rules = {
      nombres: v => v.trim().split(/\s+/).length >= 2 || 'Escribe tus nombres y apellidos completos.',
      dni: v => /^\d{8}$/.test(v) || 'El DNI tiene 8 dígitos.',
      ruc: v => !v || /^\d{11}$/.test(v) || 'El RUC tiene 11 dígitos (opcional).',
      celular: v => /^9\d{8}$/.test(v.replace(/\s/g, '')) || 'Ingresa un celular válido de 9 dígitos.',
      correo: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Ingresa un correo válido.',
      region: v => !!v || 'Selecciona tu región.',
      producto: v => v.trim().length >= 3 || 'Escribe el nombre de tu producto.',
      categoria: v => !!v || 'Selecciona una categoría.',
      descripcion: v => v.trim().length >= 40 || `Cuéntanos un poco más (mínimo 40 caracteres, llevas ${v.trim().length}).`,
      youtube: v => !!ytId(v) || 'Pega un enlace válido de YouTube (youtube.com/watch?v=… o youtu.be/…).',
    };
    const validate = (input) => {
      const f = input.closest('.field'); if (!f) return true;
      const rule = rules[input.name]; if (!rule) return true;
      const r = rule(input.value);
      const err = $('.error', f);
      if (r === true) { f.classList.remove('is-invalid'); f.classList.add('is-valid'); return true; }
      f.classList.add('is-invalid'); f.classList.remove('is-valid'); if (err) err.textContent = r; return false;
    };
    $$('input, select, textarea', form).forEach(i => {
      i.addEventListener('blur', () => { if (i.value || i.required) validate(i); updateProgress(); });
      i.addEventListener('input', () => { if (i.closest('.field')?.classList.contains('is-invalid')) validate(i); updateProgress(); });
    });
    // progreso por bloque
    function updateProgress() {
      $$('[data-block]', form).forEach(block => {
        const req = $$('[required]', block);
        const ok = req.filter(i => i.type === 'checkbox' ? i.checked : i.value.trim()).length;
        const bar = $(`[data-progress="${block.dataset.block}"]`);
        if (bar) bar.style.setProperty('--p', req.length ? ok / req.length : 0);
      });
    }
    updateProgress();
    // uploads
    $$('.upload', form).forEach(up => {
      const inp = $('input[type=file]', up); const label = $('[data-filename]', up);
      inp.addEventListener('change', () => { if (inp.files[0]) { up.classList.add('has-file'); label.textContent = inp.files[0].name; } });
    });
    // YouTube verificar
    const yt = $('[name=youtube]', form), verify = $('[data-yt-verify]', form), prev = $('[data-yt-preview]', form);
    const doVerify = () => {
      const id = ytId(yt.value);
      if (!id) { validate(yt); prev.classList.remove('is-visible'); return; }
      validate(yt); verify.classList.add('is-loading');
      setTimeout(() => {
        verify.classList.remove('is-loading');
        $('img', prev).src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
        $('[data-yt-id]', prev).textContent = id;
        prev.classList.add('is-visible');
      }, 600);
    };
    if (verify) verify.addEventListener('click', doVerify);
    if (yt) yt.addEventListener('blur', () => { if (ytId(yt.value)) doVerify(); });
    // envío
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputs = $$('input, select, textarea', form).filter(i => i.name in rules);
      let firstBad = null;
      inputs.forEach(i => { if (!validate(i) && !firstBad) firstBad = i; });
      $$('input[type=checkbox][required]', form).forEach(c => { const f = c.closest('.check'); if (!c.checked) { f.classList.add('is-invalid'); if (!firstBad) firstBad = c; } else f.classList.remove('is-invalid'); });
      if (firstBad) { firstBad.focus(); firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' }); toast('Revisa los campos marcados en rojo.'); return; }
      const btn = $('[type=submit]', form); btn.classList.add('is-loading'); btn.disabled = true;
      setTimeout(() => {
        btn.classList.remove('is-loading'); btn.disabled = false;
        form.hidden = true; const aside = $('[data-form-aside]'); if (aside) aside.hidden = true;
        const ok = $('[data-success]'); if (ok) { $('[data-f="producto"]', ok).textContent = $('[name=producto]', form).value; $('[data-f="correo"]', ok).textContent = $('[name=correo]', form).value; ok.classList.add('is-visible'); ok.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      }, 1400);
    });
  }

  /* ---------- Enlaces aún no disponibles (PDF de bases, etc.) ---------- */
  function initDisabledLinks() {
    $$('a[aria-disabled="true"]').forEach(a => a.addEventListener('click', (e) => { e.preventDefault(); toast('El PDF oficial de las bases se publicará con la versión final del sitio.'); }));
  }

  /* ---------- Copiar enlace ---------- */
  function initShare() {
    $$('[data-share]').forEach(b => b.addEventListener('click', async () => {
      const url = location.href.split('#')[0];
      try { if (navigator.share) await navigator.share({ title: 'Exportadores 2026', url }); else { await navigator.clipboard.writeText(url); toast('Enlace copiado.'); } } catch (_) { }
    }));
  }

  /* ---------- Parallax suave de olas del hero (opcional, sin librerías) ---------- */
  function initParallax() {
    const els = $$('[data-parallax]'); if (!els.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const update = () => { raf = 0; const y = window.scrollY; els.forEach(el => { const k = Number(el.dataset.parallax) || .2; el.style.transform = `translate3d(0, ${y * k}px, 0)`; }); };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initWaves(); initNav(); initDates(); initBases(); initFeatured(); initGallery(); initVote(); initModals(); initForm(); initShare(); initDisabledLinks(); initParallax(); initReveal();
    body.classList.add('is-ready');
  });
})();
