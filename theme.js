/* GUIDEFs theme.js: tema, navbar liquid glass, scroll halus, awan realistis & Milky Way */
(() => {
  const root = document.documentElement, KEY = 'gf-theme';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const isNight = () => root.dataset.theme === 'night';
  const rnd = Math.random, gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;
  let ready = false;

  /* ---------- TOGGLE TEMA ---------- */
  const btn = document.getElementById('theme-toggle');
  function apply(t) {
    root.dataset.theme = t;
    try { localStorage.setItem(KEY, t); } catch (e) {}
    if (btn) {
      btn.setAttribute('aria-label', t === 'night' ? 'Ganti ke mode sunset' : t === 'sunset' ? 'Ganti ke mode normal' : 'Ganti ke mode night');
      const symbol = btn.querySelector('.theme-symbol');
      if (symbol) symbol.textContent = t === 'night' ? '☾' : t === 'sunset' ? '☼' : '✺';
    }
    if (ready) kick();
  }
  apply(root.dataset.theme || (isNight() ? 'night' : 'light'));
  if (btn) {
    btn.addEventListener('click', () => {
      const modes = ['light', 'sunset', 'night'];
      const cur = root.dataset.theme || 'night';
      const next = modes[(modes.indexOf(cur) + 1) % modes.length];
      if (!document.startViewTransition || reduced.matches) return apply(next);
      const r = btn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      const rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      document.startViewTransition(() => apply(next)).ready.then(() =>
        root.animate({ clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${rad}px at ${x}px ${y}px)`] },
          { duration: 800, easing: 'cubic-bezier(.32,.72,0,1)', pseudoElement: '::view-transition-new(root)' }));
    });
  }

  /* Native scrolling is smoother and cheaper on mobile than a JS scroll loop. */
  root.style.scrollBehavior = reduced.matches ? 'auto' : 'smooth';

  /* ---------- NAVBAR: pill + scroll-spy ---------- */
  const nav = document.getElementById('nav-links');
  if (nav) {
    const links = [...nav.querySelectorAll('a')], pill = nav.querySelector('.nav-pill');
    let cur = null, lock = 0;
    const move = (l, anim = true) => {
      if (!l || !pill) return;
      if (!anim) pill.style.transition = 'none';
      pill.style.width = l.offsetWidth + 'px';
      pill.style.transform = `translateX(${l.offsetLeft}px)`;
      if (!anim) { pill.offsetWidth; pill.style.transition = ''; }
      else if (cur && cur !== l && !reduced.matches) {
        pill.classList.add('stretch'); setTimeout(() => pill.classList.remove('stretch'), 300);
      }
      links.forEach(a => a.classList.toggle('active', a === l)); cur = l;
    };
    links.forEach(a => a.addEventListener('click', () => { lock = Date.now() + 1100; move(a); }));
    const map = { home: 0, about: 1, education: 1, hobbies: 2, portfolio: 3, contact: 4 };
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting && Date.now() > lock) move(links[map[e.target.id]]);
    }), { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(id => { const s = document.getElementById(id); s && io.observe(s); });
    move(links.find(a => a.getAttribute('href') === location.hash) || links[0], false);
    addEventListener('resize', () => move(cur, false));
    document.fonts && document.fonts.ready.then(() => move(cur, false));
  }

  /* ---------- AWAN REALISTIS (digambar sekali di canvas) ---------- */
  const skyDay = document.querySelector('.sky-day');
  function makeCloud() {
    const w = 560, h = 233, k = Math.min(devicePixelRatio || 1, 1.5);
    const c = document.createElement('canvas'); c.width = w * k; c.height = h * k;
    const g = c.getContext('2d'); g.scale(k, k);
    const base = h * .78, P = [];
    const soft = (x, y, r, col, al) => {
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, `rgba(${col},${al})`); gr.addColorStop(.55, `rgba(${col},${al * .72})`); gr.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    };
    for (let i = 0; i < 120; i++) {
      const t = rnd(), dome = Math.pow(Math.sin(Math.PI * t), .8), r = h * (.08 + .15 * rnd()) * (.4 + .85 * dome);
      P.push([w * (.06 + .88 * t) + gauss() * w * .03, base - r * .4 - Math.pow(rnd(), 1.2) * dome * h * .55, r]);
    }
    P.sort((a, b) => a[1] - b[1]);
    for (const [x, y, r] of P) soft(x, y + r * .22, r * 1.15, '196,214,241', .55);
    for (const [x, y, r] of P) soft(x - r * .1, y - r * .14, r, '255,255,255', .8);
    g.globalCompositeOperation = 'source-atop';
    let sh = g.createLinearGradient(0, base - h * .4, 0, base + 4);
    sh.addColorStop(0, 'rgba(150,178,220,0)'); sh.addColorStop(1, 'rgba(128,158,206,.5)');
    g.fillStyle = sh; g.fillRect(0, 0, w, h);
    sh = g.createLinearGradient(0, 0, 0, h * .45);
    sh.addColorStop(0, 'rgba(255,248,228,.35)'); sh.addColorStop(1, 'rgba(255,248,228,0)');
    g.fillStyle = sh; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'destination-in';
    const m = g.createLinearGradient(0, base - h * .05, 0, base + h * .1);
    m.addColorStop(0, '#000'); m.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = m; g.fillRect(0, 0, w, h);
    return c;
  }
  if (skyDay && skyDay.children.length === 0) {
    [[6, 9, 340, 24, -12, 52, .95], [58, 6, 260, -18, -16, 44, .8], [30, 30, 420, 30, -22, 60, .92], [74, 38, 300, -26, -18, 48, .88],
     [-4, 56, 380, 20, -30, 66, .85], [52, 64, 460, -30, -26, 58, .95], [84, 78, 280, -14, -34, 50, .8], [18, 84, 340, 26, -38, 62, .9]]
      .forEach(([x, y, w, dx, dy, t, o]) => {
        const d = document.createElement('div'), i = document.createElement('i');
        d.className = 'cloud'; d.style.cssText = `--x:${x}%;--y:${y}%;--w:${w}px;--dx:${dx};--dy:${dy};--t:${t}s;--o:${o}`;
        i.appendChild(makeCloud()); d.appendChild(i); skyDay.appendChild(d);
      });
  }

  /* ---------- MILKY WAY REALISTIS (noise fbm) ---------- */
  const cv = document.getElementById('sky-night');
  if (cv) {
    const cx = cv.getContext('2d');
    let W, H, dpr, S, band, stars = [], shoot = null, nextShoot = 4000, target = 0, sp = 0, raf = 0, lastFrame = 0;
    const NT = 256, nt = Float32Array.from({ length: NT * NT }, rnd);
    function vn(x, y) {
      const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      const a = nt[((yi & 255) << 8) | (xi & 255)], b = nt[((yi & 255) << 8) | ((xi + 1) & 255)];
      const c = nt[(((yi + 1) & 255) << 8) | (xi & 255)], d = nt[(((yi + 1) & 255) << 8) | ((xi + 1) & 255)];
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    }
    const fbm = (x, y) => { let s = 0, a = .5; for (let i = 0; i < 5; i++) { s += a * vn(x, y); x *= 2.03; y *= 2.03; a *= .5; } return s; };
    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

    function build() {
      dpr = Math.min(devicePixelRatio || 1, W < 769 ? 1 : 1.25); W = innerWidth; H = innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      S = Math.ceil(Math.hypot(W, H) * 1.25);
      const gw = W < 769 ? 176 : 280, im = new ImageData(gw, gw), L = new Float32Array(gw * gw), D = new Float32Array(gw * gw);
      const ox = rnd() * 60, oy = rnd() * 60;
      for (let py = 0; py < gw; py++) for (let px = 0; px < gw; px++) {
        const u = px / gw - .5, v = py / gw - .5;
        const sig = .042 + .034 * Math.exp(-Math.pow((u + .1) / .22, 2));
        const prof = Math.exp(-(v * v) / (sig * sig)), haze = Math.exp(-(v * v) / (sig * sig * 9));
        const core = Math.exp(-Math.pow((u + .1) / .2, 2));
        const n = fbm(u * 5 + ox, v * 12 + oy), n2 = fbm(u * 10 + ox + 40, v * 26 + oy + 17);
        const dust = clamp((n2 - .46) * 3.2) * Math.exp(-(v * v) / (sig * sig * 1.6));
        const rift = Math.exp(-Math.pow((v - .004 * Math.sin(u * 14)) / (.011 + .01 * n), 2)) * (.55 + .45 * n) * (.4 + .8 * core);
        const lum = clamp((prof * (.4 + 1.1 * n) * (.5 + .9 * core) + haze * .14 * n) * (1 - .8 * dust) * (1 - .75 * Math.min(1, rift)), 0, 1.2);
        const l = Math.min(1, lum * 1.1), w = Math.min(1, core * lum * 1.5), i = (py * gw + px) * 4;
        im.data[i] = 62 + 112 * l + 28 * w; im.data[i + 1] = 91 + 124 * l + 30 * w; im.data[i + 2] = 112 + 126 * l + 20 * w;
        im.data[i + 3] = Math.min(255, Math.pow(lum, 1.3) * 120); L[py * gw + px] = lum; D[py * gw + px] = dust;
      }
      const lo = document.createElement('canvas'); lo.width = lo.height = gw; lo.getContext('2d').putImageData(im, 0, 0);
      const k = Math.min(dpr * (W < 769 ? .52 : .7), (W < 769 ? 1250 : 1900) / S);
      band = document.createElement('canvas'); band.width = band.height = Math.ceil(S * k);
      const b = band.getContext('2d'); b.scale(k, k); b.translate(S / 2, S / 2); b.rotate(-.5);
      b.imageSmoothingQuality = 'high'; b.drawImage(lo, -S / 2, -S / 2, S, S);
      const cols = ['218,231,235', '160,195,205', '255,230,196'];
      for (let i = 0, n = 0; i < 6500 && n < 2200; i++) {
        const u = rnd() - .5, v = gauss() * .09, gx = (u + .5) * gw | 0, gy = clamp(v + .5) * gw | 0, id = gy * gw + gx;
        if (rnd() > L[id] * .9 + .03 || rnd() < D[id] * .85) continue;
        n++; const a = .2 + rnd() * rnd() * .8, t = rnd(), s = .3 + rnd() * (rnd() < .03 ? 1.4 : .7);
        b.fillStyle = `rgba(${cols[t < .6 ? 0 : t < .85 ? 1 : 2]},${a})`; b.fillRect(u * S, v * S, s, s);
      }
      stars = Array.from({ length: Math.min(W < 769 ? 54 : 105, W * H / (W < 769 ? 26000 : 17000) | 0) }, () => ({
        x: rnd() * W, y: rnd() * H, r: .4 + rnd() * rnd() * 1.5, p: rnd() * 6.28, v: .6 + rnd() * 1.8,
        d: .2 + rnd() * .8, c: rnd() < .15 ? '255,225,190' : rnd() < .5 ? '190,205,255' : '255,255,255'
      }));
    }

    function draw(t) {
      const g = cx.createLinearGradient(0, 0, 0, H * dpr);
      g.addColorStop(0, '#02030a'); g.addColorStop(.55, '#050918'); g.addColorStop(1, '#0a0a1a');
      cx.setTransform(1, 0, 0, 1, 0, 0); cx.fillStyle = g; cx.fillRect(0, 0, cv.width, cv.height);
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx.save(); cx.translate(W / 2, H / 2 - sp * H * .22);
      cx.rotate(sp * .16 + t * 3e-6); cx.drawImage(band, -S / 2, -S / 2, S, S); cx.restore();
      for (const s of stars) {
        const a = .55 + .45 * Math.sin(t * .001 * s.v + s.p), y = ((s.y - sp * s.d * 160) % H + H) % H;
        cx.fillStyle = `rgba(${s.c},${a * (.35 + s.r / 2.2)})`; cx.beginPath(); cx.arc(s.x, y, s.r, 0, 6.283); cx.fill();
      }
      if (!reduced.matches) {
        if (!shoot && t > nextShoot) shoot = { x: rnd() * W * .8, y: rnd() * H * .4, a: .5 + rnd() * .3, t0: t };
        if (shoot) {
          const p = (t - shoot.t0) / 900, L = 140;
          if (p > 1) { shoot = null; nextShoot = t + 5000 + rnd() * 7000; }
          else {
            const x = shoot.x + Math.cos(shoot.a) * p * 420, y = shoot.y + Math.sin(shoot.a) * p * 420;
            const tg = cx.createLinearGradient(x, y, x - Math.cos(shoot.a) * L, y - Math.sin(shoot.a) * L);
            tg.addColorStop(0, `rgba(255,255,255,${1 - p})`); tg.addColorStop(1, 'rgba(255,255,255,0)');
            cx.strokeStyle = tg; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(x, y);
            cx.lineTo(x - Math.cos(shoot.a) * L, y - Math.sin(shoot.a) * L); cx.stroke();
          }
        }
      }
    }
    function readScroll() { const h = root.scrollHeight - innerHeight; target = h > 0 ? scrollY / h : 0; kick(); }
    function loop(t) {
      raf = 0; if (document.hidden) return;
      const frameGap = innerWidth < 769 ? 66 : 40;
      if (isNight() && !reduced.matches && t - lastFrame < frameGap) { raf = requestAnimationFrame(loop); return; }
      lastFrame = t;
      sp += (target - sp) * (reduced.matches ? 1 : .06);
      root.style.setProperty('--sp', sp.toFixed(4));
      if (isNight()) draw(t);
      if ((isNight() && !reduced.matches) || Math.abs(target - sp) > .0004) raf = requestAnimationFrame(loop);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(loop); }

    build(); readScroll(); ready = true;
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { build(); kick(); }, 250); });
    addEventListener('scroll', readScroll, { passive: true });
    document.addEventListener('visibilitychange', kick);
    new MutationObserver(kick).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    kick();
  } else {
    ready = true;
  }

  /* ---------- TAB SWITCHER (Portfolio Showcase) ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.portfolio-tab-btn');
    const tabContents = document.querySelectorAll('.portfolio-tab-content');
    if (tabBtns.length > 0) {
      tabBtns.forEach(b => {
        b.addEventListener('click', () => {
          const target = b.getAttribute('data-tab');
          tabBtns.forEach(btn => btn.classList.remove('active'));
          tabContents.forEach(c => c.classList.remove('active'));
          b.classList.add('active');
          const tEl = document.getElementById('tab-' + target);
          if (tEl) tEl.classList.add('active');
        });
      });
    }
  });

})();
