/* Dasigned
   - Hero: the storefront photo is a "world" whose shop window holds the real website.
     The website is laid out at its final on-screen size; scrolling zooms the world about
     the window from ~66% up to exactly 100%, so the copy is legible and the CTAs live
     from the first frame, and nothing is ever upscaled.
   - Paper bags turn slightly under the cursor; hover / focus / tap puts the project on display in the window,
     click (or a second tap) opens its page.
   - Shared by every page: menu, glass reveals, the window-to-browser opener, the nav marker.
   - The window glass wipes away along the slash angle as you zoom: physical → digital.
   - Header menu (small screens) and an on-view word reveal for "The idea". */
(() => {
  const IMG_R = 1678 / 937;                                   // storefront photo aspect
  const SCR = { x: .3039, y: .2102, w: .3903, h: .5848 };     // shop window, as fractions of the photo
  const WIN_R = (SCR.w * IMG_R) / SCR.h;                      // shop window aspect (~1.195)
  const WIN_PHOTO_H = 1 / (SCR.w * IMG_R);                    // photo height per px of window width
  const Z0 = .7;
  const STACK_W = 900, STACK_CROP = .115, BELOW_GAP = 72;                    // phones: layout width of the window, photo cropped above the sign band                                             // opening size of the window vs. final
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;

  const $ = s => document.querySelector(s);
  const root = document.documentElement, header = $('[data-header]');
  const scroller = $('[data-hero]'), stage = $('[data-stage]'), world = $('[data-world]'), screen = $('[data-screen]'),
    hint = $('[data-hint]'), probe = $('[data-probe]'), below = $('[data-below]');

  /* Hero (home page only) */
  let closeZoom = () => {};
  if (scroller) (() => {
  /* ── Layout + scroll zoom ────────────────────────────────── */
  let mode = '', raf = 0, eNow = 0, jump = true, zoom = null;
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

    // Reduced motion: the opening framing, held still — same content, no camera move.
    setMode(fitW >= 720 && !(portrait && vw < 900) ? (reduce ? 'still' : 'zoom') : portrait ? 'stacked' : 'static');

    let we, s = 1, Y;
    if (mode === 'zoom' || mode === 'still') {
      we = fitW;
    } else if (mode === 'stacked') {
      we = STACK_W;                                           // window laid out at a desktop width…
      // …shown at ~86% of the screen, but small enough that the CTAs stay above the fold
      const photoH = (1 - STACK_CROP) * (STACK_W / SCR.w / IMG_R);
      const fit = (vh - HDR - BELOW_GAP - below.offsetHeight - 24) / photoH;
      s = Math.max(Math.min(vw * .86 / we, fit), vw * .62 / we);
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
      // Natural momentum: the camera follows the scroll position instead of being bolted to it.
      const target = ease(clamp(p / .72, 0, 1));
      eNow = jump ? target : eNow + (target - eNow) * .16;
      if (Math.abs(target - eNow) > .0005) req(); else eNow = target;
      const e = eNow;
      s = s0 * Math.pow(1 / s0, e);
      Y = HDR + Ah / 2;
      if (!reduce) screen.style.setProperty('--g', clamp((e - .12) / .7, 0, 1));
      hint.style.opacity = 1 - clamp(p / .06, 0, 1);
    } else if (mode === 'stacked') {
      // Whole shopfront from the sign down to the pavement, then the statement + CTAs beneath it.
      const top = HDR - STACK_CROP * BH * s, bottom = top + BH * s;
      Y = top + s * cy;
      below.style.top = Math.round(bottom + BELOW_GAP) + 'px';  // clears the bags and their captions
      const h = Math.ceil(bottom + BELOW_GAP + below.offsetHeight + 32);
      scroller.style.height = stage.style.height = h + 'px';
    } else if (mode === 'still') {
      s = clamp(Math.max(we * Z0, vw * SCR.w), 0, we) / we;
      Y = HDR + Ah / 2;
    } else {
      Y = HDR + Ah / 2;
    }

    world.style.width = BW + 'px';
    world.style.height = BH + 'px';
    world.style.fontSize = BH / 100 + 'px';                   // 1em = 1% of the photo height (bag captions)
    world.style.setProperty('--inv', 1 / s);                  // lets labels keep a real-pixel size when scaled
    world.style.transform = `translate(${vw / 2 - s * cx}px,${Y - s * cy}px) scale(${s})`;
    placeZoom();
    jump = false;
  }
  const req = () => { if (!raf) raf = requestAnimationFrame(update); };
  update();
  // Only the zoom layout depends on scroll. Elsewhere, ignore the resizes a phone fires when its
  // address bar shows/hides (height-only) — re-laying the hero on those caused visible jumps.
  let lastW = innerWidth;
  addEventListener('scroll', () => { if (mode === 'zoom') req(); else if (zoom) placeZoom(); }, { passive: true });
  addEventListener('resize', () => {
    if (mode !== 'zoom' && innerWidth === lastW) return;
    lastW = innerWidth; jump = true; req();
  });
  if (document.fonts) document.fonts.ready.then(req);

  /* ── Touching an object: a bag turns slightly under the cursor, then settles ── */
  const bagEls = document.querySelectorAll('[data-bag]');
  if (!reduce) bagEls.forEach(bag => {
    bag.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const r = bag.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width * 2 - 1, y = (e.clientY - r.top) / r.height * 2 - 1;
      bag.style.setProperty('--bry', x * 9 + 'deg');
      bag.style.setProperty('--brx', -y * 4 + 'deg');
    });
    bag.addEventListener('pointerleave', () => { bag.style.removeProperty('--bry'); bag.style.removeProperty('--brx'); });
  });

  /* ── Bag → the window puts that storefront on display ────── */
  const bags = [...document.querySelectorAll('[data-bag]')];
  const DISPLAY = { side: 'interiorem', chair: 'chair' };
  let showKey = null;
  function openZoom(key) {
    bags.forEach(b => b.classList.toggle('is-on', b.dataset.bag === key));
    showKey = key; world.dataset.show = DISPLAY[key];
  }
  function placeZoom() {}
  closeZoom = function () {
    if (!showKey) return;
    bags.forEach(b => b.classList.remove('is-on'));
    showKey = null; world.dataset.show = 'home';
  };
  bags.forEach(bag => {
    const key = bag.dataset.bag;
    bag.addEventListener('pointerenter', e => e.pointerType === 'mouse' && openZoom(key));
    bag.addEventListener('pointerleave', e => e.pointerType === 'mouse' && closeZoom());
    bag.addEventListener('focus', () => bag.matches(':focus-visible') && openZoom(key));   // keyboard only
    bag.addEventListener('blur', closeZoom);
    bag.addEventListener('click', e => {
      // The bag is an entrance: mouse / keyboard select opens the project page;
      // on touch the first tap previews it in the window, the second walks in.
      e.stopPropagation();
      const showing = showKey === key;
      if (e.pointerType === 'touch' && !showing) openZoom(key); else { closeZoom(); location.href = bag.dataset.href; }
    });
  });
  document.addEventListener('click', closeZoom);
  })();

  /* ── Header: each word rolls up into its heavier self; a blue rule reads the page ── */
  document.querySelectorAll('.nav a').forEach(a => {
    const t = a.textContent.trim();
    a.innerHTML = `<span class="nl"><span class="nl-a">${t}</span><span class="nl-b" aria-hidden="true">${t}</span></span>`;
  });
  let readRaf = 0;
  const read = () => {
    readRaf = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    header.style.setProperty('--read', max > 0 ? (scrollY / max).toFixed(4) : 0);
  };
  addEventListener('scroll', () => { if (!readRaf) readRaf = requestAnimationFrame(read); }, { passive: true });
  read();

  /* ── The shopfront, recurring: Work, Services and the closing call change its display ── */
  const sfWork = $('.sf-work'), rows = [...document.querySelectorAll('[data-display]')];
  if (sfWork && rows.length) {
    const pick = row => {
      rows.forEach(r => r.classList.toggle('is-on', r === row));
      sfWork.dataset.show = row.dataset.display; sfWork.href = row.href;
    };
    rows.forEach(r => { r.addEventListener('pointerenter', () => pick(r)); r.addEventListener('focus', () => pick(r)); });
    pick(rows[0]);
    // Touch: the shopfront is pinned; the storefront just passing beneath it is the one on display
    if (!matchMedia('(hover: hover)').matches) {
      let wRaf = 0;
      const follow = () => {
        wRaf = 0;
        const line = sfWork.getBoundingClientRect().bottom + 140;
        let cur = rows[0];
        rows.forEach(r => { if (r.getBoundingClientRect().top < line) cur = r; });
        if (!cur.classList.contains('is-on')) pick(cur);
      };
      addEventListener('scroll', () => { if (!wRaf) wRaf = requestAnimationFrame(follow); }, { passive: true });
    }
  }
  const sfSvc = $('.sf-svc');
  if (sfSvc) document.querySelectorAll('.svc > li').forEach((li, i) => {
    const on = () => sfSvc.dataset.hl = i + 1, off = () => delete sfSvc.dataset.hl;
    li.addEventListener('pointerenter', on); li.addEventListener('pointerleave', off);
    li.addEventListener('focusin', on); li.addEventListener('focusout', off);
  });
  // Closing time: the window stands empty for a moment, then the question appears in it
  document.querySelectorAll('[data-sf-empty]').forEach(sf => {
    if (reduce || !('IntersectionObserver' in window)) { sf.classList.add('lit'); return; }
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      io.disconnect(); setTimeout(() => sf.classList.add('lit'), 700);
    }, { threshold: .55 });
    io.observe(sf);
  });

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
  menu.addEventListener('keydown', e => {                    // modal: Tab cycles within the menu
    if (e.key !== 'Tab') return;
    const f = [...menu.querySelectorAll('a, button')], first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (menu.classList.contains('open')) setMenu(false); else closeZoom();
  });

  /* ── Shop window → browser: the first project opens out as it rises into view ── */
  const wins = document.querySelectorAll('[data-reveal-win]');
  const openers = [...document.querySelectorAll('[data-open]')];
  if (!reduce && openers.length) {
    let oRaf = 0;
    const open = () => {
      oRaf = 0;
      const vh = innerHeight;
      openers.forEach(o => {
        const r = o.getBoundingClientRect();
        const k = ease(clamp((vh * .92 - r.top) / (vh * .7), 0, 1));
        o.style.setProperty('--k', k.toFixed(4));
        o.style.setProperty('--g', clamp(k * 1.15, 0, 1).toFixed(4));
      });
    };
    addEventListener('scroll', () => { if (!oRaf) oRaf = requestAnimationFrame(open); }, { passive: true });
    addEventListener('resize', open);
    open();
  } else openers.forEach(o => o.style.setProperty('--g', 1));

  /* ── Display → discovery: detail windows clear as they come into view ── */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { threshold: .3 });
    wins.forEach(w => io.observe(w));

    /* Directory: the header marks the section you're standing in */
    const links = [...document.querySelectorAll('.nav a, .menu-links a')];
    const sections = [...new Set(links.map(l => l.getAttribute('href')))].filter(h => h.startsWith('#')).map(h => document.querySelector(h)).filter(Boolean);
    const mark = id => sections.length && links.forEach(l => l.getAttribute('href') === '#' + id ? l.setAttribute('aria-current', 'location') : l.removeAttribute('aria-current'));
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
  } else wins.forEach(w => w.classList.add('in'));

  /* ── "The idea": words read in as the paragraph enters view ─ */
  const idea = $('[data-reveal]');
  if (idea) {
  idea.innerHTML = idea.textContent.trim().split(/\s+/)
    .map((w, i) => `<span class="w" style="--i:${i}">${w.replace(/\*([^*]+)\*/g, '<em>$1</em>')}</span>`).join(' ');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { idea.classList.add('in'); io.disconnect(); } }, { threshold: .2 });
    io.observe(idea);
  } else idea.classList.add('in');
  }

  /* ── Contact form ─────────────────────────────────────────
     Posts to a form service if <form action> is set; otherwise opens an email
     to data-email; with neither, it says plainly that it isn't connected yet. */
  const form = $('[data-contact]');
  if (form) {
    const to = (form.dataset.email || '').trim(), status = form.querySelector('[data-status]');
    if (to) {
      const alt = $('[data-email-alt]'), link = $('[data-email-link]');
      link.href = 'mailto:' + to; link.textContent = to; alt.hidden = false;
    }
    form.addEventListener('submit', e => {
      form.classList.add('checked');                         // show errors only after a send attempt
      if (!form.checkValidity()) {
        e.preventDefault();
        form.querySelector(':invalid').focus();
        status.textContent = 'Please fill in the highlighted fields.';
        return;
      }
      if (form.getAttribute('action')) return;               // a form service handles it
      e.preventDefault();
      if (!to) { status.textContent = 'This form isn’t connected yet — please check back soon.'; return; }
      const d = new FormData(form), v = k => (d.get(k) || '').toString().trim();
      const lines = ['Name: ' + v('name'), 'Email: ' + v('email')];
      if (v('company')) lines.push('Brand: ' + v('company'));
      if (v('website')) lines.push('Website: ' + v('website'));
      if (d.getAll('services').length) lines.push('Services: ' + d.getAll('services').join(', '));
      if (v('timeline')) lines.push('Timeline: ' + v('timeline'));
      lines.push('', v('message'));
      location.href = 'mailto:' + to + '?subject=' + encodeURIComponent('New project — ' + (v('company') || v('name'))) +
        '&body=' + encodeURIComponent(lines.join('\n'));
      status.textContent = 'Your email app should open with the enquiry filled in. If it doesn’t, write to ' + to + '.';
    });
  }
})();
