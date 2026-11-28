/* GuideFs V5 - latar partikel interaktif, beda per tema, dipakai index.html & partisi.html.
   night : bintang 3 lapis (parallax mouse + scroll), debu lembut, bintang jatuh, garis rasi dari kursor ke bintang terdekat
   light : serbuk sari / benih melayang berkilau, hanyut tertiup angin, menghindari kursor
   sunset: bara & debu emas naik pelan, kunang-kunang berkedip, berputar lembut di sekitar kursor
   Klik / ketuk = ledakan percikan. Pause saat tab tersembunyi. Hemat di HP (partikel lebih sedikit, 30 fps). */
(function () {
  const sky = document.querySelector('.sky'); if (!sky) return;
  const root = document.documentElement, cv = document.createElement('canvas'); cv.id = 'sky-fx'; cv.setAttribute('aria-hidden', 'true'); sky.appendChild(cv);
  const ctx = cv.getContext('2d'), mob = matchMedia('(max-width:820px)'), reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let W = 0, H = 0, d = 1, mode = 'night', P = [], S = [], bursts = [], raf = 0, last = 0, mx = -999, my = -999, mvx = 0, mvy = 0, sy0 = scrollY, shoot = null, nextShoot = 3;
  const R = (a, b) => a + Math.random() * (b - a);
  function count() { const base = mob.matches ? 1 : 1.9; return Math.round((mode === 'night' ? 70 : 46) * base * Math.min(1.4, W / 1100 + .35)); }
  function make(layer) {
    const o = { x: R(0, W), y: R(0, H), l: layer == null ? (Math.random() * 3) | 0 : layer, ph: R(0, 6.28), tw: R(.6, 2.2), vx: 0, vy: 0 };
    if (mode === 'night') { o.r = [.6, 1, 1.6][o.l] * R(.7, 1.2); o.a = [.35, .6, .9][o.l] * R(.6, 1); o.dx = R(-.4, .4) * (o.l + 1) * .5; o.dy = R(-.15, .15); }
    else if (mode === 'light') { o.r = R(1.4, 3.6); o.a = R(.45, .9); o.dx = R(8, 22); o.dy = R(-6, 4); o.l = o.r > 2.7 ? 2 : 1; }
    else { o.r = R(.9, 2.8); o.a = R(.35, .95); o.dx = R(-6, 6); o.dy = -R(10, 30); o.l = o.r > 1.9 ? 2 : 1; o.hot = Math.random() < .3; }
    return o;
  }
  function build() {
    P = []; const n = count(); for (let i = 0; i < n; i++) P.push(make());
    S = []; if (mode === 'night') for (let i = 0; i < (mob.matches ? 6 : 14); i++) { const o = make(0); o.r = R(14, 34); o.a = R(.02, .05); o.dx *= .4; S.push(o); }
  }
  function resize() { d = Math.min(devicePixelRatio || 1, mob.matches ? 1 : 1.5); W = innerWidth; H = innerHeight; cv.width = Math.round(W * d); cv.height = Math.round(H * d); ctx.setTransform(d, 0, 0, d, 0, 0); build(); }
  function theme() { const t = root.getAttribute('data-theme') || 'night'; if (t !== mode) { mode = t; build(); cv.style.opacity = 0; requestAnimationFrame(() => cv.style.opacity = 1); } }
  function col(a) { return mode === 'night' ? 'rgba(214,228,255,' + a + ')' : mode === 'light' ? 'rgba(255,255,255,' + a + ')' : 'rgba(255,196,128,' + a + ')'; }
  function frame(now) {
    raf = requestAnimationFrame(frame); if (now - last < (mob.matches ? 33 : 20)) return;
    const dt = Math.min(.06, (now - last) / 1000); last = now; ctx.clearRect(0, 0, W, H);
    const sc = scrollY - sy0; sy0 = scrollY; const px = (mx - W / 2) / W, py = (my - H / 2) / H;
    for (const s of S) { s.x += s.dx * dt * 6; if (s.x < -40) s.x = W + 40; if (s.x > W + 40) s.x = -40; const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 2.2); g.addColorStop(0, col(s.a * 2.4)); g.addColorStop(1, col(0)); ctx.fillStyle = g; ctx.fillRect(s.x - s.r * 2.2, s.y - s.r * 2.2, s.r * 4.4, s.r * 4.4); }
    const near = [];
    for (const p of P) {
      p.ph += dt * p.tw;
      let ox = 0, oy = 0;
      if (mode === 'night') { p.x += p.dx * dt * 8; p.y += p.dy * dt * 8 - sc * (p.l + 1) * .045; ox = -px * (p.l + 1) * 9; oy = -py * (p.l + 1) * 7; }
      else if (mode === 'light') { p.x += (p.dx + Math.sin(p.ph) * 10) * dt; p.y += (p.dy + Math.cos(p.ph * .8) * 8) * dt - sc * .03 * p.l; }
      else { p.x += (p.dx + Math.sin(p.ph) * 8) * dt; p.y += p.dy * dt - sc * .05 * p.l; }
      /* interaksi kursor */
      const ddx = p.x - mx, ddy = p.y - my, dd = ddx * ddx + ddy * ddy, rad = mode === 'night' ? 90 : 130;
      if (dd < rad * rad && dd > 1) { const f = (1 - Math.sqrt(dd) / rad); const k = f * f * (mode === 'sunset' ? 40 : 90) * dt; const dn = Math.sqrt(dd);
        if (mode === 'sunset') { p.x += (-ddy / dn) * k * 1.4 + ddx / dn * k * .3; p.y += (ddx / dn) * k * 1.4 + ddy / dn * k * .3; } else { p.x += ddx / dn * k; p.y += ddy / dn * k; } }
      if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20; if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;
      const x = p.x + ox, y = p.y + oy, tw = .55 + .45 * Math.sin(p.ph);
      if (mode === 'night') {
        const a = p.a * (p.l ? tw : .8 + .2 * tw); ctx.fillStyle = col(a); ctx.beginPath(); ctx.arc(x, y, p.r, 0, 6.283); ctx.fill();
        if (p.l === 2 && a > .55) { ctx.fillStyle = col(a * .12); ctx.beginPath(); ctx.arc(x, y, p.r * 4, 0, 6.283); ctx.fill(); }
        if (p.l > 0 && mx > -900) { const q = (x - mx) * (x - mx) + (y - my) * (y - my); if (q < 150 * 150) near.push([x, y, q]); }
      } else {
        const a = p.a * (mode === 'sunset' ? (.4 + .6 * tw) : (.7 + .3 * tw));
        const gr = ctx.createRadialGradient(x, y, 0, x, y, p.r * 4); const c0 = mode === 'sunset' ? (p.hot ? '255,150,90' : '255,206,140') : '255,255,255', c1 = mode === 'sunset' ? '255,120,70' : '255,236,190';
        gr.addColorStop(0, 'rgba(' + c0 + ',' + a + ')'); gr.addColorStop(.25, 'rgba(' + c0 + ',' + a * .55 + ')'); gr.addColorStop(1, 'rgba(' + c1 + ',0)');
        ctx.fillStyle = gr; ctx.fillRect(x - p.r * 4, y - p.r * 4, p.r * 8, p.r * 8);
      }
    }
    if (mode === 'night') { /* garis rasi dari kursor ke bintang terdekat */
      near.sort((a, b) => a[2] - b[2]); const m = near.slice(0, 6); ctx.lineWidth = .7;
      m.forEach(n => { ctx.strokeStyle = col(.32 * (1 - Math.sqrt(n[2]) / 150)); ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(n[0], n[1]); ctx.stroke(); });
      for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) { const dx = m[i][0] - m[j][0], dy = m[i][1] - m[j][1]; if (dx * dx + dy * dy < 90 * 90) { ctx.strokeStyle = col(.16); ctx.beginPath(); ctx.moveTo(m[i][0], m[i][1]); ctx.lineTo(m[j][0], m[j][1]); ctx.stroke(); } }
      nextShoot -= dt; if (nextShoot <= 0 && !shoot && !mob.matches || (nextShoot <= 0 && !shoot)) { const a = R(.35, .7); shoot = { x: R(W * .1, W * .9), y: R(0, H * .4), vx: Math.cos(a) * 640, vy: Math.sin(a) * 640, life: 0 }; nextShoot = R(4, 10); }
      if (shoot) { shoot.life += dt; shoot.x += shoot.vx * dt; shoot.y += shoot.vy * dt; const k = Math.sin(Math.min(1, shoot.life / .9) * Math.PI), L = 120;
        const g = ctx.createLinearGradient(shoot.x, shoot.y, shoot.x - shoot.vx / 640 * L, shoot.y - shoot.vy / 640 * L); g.addColorStop(0, 'rgba(255,255,255,' + .9 * k + ')'); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(shoot.x, shoot.y); ctx.lineTo(shoot.x - shoot.vx / 640 * L, shoot.y - shoot.vy / 640 * L); ctx.stroke(); if (shoot.life > .9) shoot = null; }
    }
    for (let i = bursts.length - 1; i >= 0; i--) { const b = bursts[i]; b.life -= dt; if (b.life <= 0) { bursts.splice(i, 1); continue; } b.x += b.vx * dt; b.y += b.vy * dt; b.vx *= .96; b.vy = b.vy * .96 + (mode === 'sunset' ? -8 : 14) * dt;
      const a = b.life / b.max; ctx.fillStyle = col(a * .9); ctx.beginPath(); ctx.arc(b.x, b.y, b.r * a + .3, 0, 6.283); ctx.fill(); }
  }
  function burst(x, y) { const n = mob.matches ? 9 : 16; for (let i = 0; i < n; i++) { const a = R(0, 6.283), v = R(30, 150); bursts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: R(1, 2.4), life: R(.5, 1.2), max: 1.2 }); } if (bursts.length > 80) bursts.splice(0, bursts.length - 80); }
  function sync() { const go = !document.hidden && !reduce.matches; if (go && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); } else if (!go && raf) { cancelAnimationFrame(raf); raf = 0; } }
  addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; mx = e.clientX; my = e.clientY; }, { passive: true });
  document.addEventListener('mouseleave', () => { mx = my = -999; });
  addEventListener('pointerdown', e => { if (e.target.closest && e.target.closest('input,textarea,select')) return; burst(e.clientX, e.clientY); if (e.pointerType === 'touch') { mx = e.clientX; my = e.clientY; setTimeout(() => { mx = my = -999; }, 700); } }, { passive: true });
  addEventListener('resize', () => { clearTimeout(resize.t); resize.t = setTimeout(() => { if (Math.abs(innerWidth - W) > 40 || Math.abs(innerHeight - H) > H * .3) resize(); }, 150); });
  document.addEventListener('visibilitychange', sync);
  new MutationObserver(theme).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  cv.style.transition = 'opacity .6s'; mode = root.getAttribute('data-theme') || 'night'; resize(); sync();
})();
