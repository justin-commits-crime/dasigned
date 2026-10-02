/* Dasigned
   - Hero: the storefront photo is a "world" whose shop window holds the real website.
     The website is laid out at its final on-screen size; scrolling zooms the world about
     the window from ~66% up to exactly 100%, so the copy is legible and the CTAs live
     from the first frame, and nothing is ever upscaled.
   - Paper bags turn slightly toward the cursor; hover / focus / tap previews that project in the window.
   - The window glass wipes away along the slash angle as you zoom: physical → digital.
   - Header menu (small screens) and an on-view word reveal for "The idea". */
(() => {
  const IMG_R = 1678 / 937;                                   // storefront photo aspect
  const SCR = { x: .3039, y: .2102, w: .3903, h: .5848 };     // shop window, as fractions of the photo
  const WIN_R = (SCR.w * IMG_R) / SCR.h;                      // shop window aspect (~1.195)
  const WIN_PHOTO_H = 1 / (SCR.w * IMG_R);                    // photo height per px of window width
  const Z0 = .7;                                             // opening size of the window vs. final
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;

  const $ = s => document.querySelector(s);
  const root = document.documentElement, header = $('[data-header]');
  const scroller = $('[data-hero]'), stage = $('[data-stage]'), world = $('[data-world]'), screen = $('[data-screen]'),
    hint = $('[data-hint]'), probe = $('[data-probe]');

  /* ── Layout + scroll zoom ────────────────────────────────── */
  let mode = '', raf = 0, zoom = null, zoomKey = null, zoomTimer = 0;
  function setMode(m) {
    if (m === mode) return;
    root.classList.remove('m-' + mode); root.classList.add('m-' + m); mode = m;
    screen.style.removeProperty('--g');
    scroller.style.height = stage.style.height = '';
  }
  function update() {
    raf = 0;
    const vw = innerWidth, vh = probe.offsetHeight || innerHeight, HDR = header.offsetHeight;
    const Ah = vh - HDR, portrait = vh > vw;
    const fitW = Math.min(vw, Ah * WIN_R);                    // window fitted below the header

    setMode(fitW >= 720 && !(portrait && vw < 900) ? 'zoom' : portrait ? 'stacked' : 'static');

    let we, s = 1, Y;
    if (mode === 'zoom') {
      we = fitW;
    } else if (mode === 'stacked') {
      // full width, unless that would push the CTA bar below the fold (tablets)
      we = clamp((vh - HDR - 128) / (.92 * WIN_PHOTO_H), vw * .8, vw);
    } else {
      we = Math.min(vw * .92, Ah * .88 * WIN_R);
    }
    const BW = we / SCR.w, BH = BW / IMG_R;
    const cx = (SCR.x + SCR.w / 2) * BW, cy = (SCR.y + SCR.h / 2) * BH;

    if (mode === 'zoom') {
      const ws = clamp(Math.max(we * Z0, vw * SCR.w), 0, we);  // never leave black bars at the sides
      const s0 = ws / we;
      const range = scroller.offsetHeight - vh;
      const p = clamp(-scroller.getBoundingClientRect().top / range, 0, 1);
      const e = ease(clamp(p / .72, 0, 1));
      s = s0 * Math.pow(1 / s0, e);
      Y = HDR + Ah / 2;
      if (!reduce) screen.style.setProperty('--g', clamp((e - .12) / .7, 0, 1));
      hint.style.opacity = 1 - clamp(p / .06, 0, 1);
    } else if (mode === 'stacked') {
      const top = HDR - .08 * BH;                             // fascia + sign just under the header
      Y = top + cy;
      const h = Math.ceil(top + BH + 128);                    // photo, then the CTA bar
      scroller.style.height = stage.style.height = h + 'px';
    } else {
      Y = HDR + Ah / 2;
    }

    world.style.width = BW + 'px';
    world.style.height = BH + 'px';
    world.style.fontSize = BH / 100 + 'px';                   // 1em = 1% of the photo height (bag captions)
    world.style.transform = `translate(${vw / 2 - s * cx}px,${Y - s * cy}px) scale(${s})`;
    placeZoom();
  }
  const req = () => { if (!raf) raf = requestAnimationFrame(update); };
  update();
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  if (document.fonts) document.fonts.ready.then(req);

  /* ── Bag depth: a subtle turn toward the cursor, then still ── */
  if (!reduce && !coarse) {
    let tx = 0, ty = 0, mx = 0, my = 0, loop = 0;
    const tick = () => {
      mx += (tx - mx) * .08; my += (ty - my) * .08;
      world.style.setProperty('--bry', mx * 7 + 'deg');
      world.style.setProperty('--brx', -my * 3 + 'deg');
      loop = Math.abs(tx - mx) + Math.abs(ty - my) > .002 ? requestAnimationFrame(tick) : 0;
    };
    addEventListener('pointermove', ev => {
      tx = ev.clientX / innerWidth * 2 - 1; ty = ev.clientY / innerHeight * 2 - 1;
      if (!loop) loop = requestAnimationFrame(tick);
    }, { passive: true });
  }

  /* ── Bag → project dissolves into the shop window ────────── */
  const previews = $('#bag-previews').content;
  const bags = [...document.querySelectorAll('[data-bag]')];
  function openZoom(key) {
    clearTimeout(zoomTimer);
    bags.forEach(b => b.classList.toggle('is-on', b.dataset.bag === key));
    if (zoom && zoomKey === key) { zoom.classList.remove('fade'); zoom.classList.add('open'); return; }
    if (zoom) zoom.remove();
    zoom = document.createElement('div');
    zoom.className = 'bag-zoom';
    placeZoom();
    zoom.appendChild(previews.querySelector(`[data-key="${key}"]`).cloneNode(true));
    document.body.appendChild(zoom);
    zoomKey = key;
    requestAnimationFrame(() => requestAnimationFrame(() => zoom && zoom.classList.add('open')));
  }
  function placeZoom() {                                     // sits exactly over the shop window
    if (!zoom) return;
    const r = screen.getBoundingClientRect(), pad = r.width * .012;
    Object.assign(zoom.style, {
      left: r.left - pad + 'px', top: r.top - pad + 'px',
      width: r.width + pad * 2 + 'px', height: r.height + pad * 2 + 'px'
    });
  }
  function closeZoom() {
    if (!zoom) return;
    bags.forEach(b => b.classList.remove('is-on'));
    zoom.classList.add('fade');
    clearTimeout(zoomTimer);
    zoomTimer = setTimeout(() => { if (zoom) zoom.remove(); zoom = null; zoomKey = null; }, 1200);
  }
  bags.forEach(bag => {
    const key = bag.dataset.bag;
    bag.addEventListener('pointerenter', e => e.pointerType === 'mouse' && openZoom(key));
    bag.addEventListener('pointerleave', e => e.pointerType === 'mouse' && closeZoom());
    bag.addEventListener('focus', () => bag.matches(':focus-visible') && openZoom(key));   // keyboard only
    bag.addEventListener('blur', closeZoom);
    bag.addEventListener('click', e => {
      // The bag is an entrance: mouse / keyboard select walks to the project;
      // on touch the first tap previews it in the window, the second walks in.
      e.stopPropagation();
      const showing = zoom && zoomKey === key && !zoom.classList.contains('fade');
      if (e.pointerType === 'touch' && !showing) openZoom(key); else enterTile(bag.dataset.target);
    });
  });
  document.addEventListener('click', closeZoom);

  /* ── Window → product: walking from a bag to its project ─── */
  const tiles = [...document.querySelectorAll('[data-tile]')];
  function enterTile(id) {
    const tile = document.getElementById(id);
    if (!tile) return;
    closeZoom();
    tiles.forEach(t => t.classList.remove('is-target'));
    tile.classList.add('is-target');
    tile.classList.remove('in'); void tile.offsetWidth;      // replay its glass as you arrive
    tile.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', '#' + id);
    const seen = new IntersectionObserver(([en]) => { if (en.isIntersecting) { tile.classList.add('in'); seen.disconnect(); } }, { threshold: .6 });
    seen.observe(tile);
    setTimeout(() => tile.classList.remove('is-target'), 3000);
  }

  /* ── Menu (small screens) ────────────────────────────────── */
  const menu = $('[data-menu]'), menuBtn = $('[data-menu-open]');
  menu.inert = true;
  const setMenu = open => {
    menu.classList.toggle('open', open); menu.inert = !open;
    menuBtn.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
    (open ? menu.querySelector('.menu-links a') : menuBtn).focus({ preventScroll: true });
  };
  menuBtn.addEventListener('click', () => setMenu(true));
  $('[data-menu-close]').addEventListener('click', () => setMenu(false));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (menu.classList.contains('open')) setMenu(false); else closeZoom();
  });

  /* ── Display → discovery: project windows clear as they come into view ── */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { threshold: .35 });
    tiles.forEach(t => io.observe(t));

    /* Directory: the header marks the section you're standing in */
    const links = [...document.querySelectorAll('.nav a, .menu-links a')];
    const sections = [...new Set(links.map(l => l.getAttribute('href')))].map(h => document.querySelector(h)).filter(Boolean);
    const mark = id => links.forEach(l => l.getAttribute('href') === '#' + id ? l.setAttribute('aria-current', 'location') : l.removeAttribute('aria-current'));
    let here = null, spyRaf = 0;
    const spy = () => {                                       // the last section whose sign has passed the 45% line
      spyRaf = 0;
      const line = innerHeight * .45;
      let id = '';
      sections.forEach(sec => { const r = sec.getBoundingClientRect(); if (r.top <= line && r.bottom > 0) id = sec.id; });
      if (id !== here) { here = id; mark(id); }
    };
    addEventListener('scroll', () => { if (!spyRaf) spyRaf = requestAnimationFrame(spy); }, { passive: true });
    spy();
  } else tiles.forEach(t => t.classList.add('in'));

  /* ── "The idea": words read in as the paragraph enters view ─ */
  const idea = $('[data-reveal]');
  idea.innerHTML = idea.textContent.trim().split(/\s+/)
    .map((w, i) => `<span class="w" style="--i:${i}">${w.replace(/\*([^*]+)\*/g, '<em>$1</em>')}</span>`).join(' ');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { idea.classList.add('in'); io.disconnect(); } }, { threshold: .35 });
    io.observe(idea);
  } else idea.classList.add('in');
})();
