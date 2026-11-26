/* GUIDEFs theme.js V4.4: tema (Normal / Sunset / Night), navbar liquid glass, langit & awan, Milky Way.
   Catatan performa: tidak ada View Transition API (sering janggal di HP), --sp tidak ditulis ke <html>,
   dan canvas tidak dibangun ulang saat address-bar HP naik/turun. */
(() => {
  const root = document.documentElement, KEY = 'gf-theme';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const MODES = ['light', 'sunset', 'night'];
  const isNight = () => root.dataset.theme === 'night';
  const isSmall = () => innerWidth < 769;
  const rnd = Math.random, gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  let ready = false, wiping = false;

  /* ---------- TEMA + ANIMASI WIPE RINGAN ---------- */
  const btn = document.getElementById('theme-toggle');
  const META = { night: '#050d17', sunset: '#2c2a78', light: '#4b9cdb' };
  const WIPE = {
    night: 'radial-gradient(circle at 50% 35%,#10283a,#050d17 70%)',
    sunset: 'linear-gradient(180deg,#2c2a78 0%,#b6487e 55%,#ff9a57 100%)',
    light: 'linear-gradient(180deg,#4b9cdb 0%,#8dc9ef 45%,#e3eef3 100%)'
  };
  const SYMBOL = { night: '☾', sunset: '☼', light: '✺' };
  function apply(t) {
    root.dataset.theme = t;
    try { localStorage.setItem(KEY, t); } catch (e) {}
    let m = document.querySelector('meta[name="theme-color"]');
    if (!m) { m = document.createElement('meta'); m.name = 'theme-color'; document.head.appendChild(m); }
    m.content = META[t];
    if (btn) {
      const nxt = MODES[(MODES.indexOf(t) + 1) % 3];
      btn.setAttribute('aria-label', 'Ganti ke mode ' + (nxt === 'light' ? 'normal' : nxt));
      const s = btn.querySelector('.theme-symbol'); if (s) s.textContent = SYMBOL[t];
    }
    if (ready) kick();
  }
  if (!MODES.includes(root.dataset.theme)) root.dataset.theme = 'night';
  apply(root.dataset.theme);

  function switchTheme(next, x, y) {
    if (wiping) return;
    if (reduced.matches) return apply(next);
    wiping = true;
    const rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 4;
    const w = document.createElement('div');
    w.className = 'theme-wipe';
    w.style.cssText = `left:${x - rad}px;top:${y - rad}px;width:${rad * 2}px;height:${rad * 2}px;background:${WIPE[next]}`;
    document.body.appendChild(w);
    const grow = w.animate([{ transform: 'scale(.001)' }, { transform: 'scale(1)' }],
      { duration: isSmall() ? 520 : 640, easing: 'cubic-bezier(.32,.72,0,1)', fill: 'forwards' });
    grow.onfinish = () => {
      root.classList.add('no-trans');          // ganti tema saat tertutup: tanpa transisi yang kedap-kedip
      apply(next);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        root.classList.remove('no-trans');
        const out = w.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, easing: 'ease-out', fill: 'forwards' });
        out.onfinish = () => { w.remove(); wiping = false; };
      }));
    };
  }
  btn && btn.addEventListener('click', () => {
    const r = btn.getBoundingClientRect();
    switchTheme(MODES[(MODES.indexOf(root.dataset.theme) + 1) % 3], r.left + r.width / 2, r.top + r.height / 2);
  });

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
    let lw = innerWidth;
    addEventListener('resize', () => { if (innerWidth !== lw) { lw = innerWidth; move(cur, false); } });
    document.fonts && document.fonts.ready.then(() => move(cur, false));
  }

  /* ---------- LANGIT: awan siang & stratus sunset (digambar sekali) ---------- */
  const sky = document.querySelector('.sky');
  const cloudsEl = document.querySelector('.sky-clouds');
  const groups = [];
  const dprC = Math.min(devicePixelRatio || 1, isSmall() ? 1 : 1.25);
  function newCanvas(w, h) {
    const c = document.createElement('canvas'); c.width = Math.round(w * dprC); c.height = Math.round(h * dprC);
    const g = c.getContext('2d'); g.scale(dprC, dprC); return [c, g];
  }
  function makeDayCloud() {
    const w = 480, h = 200, [c, g] = newCanvas(w, h), base = h * .86, P = [];
    const soft = (x, y, r, col, al) => {
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, `rgba(${col},${al})`); gr.addColorStop(.55, `rgba(${col},${al * .72})`); gr.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    };
    for (let i = 0; i < (isSmall() ? 70 : 100); i++) {
      const t = rnd(), dome = Math.pow(Math.sin(Math.PI * t), .8), r = h * (.07 + .12 * rnd()) * (.4 + .85 * dome);
      P.push([w * (.06 + .88 * t) + gauss() * w * .03, base - r * .4 - Math.pow(rnd(), 1.2) * dome * h * .45, r]);
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
  function makeStratus() {      // awan memanjang saat senja: atas ungu, bawah disinari matahari
    const w = 720, h = 150, [c, g] = newCanvas(w, h), P = [];
    const el = (x, y, rx, ry, col, a) => {
      g.save(); g.translate(x, y); g.scale(1, ry / rx);
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx);
      gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(.6, `rgba(${col},${a * .6})`); gr.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = gr; g.fillRect(-rx, -rx, rx * 2, rx * 2); g.restore();
    };
    for (let i = 0; i < (isSmall() ? 60 : 90); i++) {
      const t = rnd(), env = Math.pow(Math.sin(Math.PI * t), .7), rx = h * (.2 + .34 * rnd()) * (.5 + env);
      P.push([w * (.04 + .92 * t) + gauss() * w * .02, h * .52 + gauss() * h * .1 * (.4 + env), rx, rx * (.2 + .12 * rnd()), env]);
    }
    for (const [x, y, rx, ry, e] of P) el(x, y - ry * .2, rx, ry, '92,52,120', .5 * e + .12);
    for (const [x, y, rx, ry, e] of P) el(x, y + ry * .55, rx * .85, ry * .8, '255,128,96', .48 * (.5 + e * .5));
    P.forEach(([x, y, rx, ry], i) => { if (i % 3 === 0) el(x, y + ry * .95, rx * .6, ry * .35, '255,214,150', .6); });
    P.forEach(([x, y, rx, ry], i) => { if (i % 4 === 0) el(x, y - ry * .6, rx * .7, ry * .5, '186,136,196', .22); });
    g.globalCompositeOperation = 'destination-in';
    const m = g.createLinearGradient(0, 0, w, 0);
    m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(.12, '#000'); m.addColorStop(.88, '#000'); m.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = m; g.fillRect(0, 0, w, h);
    return c;
  }
  if (cloudsEl && !cloudsEl.children.length) {
    const sm = isSmall(), K = sm ? .6 : 1;
    // [x%, y%, lebar px, opasitas, detik drift]
    const DAY = {
      far: sm ? [[10, 12, 200, .8, 90], [56, 30, 220, .75, 100]] : [[8, 10, 300, .8, 90], [62, 7, 240, .7, 80], [40, 32, 320, .75, 100]],
      near: sm ? [[-8, 55, 300, .92, 110], [48, 74, 320, .95, 120]] : [[-3, 52, 400, .92, 110], [55, 60, 440, .95, 120], [78, 22, 300, .85, 90], [22, 80, 360, .9, 100]]
    };
    const SUN = {
      far: sm ? [[4, 28, 300, .5, 120], [50, 40, 300, .45, 130]] : [[4, 26, 460, .5, 120], [58, 20, 420, .45, 130], [28, 38, 380, .5, 140]],
      near: sm ? [[-10, 52, 470, .8, 150], [40, 80, 520, .9, 160], [-5, 88, 480, .85, 140]] : [[-6, 50, 720, .8, 150], [62, 52, 520, .75, 130], [-2, 78, 800, .9, 160], [52, 80, 760, .88, 140]]
    };
    const build = (cls, make, set) => ['far', 'near'].forEach(layer => {
      let g = groups.find(o => o.layer === layer);
      if (!g) { const d = document.createElement('div'); d.className = 'cl-group'; cloudsEl.appendChild(d); g = { layer, el: d, k: layer === 'far' ? .05 : .14 }; groups.push(g); }
      set[layer].forEach(([x, y, w, o, dur]) => {
        const d = document.createElement('div'), i = document.createElement('i');
        d.className = 'cl ' + cls; d.style.cssText = `left:${x}%;top:${y}%;width:${Math.round(w * (cls === 'cl-day' ? K : 1))}px;--o:${o}`;
        i.style.setProperty('--d', dur + 's'); i.appendChild(make()); d.appendChild(i); g.el.appendChild(d);
      });
    });
    build('cl-day', makeDayCloud, DAY); build('cl-sun', makeStratus, SUN);
  }

  /* ---------- LOOP TUNGGAL: scroll halus + Milky Way ---------- */
  let target = 0, sp = 0, raf = 0, lastFrame = 0, lastPar = -1;
  const cv = document.getElementById('sky-night'), cx = cv && cv.getContext('2d');
  let W = innerWidth, H = innerHeight, dpr = 1, S = 0, band = null, stars = [], shoot = null, nextShoot = 4000, bw = 0, bh = 0;

  function parallax() {
    if (isNight() || Math.abs(sp - lastPar) < .0004) return;
    lastPar = sp;
    if (sky) sky.style.setProperty('--sp', sp.toFixed(3));
    for (const g of groups) g.el.style.transform = `translate3d(0,${(-sp * H * g.k).toFixed(1)}px,0)`;
  }

  if (cv) {
    const NT = 256, nt = Float32Array.from({ length: NT * NT }, rnd);
    const vn = (x, y) => {
      const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      const a = nt[((yi & 255) << 8) | (xi & 255)], b = nt[((yi & 255) << 8) | ((xi + 1) & 255)];
      const c = nt[(((yi + 1) & 255) << 8) | (xi & 255)], d = nt[(((yi + 1) & 255) << 8) | ((xi + 1) & 255)];
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    };
    const fbm = (x, y) => { let s = 0, a = .5; for (let i = 0; i < 5; i++) { s += a * vn(x, y); x *= 2.03; y *= 2.03; a *= .5; } return s; };
    const buildNight = () => {
      W = innerWidth; H = innerHeight; bw = W; bh = H;
      dpr = Math.min(devicePixelRatio || 1, W < 769 ? 1 : 1.25);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
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
    };
    var drawNight = t => {
      if (!band) buildNight();
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
    };
  }
  function frame(t) {
    raf = 0; if (document.hidden) return;
    const night = isNight(), anim = night && !reduced.matches;
    if (anim && t - lastFrame < (isSmall() ? 66 : 40)) { raf = requestAnimationFrame(frame); return; }
    lastFrame = t;
    const d = target - sp; sp += d * (reduced.matches ? 1 : .09); if (Math.abs(d) < .0003) sp = target;
    if (night) { if (drawNight) drawNight(t); } else parallax();
    if (anim || Math.abs(target - sp) > .0003) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  const progBar = document.querySelector('.scroll-progress i');
  const readScroll = () => {
    const h = root.scrollHeight - innerHeight; target = h > 0 ? clamp(scrollY / h) : 0;
    if (progBar) progBar.style.transform = `scaleX(${target.toFixed(4)})`;   // garis progres scroll (transform saja, ringan)
    kick();
  };
  addEventListener('scroll', readScroll, { passive: true });
  // Rebuild hanya jika lebar berubah / tinggi berubah drastis. Address-bar HP yang naik-turun TIDAK memicu rebuild.
  let rt; addEventListener('resize', () => {
    clearTimeout(rt); rt = setTimeout(() => {
      if (Math.abs(innerWidth - bw) > 40 || Math.abs(innerHeight - bh) > bh * .3) { band = null; if (cv) { W = innerWidth; H = innerHeight; } kick(); }
    }, 300);
  });
  document.addEventListener('visibilitychange', kick);
  ready = true; readScroll(); kick();

  /* ---------- TAB PORTFOLIO + ORNAMEN PEMBATAS ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.portfolio-tab-btn'), tabContents = document.querySelectorAll('.portfolio-tab-content');
    const tabBar = document.querySelector('.portfolio-tabs');
    const tabList = [...tabBtns];
    let tabIdx = Math.max(0, tabList.findIndex(b => b.classList.contains('active')));
    function setTab(i, fromUser) {
      i = Math.max(0, Math.min(tabList.length - 1, i)); if (!tabList[i]) return;
      tabIdx = i;
      tabList.forEach((x, k) => { x.classList.toggle('active', k === i); x.setAttribute('aria-selected', k === i ? 'true' : 'false'); x.tabIndex = k === i ? 0 : -1; });
      tabContents.forEach(c => c.classList.remove('active'));
      const tEl = document.getElementById('tab-' + tabList[i].getAttribute('data-tab')); if (tEl) tEl.classList.add('active');
      if (tabBar) tabBar.style.setProperty('--ti', i);
    }
    tabList.forEach((b, i) => {
      const key = b.getAttribute('data-tab'), panel = document.getElementById('tab-' + key);
      b.setAttribute('role', 'tab'); b.id = b.id || 'tabbtn-' + key;
      if (panel) { b.setAttribute('aria-controls', panel.id); panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', b.id); }
      b.addEventListener('click', () => setTab(i, true));
    });
    setTab(tabIdx);
    /* keyboard: panah kiri/kanan, Home, End (pola WAI-ARIA tabs) */
    if (tabBar) tabBar.addEventListener('keydown', e => {
      const k = e.key, n = tabList.length;
      const to = k === 'ArrowRight' ? (tabIdx + 1) % n : k === 'ArrowLeft' ? (tabIdx - 1 + n) % n : k === 'Home' ? 0 : k === 'End' ? n - 1 : -1;
      if (to < 0) return; e.preventDefault(); setTab(to, true); tabList[to].focus();
    });
    /* swipe kiri/kanan di HP untuk pindah tab (diabaikan bila sentuhan dimulai di area yang bisa di-scroll horizontal) */
    const tabArea = tabContents.length ? tabContents[0].parentElement : null;
    if (tabArea) {
      let sx = 0, sy = 0, st = 0, ok = false;
      const hScroll = el => { for (; el && el !== tabArea; el = el.parentElement) { const o = getComputedStyle(el).overflowX; if ((o === 'auto' || o === 'scroll') && el.scrollWidth > el.clientWidth + 4) return true; } return false; };
      tabArea.addEventListener('touchstart', e => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; st = Date.now(); ok = e.touches.length === 1 && !hScroll(e.target); }, { passive: true });
      tabArea.addEventListener('touchend', e => {
        if (!ok) return; const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
        if (Date.now() - st < 700 && Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.8) setTab(tabIdx + (dx < 0 ? 1 : -1), true);
      }, { passive: true });
    }
    const divs = document.querySelectorAll('.gi-divider');
    if (divs.length && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .4 });
      divs.forEach(d => io.observe(d));
    } else divs.forEach(d => d.classList.add('in'));
  });
})();
