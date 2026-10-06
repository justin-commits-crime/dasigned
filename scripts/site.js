/* Dasigned — homepage interactions (vanilla JS, no build step). */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const anim = !reduce;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isNarrow = () => innerWidth < 960;
  const pad = n => String(n).padStart(2, '0');
  const de = document.documentElement;
  const body = document.body;
  const canvas = $('.hero__orb canvas');

  const PROJECTS = [
    { name: 'Halden Ceramics', category: 'Brand identity', year: '2025', client: 'Halden Ceramic Works', bg: '#171716', fg: '#f2f2f0',
      summary: 'An identity built from the marks a potter leaves behind.',
      background: 'Halden had made stoneware for three generations without ever having a name people could find. A second workshop and a first online shop meant the brand suddenly had to work far beyond the kiln room — on packaging, signage and a screen.',
      concept: 'Glaze as grammar. We reduced the thumbprint, the rim, the foot ring and the drip line to four glyphs that combine into a modular monogram. One cobalt, borrowed from their oldest glaze, carries everything else.',
      resp: ['Brand strategy', 'Naming architecture', 'Logotype & glyph system', 'Packaging', 'Signage & wayfinding', 'Brand guidelines'],
      out: ['A system the team applies themselves, from kiln labels to shipping boxes.', 'Glyphs cut as stamps, so the identity is pressed into the clay itself.', 'Guidelines delivered as a pocket-sized printed field manual.'] },
    { name: 'Tessera', category: 'Digital product', year: '2024', client: 'Tessera Library Network', bg: '#1a3dff', fg: '#ffffff',
      summary: 'One calm place to search a dozen scattered archives.',
      background: 'A network of independent libraries needed a single way to search their digitised collections — letters, maps, photographs — without flattening what makes each archive distinct.',
      concept: 'Mosaic, not feed. Every result is a tile that keeps its source’s character, and the interface steps back so the material can speak. Search reads like a conversation with a librarian; filters behave like a card catalogue.',
      resp: ['Product strategy', 'User research', 'Interaction design', 'Design system', 'iOS & web UI', 'Prototyping'],
      out: ['One design system shared across iOS and web.', 'Core flows shaped in sessions with archivists and researchers.', 'A tile pattern new partner libraries plug into without redesign.'] },
    { name: 'Salt Mercer FW25', category: 'Art direction', year: '2025', client: 'Salt Mercer Knitwear', bg: '#141414', fg: '#ffffff',
      summary: 'A campaign shot in the hour after the storm.',
      background: 'Salt Mercer makes heavy knitwear on a stretch of coast known mostly for its weather. For FW25 they wanted a campaign that felt like the place — not a postcard of it.',
      concept: 'We shot only in the hour after storms and printed everything as coarse halftone, echoing the stitch of the knit. Type is set loose and wet: oversized italics that crowd the frame the way fog does.',
      resp: ['Creative direction', 'Campaign concept', 'Casting & styling direction', 'Photography direction', 'Typography', 'Print & OOH layouts'],
      out: ['A campaign toolkit spanning print, social and in-store.', 'A halftone treatment the in-house team now carries into new seasons.', 'A lookbook printed on uncoated stock at a small coastal press.'] },
    { name: 'Lowlight Festival', category: 'Motion design', year: '2024', client: 'Lowlight Festival', bg: '#121212', fg: '#ffffff',
      summary: 'A visual voice that moves at the speed of the music.',
      background: 'Lowlight is a three-night festival of ambient and electronic music held in a former observatory. It needed a visual language that could fill a stage screen and still work on a phone.',
      concept: 'Sound as orbit. A generative ring system responds to tempo and frequency — slowing to near-stillness for drone sets, tightening for the late shows. Type breathes with the music along a single variable axis.',
      resp: ['Motion identity', 'Generative system design', 'Title sequences', 'Stage visuals', 'Social motion templates', 'Variable type animation'],
      out: ['A live-reactive system operated by the festival’s own visual team.', 'A template library for artists and partners to announce sets.', 'Visuals that scale from large-format projection down to vertical stories.'] },
    { name: 'Morrow Supply', category: 'Ecommerce', year: '2023', client: 'Morrow Supply Co.', bg: '#1a1a19', fg: '#f2f2f0',
      summary: 'A shop that explains why things last.',
      background: 'Morrow Supply sells a small range of outdoor goods built to be repaired. Their old shop sold products well enough, but never told the story of how they are made — or how to mend them.',
      concept: 'A shop that reads like a field guide. Each product page opens with how it’s made and how to fix it, while the cart waits quietly to the side. Repair parts are first-class products, not an afterthought.',
      resp: ['Ecommerce strategy', 'Information architecture', 'Art direction', 'Headless Shopify build', 'Product photography direction', 'Content design'],
      out: ['A headless storefront the team edits without developer help.', 'Repair guides woven into every product page.', 'Accessibility reviewed against WCAG 2.2 AA throughout.'] },
    { name: 'Atlas of Quiet', category: 'Bespoke web engineering', year: '2026', client: 'The Quiet Places Collective', bg: '#111111', fg: '#f2f2f0',
      summary: 'An archive you explore by ear.',
      background: 'A collective of field recordists spent a decade capturing quiet places — forests at night, empty stations, snowfields. They wanted an archive that felt like listening, not browsing.',
      concept: 'A topographic map where elevation is volume. Each recording rises as a contour peak, and moving across the map crossfades between places in real time, so the archive unfolds as sound.',
      resp: ['Creative technology', 'WebGL engineering', 'Web Audio engineering', 'Custom CMS', 'Performance engineering', 'Accessibility'],
      out: ['Spatial crossfading built natively on the Web Audio API.', 'A complete non-visual listening mode with keyboard navigation.', 'Progressive streaming keeps it smooth on mid-range phones.'] },
    { name: 'Interiorem', category: 'Storefront 01 — Marketplace', year: '', client: 'Interiorem', bg: '#111113', fg: '#ffffff',
      img: 'assets/store-interiorem.webp', link: 'https://dasigned-4-dasigned-0a08.wix-site-host.com/work/interiorem.html',
      summary: 'Furniture with a previous life.',
      background: 'A marketplace storefront for furniture with a previous life, listed by Melbourne dealers and collectors.',
      concept: '', resp: ['Brand & art direction', 'Commerce engineering'], out: [] },
    { name: 'Chair Label', category: 'Storefront 02 — Fashion', year: '', client: 'Chair Label', bg: '#111113', fg: '#ffffff',
      img: 'assets/store-chair.jpg', link: 'https://dasigned-4-dasigned-0a08.wix-site-host.com/work/chair-label.html',
      summary: 'Collection 01, Uniform.',
      background: 'Collection 01, launched as a campaign you can shop.',
      concept: '', resp: ['Brand & art direction', 'Storefront design'], out: [] },
    { name: 'Monolith Audio', category: 'Storefront 03 — Audio', year: '', client: 'Monolith Audio', bg: '#0e0d0c', fg: '#ffffff',
      img: 'assets/store-monolith.webp', link: '',
      summary: 'Sound, sculpted.',
      background: 'A storefront for active loudspeakers carved from solid timber and tuned by hand in Melbourne.',
      concept: '', resp: ['Brand & art direction', 'Storefront design'], out: [] }
  ];

  /* ── Clocks ─────────────────────────────────────────────────────── */
  const clocks = $$('[data-clock]');
  const tick = () => clocks.forEach(el => {
    try { el.textContent = new Date().toLocaleTimeString('en-GB', { timeZone: el.dataset.clock, hour: '2-digit', minute: '2-digit' }); } catch (e) {}
  });
  tick(); setInterval(tick, 20000);

  /* ── Intro ──────────────────────────────────────────────────────── */
  (function intro() {
    const el = $('[data-intro]'); if (!el) return;
    const win = $('[data-intro-win]', el), bar = $('[data-intro-bar]', el);
    const bands = { top: $('[data-intro-band="top"]', el), bot: $('[data-intro-band="bot"]', el) };
    const line = '<span>Websites / <em>Worth Seeing</em></span>'.repeat(6);
    const rows = { top: [], bot: [] };
    ['top', 'bot'].forEach((k, b) => {
      for (let i = 0; i < 3; i++) {
        const r = document.createElement('div');
        r.className = 'intro__row'; r.innerHTML = line;
        // Rows start off-screen on alternating sides, then settle at staggered offsets.
        const from = b === 0 ? (i % 2 ? '110%' : '-110%') : (i % 2 ? '-110%' : '110%');
        const to = b === 0 ? (i % 2 ? '-22%' : '-6%') : (i % 2 ? '-6%' : '-22%');
        r.style.transform = `translateX(${from})`;
        r.style.transitionDelay = ((i + b * 3) * 0.07) + 's';
        r.dataset.to = to;
        bands[k].appendChild(r); rows[k].push(r);
      }
    });

    let state = 'in';
    const place = () => {
      if (state !== 'in') return;
      const W = innerWidth, H = innerHeight;
      let c = { x: W / 2, y: H / 2 };
      if (canvas) { const r = canvas.getBoundingClientRect(); if (r.width) c = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
      const w = isNarrow() ? W - 40 : Math.min(W * 0.34, 560), h = Math.min(H * 0.48, 520);
      const l = Math.max(20, Math.min(W - w - 20, c.x - w / 2));
      const t = Math.max(H * 0.2, Math.min(H * 0.8 - h, c.y - h / 2));
      Object.assign(win.style, { top: t + 'px', bottom: (H - t - h) + 'px', left: l + 'px', right: (W - l - w) + 'px' });
      bands.top.style.height = t + 'px';
      bands.bot.style.height = (H - t - h) + 'px';
    };
    win.style.transition = 'none'; bands.top.style.transition = bands.bot.style.transition = 'none';
    place();
    void win.offsetWidth;
    win.style.transition = bands.top.style.transition = bands.bot.style.transition = '';
    addEventListener('resize', place);

    de.style.overflow = 'hidden';
    requestAnimationFrame(() => requestAnimationFrame(() => [...rows.top, ...rows.bot].forEach(r => { r.style.transform = `translateX(${r.dataset.to})`; })));

    const dur = anim ? 2400 : 400, t0 = performance.now();
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), v = Math.round((1 - Math.pow(1 - k, 3)) * 100);
      bar.style.width = v + '%';
      if (k < 1) { requestAnimationFrame(step); return; }
      setTimeout(() => {
        de.style.overflow = '';
        state = 'out'; el.classList.add('is-out');
        Object.assign(win.style, { top: '-40px', bottom: '-40px', left: '-40px', right: '-40px' });
        setTimeout(() => { el.classList.add('is-done'); removeEventListener('resize', place); }, 1100);
      }, 350);
    };
    requestAnimationFrame(step);
  })();

  /* ── 3D blob ────────────────────────────────────────────────────── */
  if (canvas) {
    import(new URL('scripts/dasigned-3d.js', document.baseURI).href)
      .then(mod => mod.mount(canvas, { anim }))
      .catch(err => console.warn('3D unavailable', err));
  }

  /* ── Smooth in-page navigation ──────────────────────────────────── */
  const scrollToId = id => {
    const el = document.getElementById(id);
    if (!el) return;
    const hidden = !el.getClientRects().length;
    const top = id === 'top' || hidden ? 0 : el.getBoundingClientRect().top + scrollY - 8;
    scrollTo({ top, behavior: anim ? 'smooth' : 'auto' });
  };

  /* ── Menu ───────────────────────────────────────────────────────── */
  const menu = $('[data-menu]'), menuBtn = $('[data-menu-open]');
  const setMenu = open => {
    if (open && scrollY > 4) scrollTo({ top: 0, behavior: 'instant' });
    menu.classList.toggle('is-open', open);
    body.classList.toggle('menu-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
    if (open) setTimeout(() => menu.classList.contains('is-open') && $('[data-menu-close]', menu).focus({ preventScroll: true }), 500);
  };
  menuBtn.addEventListener('click', () => setMenu(true));
  $('[data-menu-close]', menu).addEventListener('click', () => { setMenu(false); menuBtn.focus({ preventScroll: true }); });

  $$('[data-nav]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    setMenu(false);
    scrollToId(a.dataset.nav);
  }));

  /* ── Storefront preview on hero pills ───────────────────────────── */
  const shots = $$('[data-shot]');
  const showStore = key => {
    body.classList.toggle('is-store', !!key);
    shots.forEach(s => s.classList.toggle('is-on', s.dataset.shot === key));
  };
  $$('[data-store]').forEach(b => {
    const on = () => showStore(b.dataset.store), off = () => showStore(null);
    b.addEventListener('mouseenter', on); b.addEventListener('focus', on);
    b.addEventListener('mouseleave', off); b.addEventListener('blur', off);
  });

  /* ── "Get in touch": blob floods the screen, then lands on Contact ─ */
  const morph = $('[data-morph]');
  let morphing = false;
  $('[data-morph-contact]').addEventListener('click', e => {
    e.preventDefault();
    const sec = document.getElementById('contact');
    const go = () => scrollTo({ top: sec.getClientRects().length ? sec.getBoundingClientRect().top + scrollY : 0, behavior: 'instant' });
    if (morphing || !anim || !morph.animate) { go(); return; }
    morphing = true;
    let x = innerWidth / 2, y = innerHeight / 2;
    if (canvas) { const r = canvas.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) { x = r.left + r.width / 2; y = r.top + r.height / 2; } }
    morph.style.left = x + 'px'; morph.style.top = y + 'px';
    const S = (Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) * 2) / morph.offsetWidth * 1.08;
    const grow = morph.animate([
      { opacity: 0, transform: 'scale(.55) rotate(0deg)', borderRadius: '50%' },
      { opacity: 1, transform: 'scale(.9) rotate(20deg)', borderRadius: '58% 42% 63% 37% / 45% 60% 40% 55%', offset: .25 },
      { opacity: 1, transform: `scale(${S * .45}) rotate(50deg)`, borderRadius: '40% 60% 35% 65% / 62% 38% 58% 42%', offset: .6 },
      { opacity: 1, transform: `scale(${S}) rotate(70deg)`, borderRadius: '50%' }
    ], { duration: 1050, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' });
    grow.onfinish = () => {
      go();
      requestAnimationFrame(() => {
        const out = morph.animate([{ opacity: 1, transform: `scale(${S}) rotate(70deg)` }, { opacity: 0, transform: `scale(${S}) rotate(70deg)` }], { duration: 650, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' });
        out.onfinish = () => { grow.cancel(); out.cancel(); morphing = false; };
      });
    };
  });

  /* ── Case study modal ───────────────────────────────────────────── */
  const modal = $('[data-modal]'), panel = $('[data-modal-panel]');
  const m = k => $(`[data-m="${k}"]`, modal);
  let current = -1, prevFocus = null, closeT = 0;

  const render = i => {
    const p = PROJECTS[i], nxt = PROJECTS[(i + 1) % PROJECTS.length];
    m('num').textContent = pad(i + 1);
    m('total').textContent = pad(PROJECTS.length);
    ['category', 'year', 'client', 'name', 'summary', 'background', 'concept'].forEach(k => { m(k).textContent = p[k]; });
    m('hero').style.background = p.bg; m('hero').style.color = p.fg;
    const img = m('img');
    if (p.img) { img.src = p.img; img.hidden = false; } else { img.hidden = true; img.removeAttribute('src'); }
    m('concept-row').hidden = !p.concept;
    m('resp').innerHTML = '';
    p.resp.forEach((t, j) => { const li = document.createElement('li'); li.innerHTML = `<b>${pad(j + 1)}</b>`; li.append(t); m('resp').appendChild(li); });
    m('out').innerHTML = '';
    p.out.forEach((t, j) => { const li = document.createElement('li'); li.innerHTML = `<b>${pad(j + 1)}</b>`; const s = document.createElement('span'); s.textContent = t; li.appendChild(s); m('out').appendChild(li); });
    m('out-row').hidden = !p.out.length;
    m('link-row').hidden = !p.link;
    if (p.link) m('link').href = p.link;
    m('nextNum').textContent = pad(((i + 1) % PROJECTS.length) + 1);
    m('nextName').textContent = nxt.name;
  };

  const openCase = i => {
    clearTimeout(closeT);
    if (menu.classList.contains('is-open')) setMenu(false);
    prevFocus = document.activeElement;
    de.style.overflow = 'hidden';
    current = i; render(i);
    panel.scrollTop = 0;
    modal.classList.add('is-open');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      modal.classList.add('is-shown');
      setTimeout(() => $('[data-m-close]', modal).focus({ preventScroll: true }), 300);
    }));
  };
  const closeCase = () => {
    if (current < 0) return;
    current = -1;
    modal.classList.remove('is-shown');
    de.style.overflow = '';
    closeT = setTimeout(() => modal.classList.remove('is-open'), 650);
    if (prevFocus && prevFocus.focus) prevFocus.focus({ preventScroll: true });
  };
  const step = d => {
    const n = PROJECTS.length;
    current = ((current < 0 ? 0 : current) + d + n) % n;
    render(current);
    panel.scrollTo({ top: 0, behavior: anim ? 'smooth' : 'auto' });
  };

  $$('[data-open]').forEach(b => b.addEventListener('click', () => openCase(+b.dataset.open)));
  $$('[data-m-next]', modal).forEach(b => b.addEventListener('click', () => step(1)));
  $('[data-m-prev]', modal).addEventListener('click', () => step(-1));
  $('[data-m-close]', modal).addEventListener('click', closeCase);
  modal.addEventListener('click', e => { if (e.target === modal) closeCase(); });

  addEventListener('keydown', e => {
    if (current >= 0) {
      if (e.key === 'Escape') closeCase();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    } else if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      setMenu(false); menuBtn.focus({ preventScroll: true });
    }
  });

  if (!anim) return;

  /* ── Reveal on scroll ───────────────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    const ease = 'cubic-bezier(.2,.65,.2,1)';
    const els = $$('[data-reveal]');
    const targets = new Map();
    els.forEach(el => {
      const d = +(el.dataset.delay || 0), mask = el.dataset.reveal === 'mask';
      el.style.transition = mask ? `transform 1.2s ${ease} ${d}ms` : `opacity 1.1s ${ease} ${d}ms, transform 1.1s ${ease} ${d}ms`;
      el.style.transform = mask ? 'translate3d(0,110%,0)' : 'translate3d(0,36px,0)';
      if (!mask) el.style.opacity = '0';
      const t = mask ? el.parentElement : el;
      if (!targets.has(t)) targets.set(t, []);
      targets.get(t).push(el);
    });
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      (targets.get(en.target) || []).forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
      io.unobserve(en.target);
    }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach((_, t) => io.observe(t));
  }

  /* ── Title parallax ─────────────────────────────────────────────── */
  const px = $$('[data-parallax]');
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = innerHeight, k = innerWidth < 760 ? 0.5 : 1;
    px.forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      if (!r.height || r.bottom < -300 || r.top > vh + 300) return;
      const c = r.top + r.height / 2 - vh / 2;
      el.style.transform = `translate3d(0,${(-c * parseFloat(el.dataset.parallax) * k).toFixed(1)}px,0)`;
    });
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();

  /* ── Hover perspective on project covers (desktop) ──────────────── */
  if (fine) $$('[data-tilt]').forEach(el => {
    const card = $('[data-tilt-card]', el), img = $('[data-tilt-img]', el);
    el.addEventListener('mouseenter', () => { card.style.transition = 'transform .5s cubic-bezier(.2,.7,.2,1)'; });
    el.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(1400px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg) scale(1.012)`;
      img.style.transform = `scale(1.06) translate3d(${(-x * 12).toFixed(1)}px,${(-y * 12).toFixed(1)}px,0)`;
    });
    el.addEventListener('mouseleave', () => {
      card.style.transition = 'transform .9s cubic-bezier(.2,.7,.2,1)';
      card.style.transform = ''; img.style.transform = '';
    });
  });
})();
