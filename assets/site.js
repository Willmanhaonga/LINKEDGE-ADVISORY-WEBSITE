(() => {
  'use strict';
  document.documentElement.classList.add('js');

  const WA_NUMBER = '255719856488';
  // Where form submissions go. Leave empty until an email service is set up
  // (for example a Formspree endpoint such as "https://formspree.io/f/xxxxxxx").
  const FORM_ENDPOINT = '';

  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Mobile menu ---------- */
  const menuBtn = document.querySelector('.menu-btn');
  const nav = document.getElementById('nav');
  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.querySelector('.menu-label').textContent = open ? 'Close' : 'Menu';
  };
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
  });

  /* ---------- Compliance calendar (next TRA deadlines) ---------- */
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const lastDay = (y, m) => new Date(y, m + 1, 0).getDate();

  function deadlines(from, count) {
    const items = [];
    const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    for (let i = 0; i < 14 && items.length < 40; i++) {
      const y = start.getFullYear() + Math.floor((start.getMonth() + i) / 12);
      const m = (start.getMonth() + i) % 12;
      const prev = FULL[(m + 11) % 12];
      items.push({ d: new Date(y, m, 7), title: 'PAYE, SDL & withholding tax', note: 'For ' + prev });
      items.push({ d: new Date(y, m, 20), title: 'VAT return & payment', note: 'For ' + prev });
      if ([2, 5, 8, 11].includes(m)) {
        const q = [2, 5, 8, 11].indexOf(m) + 1;
        const ord = ['1st', '2nd', '3rd', '4th'][q - 1];
        items.push({ d: new Date(y, m, lastDay(y, m)), title: 'Provisional tax, ' + ord + ' instalment', note: 'December year-end companies' });
      }
      if (m === 5) items.push({ d: new Date(y, 5, 30), title: 'Final income tax return', note: 'For December ' + (y - 1) + ' year-end' });
    }
    return items
      .filter(x => x.d >= start)
      .sort((a, b) => a.d - b.d || a.title.localeCompare(b.title))
      .slice(0, count);
  }

  function renderCalendar() {
    const list = document.getElementById('cal-list');
    const today = document.getElementById('cal-today');
    if (!list) return;
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    today.textContent = 'Today ' + now.getDate() + ' ' + MONTHS[now.getMonth()];
    const frag = document.createDocumentFragment();
    deadlines(now, 4).forEach(x => {
      const days = Math.round((x.d - midnight) / 864e5);
      const li = document.createElement('li');
      const iso = x.d.getFullYear() + '-' + String(x.d.getMonth() + 1).padStart(2, '0') + '-' + String(x.d.getDate()).padStart(2, '0');
      const t = document.createElement('time'); t.dateTime = iso; t.textContent = x.d.getDate() + ' ' + MONTHS[x.d.getMonth()];
      const body = document.createElement('div');
      const s = document.createElement('strong'); s.textContent = x.title;
      const n = document.createElement('span'); n.textContent = x.note;
      body.append(s, n);
      const pill = document.createElement('span');
      pill.className = 'in' + (days <= 7 ? ' soon' : '');
      pill.textContent = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : 'In ' + days + ' days';
      li.append(t, body, pill);
      frag.append(li);
    });
    list.replaceChildren(frag);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Count the days up once, so the urgency reads as it appears
    list.querySelectorAll('.in').forEach((pill) => {
      const m = pill.textContent.match(/^In (\d+) days$/);
      if (!m) return;
      const target = +m[1], start = performance.now() + 500, dur = 900;
      pill.textContent = 'In 0 days';
      const tick = (now) => {
        const p = Math.min(1, Math.max(0, (now - start) / dur));
        const eased = 1 - Math.pow(1 - p, 3);
        const n = Math.round(target * eased); pill.textContent = 'In ' + n + (n === 1 ? ' day' : ' days');
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }
  renderCalendar();

  /* ---------- Hero slideshow: 6s per photo, crossfade + slow drift ---------- */
  (function slideshow() {
    const media = document.querySelector('.hero-media');
    const ctrl = document.querySelector('.slide-ctrl');
    if (!media || !ctrl) return;
    const slides = [...media.querySelectorAll('.slide')];
    const dots = [...ctrl.querySelectorAll('.slide-dot')];
    const pauseBtn = ctrl.querySelector('.slide-pause');
    const DUR = 4000, FADE = 1600;
    let i = 0, timer = null, startedAt = 0, remaining = DUR;
    let userPaused = false, hidden = false, offscreen = false;

    // Load the other photos after the page is ready, so the first view stays fast
    const loadRest = () => slides.forEach(s => { const img = s.querySelector('img[data-src]'); if (img) { img.src = img.dataset.src; img.removeAttribute('data-src'); } });
    if (document.readyState === 'complete') setTimeout(loadRest, 300); else window.addEventListener('load', () => setTimeout(loadRest, 300));

    const restartFill = (dot) => { dot.classList.remove('is-active'); void dot.offsetWidth; dot.classList.add('is-active'); };

    function show(n) {
      if (n === i) return;
      const prev = slides[i];
      prev.classList.remove('is-active'); prev.classList.add('is-leaving');
      setTimeout(() => prev.classList.remove('is-leaving'), FADE + 50);
      i = (n + slides.length) % slides.length;
      const next = slides[i];
      const img = next.querySelector('img'); if (img.dataset.src) loadRest();
      next.classList.add('is-active');
      dots.forEach((d, k) => {
        d.classList.toggle('done', k < i);
        d.classList.remove('is-active');
        d.removeAttribute('aria-current');
      });
      dots[i].setAttribute('aria-current', 'true');
      restartFill(dots[i]);
    }

    const isPaused = () => userPaused || hidden || offscreen;
    function schedule(ms) {
      clearTimeout(timer);
      if (isPaused()) return;
      startedAt = Date.now(); remaining = ms;
      timer = setTimeout(() => { show(i + 1); schedule(DUR); }, ms);
    }
    let wasPaused = false;
    function applyPause() {
      const p = isPaused();
      if (p === wasPaused) return;
      wasPaused = p;
      media.classList.toggle('paused', p);
      ctrl.classList.toggle('paused', p);
      if (p) { clearTimeout(timer); remaining = Math.max(0, remaining - (Date.now() - startedAt)); }
      else schedule(remaining || DUR);
    }

    dots.forEach((d, k) => d.addEventListener('click', () => { show(k); remaining = DUR; startedAt = Date.now(); if (!isPaused()) schedule(DUR); }));
    pauseBtn.addEventListener('click', () => {
      userPaused = !userPaused;
      pauseBtn.setAttribute('aria-pressed', String(userPaused));
      pauseBtn.setAttribute('aria-label', userPaused ? 'Play background photos' : 'Pause background photos');
      applyPause();
    });
    document.addEventListener('visibilitychange', () => { hidden = document.hidden; applyPause(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { offscreen = !e.isIntersecting; applyPause(); }).observe(media);
    }
    dots[0].classList.add('is-active');
    schedule(DUR);
  })();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- 3D logo: extruded chain mark spinning constantly; leans toward the mouse ---------- */
  (function logo3d() {
    const wrap = document.querySelector('.logo3d');
    if (!wrap) return;
    const obj = wrap.querySelector('.logo3d-obj');
    const spin = document.createElement('div');
    spin.className = 'logo3d-spin';
    // A thin, solid coin. Each side has its own face and rim layers that only show
    // from that side, so the logo reads correctly front and back with no ghosting.
    const DEPTH = 6, LAYERS = 14, step = DEPTH / LAYERS;
    const layer = (z, back, cls) => {
      const s = document.createElement('span');
      s.className = cls;
      s.style.transform = 'translateZ(' + z.toFixed(3) + 'px)' + (back ? ' rotateY(180deg)' : '');
      return s;
    };
    for (let k = LAYERS; k >= 1; k--) {
      spin.appendChild(layer(DEPTH / 2 - k * step, false, 'side'));   // rim seen from the front
      spin.appendChild(layer(-DEPTH / 2 + k * step, true, 'side'));   // rim seen from the back
    }
    spin.appendChild(layer(DEPTH / 2, false, 'face'));
    spin.appendChild(layer(-DEPTH / 2, true, 'face'));
    obj.appendChild(spin);
    if (reduceMotion) return;

    // Pause the spin when it is off screen or the tab is hidden
    let off = false, hid = false;
    const sync = () => wrap.classList.toggle('paused', off || hid);
    document.addEventListener('visibilitychange', () => { hid = document.hidden; sync(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { off = !e.isIntersecting; sync(); }).observe(wrap);

    if (!finePointer) return;
    let raf = 0, px = 0, py = 0;
    window.addEventListener('pointermove', (e) => {
      px = e.clientX / window.innerWidth - 0.5; py = e.clientY / window.innerHeight - 0.5;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        obj.style.setProperty('--ry', (-py * 30).toFixed(2));
        obj.style.setProperty('--rz', (px * 10).toFixed(2));
      });
    }, { passive: true });
  })();

  /* ---------- Hover tilt on package cards and team photos (mouse only) ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.pk, .person img').forEach((el) => {
      const host = el.closest('[data-3d]') || el;
      el.addEventListener('pointermove', (e) => {
        if (host.hasAttribute('data-3d') && !host.classList.contains('in')) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transition = 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1)';
        el.style.transform = 'perspective(900px) rotateX(' + (-y * 8).toFixed(2) + 'deg) rotateY(' + (x * 10).toFixed(2) + 'deg) translateZ(6px)';
      });
      el.addEventListener('pointerleave', () => {
        el.style.transition = 'transform 500ms cubic-bezier(0.23, 1, 0.32, 1)';
        el.style.transform = '';
      });
    });
  }

  /* ---------- Map: load the Google map only on the live site, when it comes near ---------- */
  (function map() {
    const frame = document.querySelector('.map iframe');
    if (!frame) return;
    if (window.self !== window.top) return; // previews inside other pages keep the link card
    const load = () => { frame.addEventListener('load', () => frame.classList.add('ready'), { once: true }); frame.src = frame.dataset.src; };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { load(); io.disconnect(); } }, { rootMargin: '400px 0px' });
      io.observe(frame);
    } else load();
  })();

  /* ---------- 3D scroll entrances (once) ---------- */
  (function entrances() {
    const groups = [
      ['.disc', () => 'rise', 0],
      ['.rules .rule', () => 'rise', 70],
      ['.pk', (el, k) => ['door-l', 'rise', 'door-r'][k] || 'rise', 90],
      ['.serve-row', (el, k) => (k % 2 ? 'door-r' : 'door-l'), 0],
      ['.person', () => 'turn', 80],
      ['.steps li', () => 'rise', 80],
      ['.form', () => 'tilt', 0],
    ];
    const els = [];
    groups.forEach(([sel, kind, stagger]) => {
      document.querySelectorAll(sel).forEach((el, k) => {
        el.dataset['3d'] = kind(el, k);
        if (stagger) el.style.setProperty('--d', (k * stagger) + 'ms');
        els.push(el);
      });
    });
    if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    els.forEach(el => io.observe(el));
  })();

  /* ---------- Section headings reveal once ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  /* ---------- Floating WhatsApp: hidden while the hero's own button is visible ---------- */
  const fab = document.querySelector('.wa-float');
  const heroActions = document.querySelector('.hero .actions');
  if (fab && heroActions && 'IntersectionObserver' in window) {
    fab.classList.add('hide');
    new IntersectionObserver(([e]) => fab.classList.toggle('hide', e.isIntersecting)).observe(heroActions);
  }

  /* ---------- Package buttons pre-select the form ---------- */
  const service = document.getElementById('f-service');
  document.querySelectorAll('[data-pkg]').forEach(b => b.addEventListener('click', () => { service.value = b.dataset.pkg; }));

  /* ---------- Consultation form ---------- */
  const form = document.getElementById('quote-form');
  const status = document.getElementById('form-status');
  const fields = {
    name: { el: document.getElementById('f-name'), err: document.getElementById('e-name') },
    phone: { el: document.getElementById('f-phone'), err: document.getElementById('e-phone') },
    email: { el: document.getElementById('f-email'), err: document.getElementById('e-email') },
  };
  const setErr = (f, msg) => {
    f.err.textContent = msg;
    if (msg) f.el.setAttribute('aria-invalid', 'true'); else f.el.removeAttribute('aria-invalid');
  };
  Object.values(fields).forEach(f => f.el.addEventListener('input', () => setErr(f, '')));

  function validate(d) {
    let first = null;
    if (!d.name.trim()) { setErr(fields.name, 'Please add your name.'); first = first || fields.name.el; }
    const digits = d.phone.replace(/\D/g, '');
    if (digits.length < 9) { setErr(fields.phone, 'Please add a phone or WhatsApp number we can reach, for example +255 712 345 678.'); first = first || fields.phone.el; }
    if (d.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) { setErr(fields.email, 'This email looks incomplete. Check it, or leave it empty.'); first = first || fields.email.el; }
    if (first) first.focus();
    return !first;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    status.className = 'form-status';
    status.replaceChildren();
    if (!validate(d)) return;

    const lines = [
      'Hello LinkEdge Advisory,', '',
      'Name: ' + d.name.trim(),
      'Company: ' + (d.company.trim() || '-'),
      'Phone: ' + d.phone.trim(),
      'Email: ' + (d.email.trim() || '-'),
      'Service: ' + d.service,
    ];
    if (d.message.trim()) lines.push('', d.message.trim());
    const waLink = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
    const btn = form.querySelector('button[type="submit"]');

    if (FORM_ENDPOINT) {
      btn.disabled = true; btn.textContent = 'Sending…';
      try {
        const r = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
        if (!r.ok) throw new Error('send failed');
        form.reset();
        status.textContent = 'Request sent. We will contact you within one working day.';
        status.classList.add('show');
        return;
      } catch (_) {
        /* fall back to WhatsApp below */
      } finally {
        btn.disabled = false; btn.textContent = 'Send request';
      }
    }

    const p = document.createElement('p');
    p.textContent = 'Your details are ready. Send them to us on WhatsApp and we will reply there.';
    const a = document.createElement('a');
    a.className = 'btn btn-wa'; a.href = waLink; a.target = '_blank'; a.rel = 'noopener';
    a.innerHTML = '<svg aria-hidden="true"><use href="#i-wa"/></svg>Send on WhatsApp';
    status.append(p, a);
    status.classList.add('show');
    a.focus();
  });
})();
