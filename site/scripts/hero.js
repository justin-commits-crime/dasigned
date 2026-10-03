/* Dasigned
   - Hero: the studio as a giant storefront. A three-bay shop window shows one "look" (storefront)
     at a time; looks change on a timer (paused on hover / focus / off-screen / reduced motion),
     by the look buttons, or by a swipe. The glass refracts with the cursor, and the display
     settles as it rises into view. Clicking the glass opens the look on show.
   - Shared by every page: header, menu, glass reveals, the window-to-browser opener, the nav marker,
     the "idea" word reveal and the contact form. */
(() => {
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  const $ = s => document.querySelector(s);
  const header = $('[data-header]');

  /* ── Hero: the shop window (home page only) ──────────────── */
  const shop = $('[data-shop]');
  if (shop) (() => {
    const win = $('[data-win]'), cur = $('[data-cur]'), prog = $('[data-prog]'), lookNo = $('[data-look-no]');
    const chips = [...shop.querySelectorAll('[data-look]')], cards = [...shop.querySelectorAll('[data-card]')];
    const N = cards.length;
    let now = 0, z = 1;

    const label = () => cards[now].querySelector('.hx-card-go').firstChild.textContent.trim() + ' ' +
      cards[now].querySelector('.hx-card-go .arr').textContent;
    cur.textContent = label();

    function restartTimer() {
      if (reduce) return;
      prog.classList.remove('run'); void prog.offsetWidth; prog.classList.add('run');
    }
    function show(n) {
      n = (n + N) % N;
      if (n === now) return;
      z++;
      shop.querySelectorAll(`.lk[data-l="${n}"]`).forEach(l => {
        l.classList.remove('on'); void l.offsetWidth;            // restart the wipe
        l.style.zIndex = z; l.classList.add('on');
      });
      const prev = now;
      setTimeout(() => {                                         // once covered, the old look steps down
        if (now !== prev) shop.querySelectorAll(`.lk[data-l="${prev}"]`).forEach(l => l.classList.remove('on'));
      }, 1300);
      cards[now].hidden = true; cards[n].hidden = false;
      chips[now].setAttribute('aria-pressed', 'false'); chips[n].setAttribute('aria-pressed', 'true');
      now = n;
      lookNo.textContent = String(n + 1).padStart(2, '0');
      cur.textContent = label();
      restartTimer();
    }
    chips.forEach((c, i) => c.addEventListener('click', () => show(i)));
    prog.addEventListener('animationend', () => show(now + 1));

    // Off-screen, the display holds still
    if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => shop.classList.toggle('is-away', !en.isIntersecting)).observe(shop);
    restartTimer();

    // Clicking the glass walks into the look on show
    win.addEventListener('click', e => { if (!e.target.closest('a, button, [data-ui], .hx-card')) location.href = cards[now].querySelector('a').href; });

    // Swipe between looks
    let sx = null, sy = 0;
    win.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    win.addEventListener('touchend', e => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.4) show(now + (dx < 0 ? 1 : -1));
      sx = null;
    }, { passive: true });

    if (reduce) return;

    // The glass refracts: each bay shifts a little differently under the cursor; a label follows it
    let mx = 0, my = 0, raf = 0;
    const paint = () => {
      raf = 0;
      shop.style.setProperty('--mx', mx.toFixed(3));
      shop.style.setProperty('--my', my.toFixed(3));
      const r = shop.getBoundingClientRect(), vh = innerHeight;
      shop.style.setProperty('--rise', clamp((vh - r.top) / (vh * .9), 0, 1).toFixed(3));
    };
    const req = () => { if (!raf) raf = requestAnimationFrame(paint); };
    if (fine) {
      win.addEventListener('pointermove', e => {
        const r = win.getBoundingClientRect();
        mx = (e.clientX - r.left) / r.width * 2 - 1; my = (e.clientY - r.top) / r.height * 2 - 1;
        cur.style.transform = `translate(${e.clientX - r.left}px,${e.clientY - r.top}px)`;
        win.classList.toggle('on-ui', !!e.target.closest('[data-ui], .hx-card'));
        req();
      });
      win.addEventListener('pointerleave', () => { mx = my = 0; req(); });
    }
    addEventListener('scroll', req, { passive: true });
    addEventListener('resize', req);
    paint();
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
