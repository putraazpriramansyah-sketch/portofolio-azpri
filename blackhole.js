/* GuideFs V5 - blackhole malam: HITAM-PUTIH, WebGL shader + partikel orbit 3D + label anatomi.
   Interaktif: gerakkan mouse = miring/putar piringan, drag = putar bebas, klik/ketuk dekat lubang = gelombang gravitasi,
   hover dekat lubang = piringan berputar lebih cepat. WebGL gagal -> fallback ke blackhole 2D di celestial.js. */
(function () {
  const hero = document.getElementById('home'); if (!hero) return;
  const root = document.documentElement, cv = document.createElement('canvas');
  cv.id = 'bh'; cv.setAttribute('aria-hidden', 'true');
  const gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'low-power' }); if (!gl) return;
  const FS = `precision highp float;uniform vec2 uRes,uC;uniform float uRs,uT,uOut,uTilt,uRoll,uPulse;
float h(vec2 p){p=fract(p*vec2(.1031,.103));p+=dot(p,p.yx+33.33);return fract((p.x+p.y)*p.x);}
float vn(vec2 p,float N){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);float x0=mod(i.x,N),x1=mod(i.x+1.,N);
return mix(mix(h(vec2(x0,i.y)),h(vec2(x1,i.y)),f.x),mix(h(vec2(x0,i.y+1.)),h(vec2(x1,i.y+1.)),f.x),f.y);}
float disk(float R,float ph,float dx){
float pr=smoothstep(1.4,1.8,R)*pow(1.55/R,1.5)*(1.-smoothstep(uOut*.5,uOut,R));if(pr<.002)return 0.;
float a=ph/6.2831853-uT*.3/pow(R,1.5);vec2 q=vec2(a*34.,R*5.);
float n=.25+.5*vn(q,34.)+.38*vn(q*vec2(2.,2.4)+vec2(7.,3.),68.)+.22*vn(q*vec2(4.,5.)+vec2(3.,9.),136.)+.12*vn(q*vec2(9.,11.),272.);
float T=mix(1.,.5,smoothstep(1.5,2.8,R));T=mix(T,.2,smoothstep(2.8,uOut,R));
float gr=.74+.26*sin(R*52.+vn(q*.4,17.)*6.);
float D=clamp(1.-.55*dx*1.25/sqrt(R),.22,2.1);
return T*pr*n*gr*pow(D,1.7)*2.5*(1.+uPulse*.7);}
void main(){
vec2 p0=(gl_FragCoord.xy-uC)/uRs;float cr=cos(uRoll),sr=sin(uRoll);
vec2 p=vec2(cr*p0.x+sr*p0.y,-sr*p0.x+cr*p0.y);
float b=length(p),s=uTilt,up=step(0.,p.y),L=0.;
float dy=p.y/s,Rd=length(vec2(p.x,dy)),vis=(p.y<0.)?1.:smoothstep(.98,1.03,b);
if(Rd<uOut)L+=disk(Rd,atan(dy,p.x),p.x/max(Rd,.001))*vis;
float R2=1.45+(b-1.)*4.2*mix(1.9,1.,up);
if(R2<uOut)L+=disk(R2,atan(abs(p.y),p.x),p.x/max(b,.001))*mix(.5,1.15,up)*smoothstep(1.,1.03,b)*smoothstep(.05,.5,abs(p.y)/max(b,.001));
float ring=exp(-pow((b-1.015)/.016,2.))*(.9+.3*(-p.x/max(b,.001)));
float outside=smoothstep(.98,1.03,b);
L+=ring*(1.7+uPulse*1.2)+(exp(-(b-1.)*7.)*.32+exp(-(b-1.)*2.4)*.08)*outside;
vec2 sp=p*(1.+1.15/max(b*b,1.));vec2 g=sp*13.;vec2 id=floor(g);
float st=step(.986,h(id))*smoothstep(.3,0.,length(fract(g)-.5))*(.4+.6*h(id+3.));
L+=st*.8*smoothstep(1.02,1.2,b);
float ex=min(gl_FragCoord.x,uRes.x-gl_FragCoord.x)/uRes.x,ey=min(gl_FragCoord.y,uRes.y-gl_FragCoord.y)/uRes.y;
L*=smoothstep(0.,.16,ex)*smoothstep(0.,.1,ey);L=1.-exp(-L*1.45);
float sh=1.-smoothstep(.99,1.,b),a=max(sh,min(1.,L));gl_FragColor=vec4(vec3(min(L,a)),a);}`;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; };
  const vs = sh(gl.VERTEX_SHADER, 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'), fs = sh(gl.FRAGMENT_SHADER, FS); if (!vs || !fs) return;
  const pg = gl.createProgram(); gl.attachShader(pg, vs); gl.attachShader(pg, fs); gl.linkProgram(pg); if (!gl.getProgramParameter(pg, gl.LINK_STATUS)) return;
  gl.useProgram(pg); gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pg, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(pg, n), uRes = U('uRes'), uC = U('uC'), uRs = U('uRs'), uT = U('uT'), uOut = U('uOut'), uTilt = U('uTilt'), uRoll = U('uRoll'), uPulse = U('uPulse');
  gl.clearColor(0, 0, 0, 0); hero.insertBefore(cv, hero.firstChild);

  /* ---- lapisan partikel 2D (orbit 3D, depan/belakang lubang) ---- */
  const pc = document.createElement('canvas'); pc.id = 'bh-p'; pc.setAttribute('aria-hidden', 'true'); hero.insertBefore(pc, cv.nextSibling);
  const px = pc.getContext('2d');
  /* ---- label anatomi ---- */
  const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'bh-svg'); svg.setAttribute('aria-hidden', 'true');
  const ITEMS = [
    { t: 'Event Horizon', d: 'Batas tanpa kembali. Cahaya pun tak bisa lolos.', a: [-.25, -.2], l: [-.1, -1.75], m: [-1.25, -1.5], al: 'c', am: 'r' },
    { t: 'Photon Ring', d: 'Cahaya yang mengorbit tepat di tepi bayangan.', a: [.72, .72], l: [1.5, 1.65], m: [1.1, 1.55], al: 'l', am: 'l' },
    { t: 'Accretion Disk', d: 'Gas dan debu panas yang berputar, berpijar karena gesekan.', a: [1.75, -.02], l: [1.5, -.95], m: [1.1, -1.5], al: 'l', am: 'l' },
    { t: 'Gravitational Lensing', d: 'Cahaya piringan di balik lubang dibelokkan ke atas dan bawah.', a: [-.1, 1.22], l: [-2.1, 1.85], al: 'r', d_only: 1 },
    { t: 'Doppler Beaming', d: 'Sisi yang mendekat ke arah kita tampak lebih terang.', a: [-1.55, .05], l: [-1.9, -1.45], al: 'r', d_only: 1 },
    { t: 'Infalling Particles', d: 'Debu yang tertarik spiral ke dalam, lalu ditelan.', a: [2.35, -.2], l: [1.5, -1.8], al: 'l', d_only: 1 }
  ];
  const labs = ITEMS.map(it => {
    const ln = document.createElementNS(NS, 'line'), dt = document.createElementNS(NS, 'circle'); dt.setAttribute('r', '2.2'); svg.append(ln, dt);
    const el = document.createElement('div'); el.className = 'bh-lab' + (it.d_only ? ' d-only' : ''); el.innerHTML = '<b>' + it.t + '</b><span>' + it.d + '</span>'; return { it, ln, dt, el };
  });
  const info = document.createElement('button'); info.type = 'button'; info.className = 'bh-info'; info.setAttribute('aria-pressed', 'false'); info.innerHTML = '<i>i</i><span>Anatomi</span>';
  hero.append(svg); labs.forEach(o => hero.append(o.el)); hero.append(info);
  info.addEventListener('click', () => { const on = !hero.classList.contains('bh-anat'); hero.classList.toggle('bh-anat', on); info.setAttribute('aria-pressed', String(on)); info.querySelector('span').textContent = on ? 'Tutup' : 'Anatomi'; });

  const mob = matchMedia('(max-width:820px)'), reduce = matchMedia('(prefers-reduced-motion: reduce)'), fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  let W = 0, H = 0, sc = 1, rs = 100, cx = 0, cy = 0, out = 4.1, t = 0, last = 0, raf = 0, vis = true;
  let tx = 0, ty = 0, sx = 0, sy = 0, tilt = .13, roll = 0, tTilt = .13, tRoll = 0, dTilt = 0, dRoll = 0, pulse = 0, spin = 1, near = false, drag = null;
  const P = [], dpr = () => Math.min(devicePixelRatio || 1, mob.matches ? 1 : 1.5);
  function spawn(q, init) {
    q.r = init ? 1.5 + Math.random() * 2.7 : 3.9 + Math.random() * .5; q.th = Math.random() * 6.2832; q.z = (Math.random() - .5) * .08; q.sz = .5 + Math.random() * 1.3;
    q.k = .7 + Math.random() * .6; q.al = .25 + Math.random() * .6; q.px = null; q.py = null; return q;
  }
  function resize() {
    const r = hero.getBoundingClientRect(); if (r.width < 8) return; W = r.width; H = r.height; const m = W <= 820;
    sc = m ? .7 : .75; cv.width = Math.round(W * sc); cv.height = Math.round(H * sc); gl.viewport(0, 0, cv.width, cv.height);
    const d = dpr(); pc.width = Math.round(W * d); pc.height = Math.round(H * d); px.setTransform(d, 0, 0, d, 0, 0);
    if (m) { const w = Math.min(W, 520), pb = parseFloat(getComputedStyle(hero).paddingBottom) || w * .84; rs = w * .15; cx = W / 2; cy = H - pb / 2; out = 3.8; }
    else { rs = Math.max(70, Math.min(150, W * .1)); cx = W * .74; cy = H * .5; out = 4.1; }
    const n = m ? 110 : 280; while (P.length < n) P.push(spawn({}, true)); P.length = n;
    layout(); draw();
  }
  function layout() {
    const m = W <= 820; svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', W); svg.setAttribute('height', H);
    labs.forEach(o => {
      const it = o.it, l = m ? (it.m || it.l) : it.l, ax = cx + it.a[0] * rs, ay = cy - it.a[1] * rs, lx = cx + l[0] * rs, ly = cy - l[1] * rs, al = m ? (it.am || it.al) : it.al;
      o.ln.setAttribute('x1', ax); o.ln.setAttribute('y1', ay); o.ln.setAttribute('x2', lx); o.ln.setAttribute('y2', ly); o.dt.setAttribute('cx', ax); o.dt.setAttribute('cy', ay);
      o.el.style.left = lx + 'px'; o.el.style.top = ly + 'px'; o.el.style.maxWidth = al === 'l' ? Math.max(96, Math.min(190, W - lx - 16)) + 'px' : al === 'r' ? Math.max(96, Math.min(190, lx - 16)) + 'px' : ''; o.el.dataset.al = al; o.el.classList.toggle('m-hide', m && !!it.d_only);
      o.ln.classList.toggle('m-hide', m && !!it.d_only); o.dt.classList.toggle('m-hide', m && !!it.d_only);
    });
    info.style.left = (m ? cx : cx) + 'px'; info.style.top = Math.min(H - 20, cy + rs * (m ? 2.05 : 2.55)) + 'px';
  }
  function particles(dt) {
    px.clearRect(0, 0, W, H); if (!W) return;
    const c = Math.cos(roll), s = Math.sin(roll), ox = cx + sx, oy = cy + sy, Cx = ox, Cy = oy;
    const front = [], back = [];
    for (const q of P) {
      q.th += dt * 1.15 * spin * q.k / Math.pow(q.r, 1.5); q.r -= dt * (.035 + .02 * spin) * q.k * (1 + pulse);
      if (q.r < 1.12 + Math.abs(q.z)) { spawn(q, false); continue; }
      const sn = Math.sin(q.th), cs = Math.cos(q.th);
      let X, Y, a = q.al;
      if (sn >= 0) { X = q.r * cs; Y = -(q.r * sn * tilt + q.z); } /* sisi depan (di bawah pusat) */
      else { const bb = Math.max(1.02, 1 + (q.r - 1.45) / 4.2); X = bb * cs; Y = Math.abs(bb * sn) + .02 - q.z * .5; a *= .75; } /* sisi belakang dilensakan ke atas */
      const mx = c * X - s * Y, my = s * X + c * Y, sxp = Cx + mx * rs, syp = Cy - my * rs;
      const rr = Math.hypot(mx, my); if (sn < 0 && rr < 1) continue;
      const dop = .55 + .45 * (-cs); /* sisi kiri lebih terang */
      const fade = Math.min(1, (q.r - 1.12) / .5) * Math.min(1, (4.4 - q.r) / .7);
      const o = { x: sxp, y: syp, px: q.px, py: q.py, a: Math.max(0, a * dop * fade), sz: q.sz * (1 + (sn >= 0 ? .35 : 0)) };
      q.px = sxp; q.py = syp; (sn >= 0 ? front : back).push(o);
    }
    px.globalCompositeOperation = 'lighter'; px.lineCap = 'round';
    for (const arr of [back, front]) for (const o of arr) {
      if (o.px != null && Math.abs(o.px - o.x) < 40 && Math.abs(o.py - o.y) < 40) { px.strokeStyle = 'rgba(255,255,255,' + (o.a * .8).toFixed(3) + ')'; px.lineWidth = o.sz; px.beginPath(); px.moveTo(o.px, o.py); px.lineTo(o.x, o.y); px.stroke(); }
      px.fillStyle = 'rgba(255,255,255,' + o.a.toFixed(3) + ')'; px.fillRect(o.x - o.sz * .5, o.y - o.sz * .5, o.sz, o.sz);
    }
    /* bayangan (event horizon) menutup partikel belakang; partikel depan digambar di atasnya */
    px.globalCompositeOperation = 'source-over';
  }
  function draw() {
    if (!W) return; gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(uRes, cv.width, cv.height); gl.uniform2f(uC, (cx + sx) * sc, (H - cy - sy) * sc); gl.uniform1f(uRs, rs * sc); gl.uniform1f(uT, t);
    gl.uniform1f(uOut, out); gl.uniform1f(uTilt, tilt); gl.uniform1f(uRoll, roll); gl.uniform1f(uPulse, pulse);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function loop(now) {
    raf = requestAnimationFrame(loop); const min = mob.matches ? 33 : 16; if (now - last < min) return;
    const dt = Math.min(.1, (now - last) / 1000); last = now;
    const k = Math.min(1, dt * 6);
    spin += ((near ? 2.6 : 1) - spin) * k * .6; t += dt * spin; pulse *= Math.pow(.12, dt);
    if (!drag) { dTilt *= Math.pow(.25, dt); dRoll *= Math.pow(.25, dt); }
    tilt += (Math.max(.05, Math.min(.34, tTilt + dTilt)) - tilt) * k; roll += (Math.max(-.7, Math.min(.7, tRoll + dRoll)) - roll) * k;
    sx += (tx - sx) * .06; sy += (ty - sy) * .06; draw(); particles(dt);
  }
  function sync() {
    const go = root.getAttribute('data-theme') === 'night' && vis && !document.hidden && !reduce.matches;
    if (go && !raf) { last = performance.now(); raf = requestAnimationFrame(loop); } else if (!go && raf) { cancelAnimationFrame(raf); raf = 0; }
    if (reduce.matches && root.getAttribute('data-theme') === 'night') { draw(); particles(0); }
  }
  new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  new IntersectionObserver(e => { vis = e[0].isIntersecting; sync(); }, { threshold: .02 }).observe(hero);
  document.addEventListener('visibilitychange', sync);
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(hero); else addEventListener('resize', resize);
  cv.addEventListener('webglcontextlost', e => { e.preventDefault(); if (raf) cancelAnimationFrame(raf); raf = 0; root.classList.remove('bh-ok'); dispatchEvent(new Event('gf:bh')); });
  cv.addEventListener('webglcontextrestored', () => location.reload());

  /* ---- interaksi ---- */
  const hit = e => { const r = hero.getBoundingClientRect(); return Math.hypot(e.clientX - r.left - cx, e.clientY - r.top - cy) < rs * 3.2; };
  if (fine) addEventListener('pointermove', e => {
    tx = (e.clientX / innerWidth - .5) * -26; ty = (e.clientY / innerHeight - .5) * -18;
    if (!drag) { tTilt = .13 + (.5 - e.clientY / innerHeight) * .1; tRoll = (e.clientX / innerWidth - .5) * -.22; }
    near = hit(e);
    if (drag) { dRoll += (e.clientX - drag.x) * .0035; dTilt += (e.clientY - drag.y) * -.0007; drag.x = e.clientX; drag.y = e.clientY; }
  }, { passive: true });
  hero.addEventListener('pointerdown', e => {
    if (root.getAttribute('data-theme') !== 'night' || e.target.closest('a,button,input,textarea,.hero-text,.hero-socials')) return;
    if (hit(e)) { pulse = 1.4; dispatchEvent(new CustomEvent('gf:sfx', { detail: 'bh' })); }
    if (fine && e.pointerType === 'mouse') { drag = { x: e.clientX, y: e.clientY }; hero.classList.add('bh-drag'); }
  });
  addEventListener('pointerup', () => { drag = null; hero.classList.remove('bh-drag'); });
  addEventListener('pointercancel', () => { drag = null; hero.classList.remove('bh-drag'); });
  resize(); sync(); root.classList.add('bh-ok'); dispatchEvent(new Event('gf:bh'));
})();
