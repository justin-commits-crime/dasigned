/* Dasigned
   - Hero (home page): one storefront window. It is re-dressed slowly, like a shop window changed
     overnight — the lights dim, the display changes, the lights come back — every few seconds;
     held on hover, focus, off-screen, with the pause control, and under reduced motion.
   - Shared by every page: header, menu, glass reveals, the window-to-browser opener, the nav marker,
     the shopfront sections (work, services, closing call), the word reveal and the contact form. */
(() => {
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = s => document.querySelector(s);
  const header = $('[data-header]');

  /* ── Hero: the storefront window ─────────────────────────── */
  const sw = $('[data-sw]');
  if (sw) (() => {
    const frames = [...sw.querySelectorAll('[data-sw-f]')], no = $('[data-sw-no]'), count = $('[data-sw-count]'), pauseBtn = $('[data-sw-pause]');
    const HOLD = 7000, DARK = 650;
    let now = 0, timer = 0, held = false, paused = reduce, away = false;
    const label = n => String(n + 1).padStart(2, '0');
    const setInert = () => frames.forEach((f, i) => { f.inert = i !== now; });
    setInert();
    if (reduce) { pauseBtn.hidden = true; return; }

    function next() {
      sw.classList.add('is-dark');                              // lights down
      setTimeout(() => {
        frames[now].classList.remove('is-on');
        now = (now + 1) % frames.length;
        frames[now].classList.add('is-on');
        no.textContent = count.textContent = label(now);
        setInert();
        sw.classList.remove('is-dark');                         // lights up on the new display
        schedule();
      }, DARK);
    }
    function schedule() {
      clearTimeout(timer);
      if (!held && !paused && !away) timer = setTimeout(next, HOLD);
    }
    const hold = v => { held = v; schedule(); };
    sw.addEventListener('pointerenter', e => e.pointerType === 'mouse' && hold(true));
    sw.addEventListener('pointerleave', e => e.pointerType === 'mouse' && hold(false));
    sw.addEventListener('focusin', () => hold(true));
    sw.addEventListener('focusout', () => hold(false));
    pauseBtn.addEventListener('click', () => {
      paused = !paused;
      pauseBtn.setAttribute('aria-pressed', paused);
      pauseBtn.textContent = paused ? 'Play' : 'Pause';
      schedule();
    });
    if ('IntersectionObserver' in window)
      new IntersectionObserver(([en]) => { away = !en.isIntersecting; schedule(); }, { threshold: .3 }).observe(sw);
    schedule();
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
    if (menu.classList.contains('open')) setMenu(false);
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
