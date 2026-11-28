/* GuideFs V4.6 - benda langit di hero: malam = blackhole (Interstellar), pagi = matahari + halo + burung, sunset = matahari terbenam + cincin emas.
   Canvas 2D ringan. Berhenti otomatis saat hero tidak terlihat / tab disembunyikan. FPS dibatasi di HP. */
(function () {
  const hero = document.getElementById('home'); if (!hero) return;
  const root = document.documentElement, cv = document.createElement('canvas'), cx = cv.getContext('2d');
  cv.id = 'celestial'; cv.setAttribute('aria-hidden', 'true'); hero.insertBefore(cv, hero.firstChild);
  const mob = matchMedia('(max-width:820px)'), reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const TAU = Math.PI * 2, rnd = (a, b) => a + Math.random() * (b - a);
  const COL = [[255, 247, 228], [255, 222, 154], [255, 186, 96], [255, 142, 52], [230, 98, 36], [172, 62, 28]].map(c => 'rgb(' + c + ')');
  const AL = [.2, .4, .62, .88];
  let S = 0, u = 0, dpr = 1, mode = '', t = 0, last = 0, raf = 0, vis = true, parts = [], embers = [], haze, ring;

  const getMode = () => { const m = root.getAttribute('data-theme'); return m === 'light' ? 'day' : m === 'sunset' ? 'sunset' : 'night'; };
  const mk = () => Array.from({ length: 24 }, () => new Path2D());
  const off = () => { const c = document.createElement('canvas'); c.width = c.height = S; return c; };

  function build() {
    const n = mob.matches ? 900 : 2200, rs = u * .27;
    parts = Array.from({ length: n }, () => {
      const r = rs * 1.35 + rs * 3 * Math.pow(Math.random(), 1.5);
      return { r, th: rnd(0, TAU), w: 1.7 * Math.pow(rs * 1.35 / r, 1.5) * rnd(.9, 1.1), j: rnd(.9, 1.1) };
    });
    embers = Array.from({ length: mob.matches ? 36 : 70 }, () => ({ x: rnd(0, S), y: rnd(0, S), v: rnd(.02, .07), ph: rnd(0, TAU), s: rnd(.8, 2.2) }));
    haze = off(); ring = off();
    let g = haze.getContext('2d'); g.translate(u, u); g.scale(1, .34);
    let gr = g.createRadialGradient(0, 0, 0, 0, 0, rs * 4.6);
    gr.addColorStop(0, 'rgba(235,235,240,.30)'); gr.addColorStop(.4, 'rgba(200,200,210,.12)'); gr.addColorStop(1, 'rgba(160,160,170,0)');
    g.fillStyle = gr; g.fillRect(-u, -u * 3, S, S * 3);
    g.setTransform(1, 0, 0, 1, u, u); gr = g.createRadialGradient(0, 0, rs, 0, 0, rs * 2.1);
    gr.addColorStop(0, 'rgba(225,225,232,.20)'); gr.addColorStop(1, 'rgba(200,200,210,0)'); g.fillStyle = gr; g.fillRect(-u, -u, S, S);
    g = ring.getContext('2d'); g.translate(u, u); g.strokeStyle = 'rgba(230,230,236,.16)'; g.lineWidth = u * .05;
    g.beginPath(); g.arc(0, 0, rs * 1.04, 0, TAU); g.stroke();
    g.shadowColor = 'rgba(230,230,236,.95)'; g.shadowBlur = u * .07; g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = Math.max(1.5, u * .011);
    g.beginPath(); g.arc(0, 0, rs * 1.03, 0, TAU); g.stroke(); g.stroke();
  }

  function size() {
    const r = cv.getBoundingClientRect(); if (r.width < 8) return;
    dpr = Math.min(devicePixelRatio || 1, mob.matches ? 1 : 1.5);
    S = Math.round(r.width * dpr); cv.width = cv.height = S; u = S / 2; build(); frame(0);
  }

  function night(dt) {
    const rs = u * .27, k = .15, B = mk(), A = mk(), lw = Math.max(1, u * .0042);
    for (const p of parts) {
      p.th += p.w * dt; const th = p.th, th0 = th - p.w * .05, c = Math.cos(th), s = Math.sin(th), c0 = Math.cos(th0), s0 = Math.sin(th0), r = p.r;
      const bi = Math.min(5, ((r - rs * 1.35) / (rs * 3) * 5.5) | 0), d = .3 + .7 * (.5 - .5 * c), di = Math.min(3, (d * p.j * 4) | 0), L = (s < 0 ? B : A)[bi * 4 + di];
      L.moveTo(u + r * c0, u + r * s0 * k); L.lineTo(u + r * c, u + r * s * k);
      const rho = rs * 1.05 + (r - rs * 1.35) * .2, lo = di - (s > 0 ? 1 : 0); if (lo < 0) continue;
      const La = A[bi * 4 + lo];
      if (s < 0) { La.moveTo(u - rho * c0, u + rho * s0); La.lineTo(u - rho * c, u + rho * s); }
      else { La.moveTo(u + rho * c0, u + rho * s0 * .9); La.lineTo(u + rho * c, u + rho * s * .9); }
    }
    cx.clearRect(0, 0, S, S); cx.lineCap = 'round'; cx.lineWidth = lw; cx.globalCompositeOperation = 'lighter';
    cx.drawImage(haze, 0, 0); set(B);
    cx.globalCompositeOperation = 'source-over'; cx.globalAlpha = 1; cx.fillStyle = '#000'; cx.beginPath(); cx.arc(u, u, rs, 0, TAU); cx.fill();
    cx.globalCompositeOperation = 'lighter'; cx.drawImage(ring, 0, 0); set(A); cx.globalAlpha = 1;
  }
  function set(L) { for (let i = 0; i < 24; i++) { cx.strokeStyle = COL[(i / 4) | 0]; cx.globalAlpha = AL[i & 3]; cx.stroke(L[i]); } }

  function disc(rs, stops, glow) {
    let g = cx.createRadialGradient(u, u, rs * .2, u, u, u); g.addColorStop(0, glow[0]); g.addColorStop(.3, glow[1]); g.addColorStop(1, glow[2]);
    cx.fillStyle = g; cx.fillRect(0, 0, S, S);
    g = cx.createRadialGradient(u, u, 0, u, u, rs); stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
    cx.fillStyle = g; cx.beginPath(); cx.arc(u, u, rs, 0, TAU); cx.fill();
  }

  function day() {
    const rs = u * .22; cx.clearRect(0, 0, S, S);
    cx.save(); cx.translate(u, u); cx.rotate(t * .07);
    const g = cx.createRadialGradient(0, 0, rs, 0, 0, u * .98); g.addColorStop(0, 'rgba(255,240,170,.55)'); g.addColorStop(1, 'rgba(255,240,170,0)');
    cx.fillStyle = g; cx.beginPath();
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, w = i % 2 ? .035 : .06; cx.moveTo(Math.cos(a - w) * rs * 1.1, Math.sin(a - w) * rs * 1.1); cx.lineTo(Math.cos(a) * u * .98, Math.sin(a) * u * .98); cx.lineTo(Math.cos(a + w) * rs * 1.1, Math.sin(a + w) * rs * 1.1); }
    cx.fill(); cx.restore();
    disc(rs, ['#fffdf0', '#fff0b0', '#ffd25a'], ['rgba(255,246,200,.95)', 'rgba(255,226,130,.45)', 'rgba(255,226,130,0)']);
    cx.lineWidth = Math.max(1, dpr * 1.5);
    for (let i = 0; i < 3; i++) { const p = (t * .22 + i / 3) % 1; cx.strokeStyle = 'rgba(255,255,255,' + (.55 * (1 - p)).toFixed(3) + ')'; cx.beginPath(); cx.arc(u, u, rs * (1.25 + p * 1.5), 0, TAU); cx.stroke(); }
    cx.strokeStyle = 'rgba(60,92,128,.75)'; cx.lineWidth = Math.max(1.4, dpr * 1.8); cx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const sp = .018 + i * .006, x = (((t * sp + i * .37) % 1.3) - .15) * S, y = S * (.2 + i * .09) + Math.sin(t * .9 + i * 2) * S * .02, f = Math.sin(t * 7 + i * 1.7) * .5 + .5, sz = S * (.022 + i * .004);
      cx.beginPath(); cx.moveTo(x - sz, y - sz * .2 * f); cx.quadraticCurveTo(x - sz * .45, y - sz * (.55 + .4 * f), x, y); cx.quadraticCurveTo(x + sz * .45, y - sz * (.55 + .4 * f), x + sz, y - sz * .2 * f); cx.stroke();
    }
  }

  function sunset(dt) {
    const rs = u * .24; cx.clearRect(0, 0, S, S);
    disc(rs, ['#fff0b8', '#ffb347', '#ee6a3c'], ['rgba(255,178,84,.85)', 'rgba(255,120,70,.35)', 'rgba(255,100,60,0)']);
    cx.lineCap = 'round';
    [[1.5, [2, 11], 14, 'rgba(255,214,140,.8)', 1.6], [1.95, [], 0, 'rgba(255,200,120,.45)', 1.2], [2.45, [26, 16], -9, 'rgba(255,190,110,.5)', 1.4]].forEach(r => {
      cx.setLineDash(r[1].map(v => v * dpr)); cx.lineDashOffset = -t * r[2] * dpr; cx.strokeStyle = r[3]; cx.lineWidth = r[4] * dpr;
      cx.beginPath(); cx.arc(u, u, rs * r[0], 0, TAU); cx.stroke();
    });
    cx.setLineDash([]); cx.globalCompositeOperation = 'lighter';
    for (const e of embers) {
      e.y -= e.v * S * dt; if (e.y < -4) { e.y = S + 4; e.x = rnd(0, S); }
      const a = Math.max(0, Math.min(1, e.y / S)) * (.5 + .5 * Math.sin(t * 2 + e.ph));
      cx.fillStyle = 'rgba(255,208,120,' + (a * .85).toFixed(3) + ')'; cx.beginPath(); cx.arc(e.x + Math.sin(t * .8 + e.ph) * S * .012, e.y, e.s * dpr, 0, TAU); cx.fill();
    }
    cx.globalCompositeOperation = 'source-over';
  }

  function frame(dt) { t += dt; mode === 'day' ? day() : mode === 'sunset' ? sunset(dt) : night(dt); }
  const fps = () => 1000 / (mob.matches ? 24 : 30);
  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (now - last < fps()) return;
    const dt = Math.min(.1, (now - last) / 1000); last = now; frame(dt);
  }
  function sync() {
    const go = vis && !document.hidden && !reduce.matches && !(mode === 'night' && root.classList.contains('bh-ok'));
    if (go && !raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
    else if (!go && raf) { cancelAnimationFrame(raf); raf = 0; }
    root.classList.toggle('cel-on', vis);
  }
  function setMode() { const m = getMode(); if (m === mode) return; mode = m; if (S) frame(0); sync(); }

  mode = getMode(); setMode();
  new MutationObserver(setMode).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  new IntersectionObserver(e => { vis = e[0].isIntersecting; sync(); }, { threshold: .08 }).observe(hero);
  document.addEventListener('visibilitychange', sync); addEventListener('gf:bh', () => { if (S) frame(0); sync(); });
  if ('ResizeObserver' in window) { let w = 0; new ResizeObserver(() => { const nw = Math.round(cv.getBoundingClientRect().width); if (Math.abs(nw - w) > 24) { w = nw; size(); } }).observe(cv); }
  else addEventListener('resize', size);
  size(); sync();

  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    let q = 0, mx = 0, my = 0;
    addEventListener('pointermove', e => {
      mx = (e.clientX / innerWidth - .5) * -22; my = (e.clientY / innerHeight - .5) * -16;
      if (!q) q = requestAnimationFrame(() => { q = 0; cv.style.setProperty('--px', mx.toFixed(1) + 'px'); cv.style.setProperty('--py', my.toFixed(1) + 'px'); });
    }, { passive: true });
  }
})();
