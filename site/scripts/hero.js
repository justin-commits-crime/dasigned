/* Dasigned
   - Hero: the storefront photo is a "world" whose shop window holds the real website.
     The website is laid out at its final on-screen size; scrolling zooms the world about
     the window from ~66% up to exactly 100%, so the copy is legible and the CTAs live
     from the first frame, and nothing is ever upscaled.
   - Paper bags sway in 3D; hover / focus / tap previews that project in the window.
   - Header menu (small screens) and an on-view word reveal for "The idea". */
(() => {
  const IMG_R = 1678 / 937;                                   // storefront photo aspect
  const SCR = { x: .3039, y: .2102, w: .3903, h: .5848 };     // shop window, as fractions of the photo
  const WIN_R = (SCR.w * IMG_R) / SCR.h;                      // shop window aspect (~1.195)
  const WIN_PHOTO_H = 1 / (SCR.w * IMG_R);                    // photo height per px of window width
  const Z0 = .66;                                             // opening size of the window vs. final
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;

  const $ = s => document.querySelector(s);
  const root = document.documentElement, header = $('[data-header]');
  const scroller = $('[data-hero]'), stage = $('[data-stage]'), world = $('[data-world]'), screen = $('[data-screen]'),
    glass = $('[data-glass]'), hint = $('[data-hint]'), probe = $('[data-probe]');

  /* ── Layout + scroll zoom ────────────────────────────────── */
  let mode = '', raf = 0, zoom = null, zoomKey = null, zoomTimer = 0;
  function setMode(m) {
    if (m === mode) return;
    root.classList.remove('m-' + mode); root.classList.add('m-' + m); mode = m;
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
      glass.style.opacity = 1 - clamp((e - .25) / .55, 0, 1);
      hint.style.opacity = 1 - clamp(p / .06, 0, 1);
    } else if (mode === 'stacked') {
      const top = HDR - .08 * BH;                             // fascia + sign just under the header
      Y = top + cy;
      const h = Math.ceil(top + BH + 128);                    // photo, then the CTA bar
      scroller.style.height = stage.style.height = h + 'px';
      glass.style.opacity = .6;
    } else {
      Y = HDR + Ah / 2;
      glass.style.opacity = .6;
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

  /* ── 3D bag motion ───────────────────────────────────────── */
  if (!reduce) {
    let tx = 0, ty = 0, mx = 0, my = 0, last = -1e9;
    const onTilt = ev => {
      if (ev.gamma == null) return;
      tx = clamp(ev.gamma / 25, -1, 1); ty = clamp((ev.beta - 45) / 25, -1, 1); last = performance.now();
    };
    const askTilt = () => {
      const D = window.DeviceOrientationEvent;
      if (D && typeof D.requestPermission === 'function')
        D.requestPermission().then(r => r === 'granted' && addEventListener('deviceorientation', onTilt)).catch(() => {});
    };
    if (coarse) { addEventListener('deviceorientation', onTilt); addEventListener('touchend', askTilt, { once: true }); }
    addEventListener('pointermove', ev => {
      tx = ev.clientX / innerWidth * 2 - 1; ty = ev.clientY / innerHeight * 2 - 1; last = performance.now();
    }, { passive: true });
    const tick = now => {
      requestAnimationFrame(tick);
      const idle = clamp((now - last - 1500) / 1500, 0, 1), t = now / 1000;
      const gx = tx * (1 - idle) + Math.sin(t * .35) * .45 * idle;
      const gy = ty * (1 - idle) + Math.sin(t * .27 + 1) * .35 * idle;
      mx += (gx - mx) * .06; my += (gy - my) * .06;
      world.style.setProperty('--bry', mx * 8 + 'deg');
      world.style.setProperty('--brx', -my * 4 + 'deg');
      world.style.setProperty('--bsw', Math.sin(t * .8) * .8 + '');
    };
    requestAnimationFrame(tick);
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
    bag.addEventListener('click', e => {                     // touch: tap toggles; mouse is already open
      e.stopPropagation();
      const showing = zoom && zoomKey === key && !zoom.classList.contains('fade');
      if (showing && e.pointerType !== 'mouse' && e.detail) closeZoom(); else openZoom(key);
    });
  });
  document.addEventListener('click', closeZoom);

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

  /* ── "The idea": words read in as the paragraph enters view ─ */
  const idea = $('[data-reveal]');
  idea.innerHTML = idea.textContent.trim().split(/\s+/)
    .map((w, i) => `<span class="w" style="--i:${i}">${w.replace(/\*([^*]+)\*/g, '<em>$1</em>')}</span>`).join(' ');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { idea.classList.add('in'); io.disconnect(); } }, { threshold: .35 });
    io.observe(idea);
  } else idea.classList.add('in');
})();
