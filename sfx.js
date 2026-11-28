/* GuideFs V5 - efek suara UI (WebAudio, tanpa file audio). Lembut, pendek, nada pentatonik supaya selalu enak dan tidak norak.
   Dipasang hanya di: tab, navigasi, ganti tema, music player, kartu partisi, kirim pesan, tombol galeri. Bisa dimatikan lewat tombol SFX di music player
   (disimpan di localStorage[gf-sfx]). Volume sangat kecil by design. */
(function () {
  let ac = null, master = null, on = true;
  try { on = localStorage.getItem('gf-sfx') !== 'off'; } catch (e) {}
  const PENTA = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
  function ctx() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return ac; }
    const A = window.AudioContext || window.webkitAudioContext; if (!A) return null;
    ac = new A(); master = ac.createGain(); master.gain.value = .7;
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 6; master.connect(comp); comp.connect(ac.destination); return ac;
  }
  /* satu nada: sine lembut + sedikit harmonik, envelope attack cepat, decay eksponensial, lowpass supaya tidak tajam */
  function note(f, when, dur, g, type, slide) {
    const a = ctx(); if (!a) return; const t0 = a.currentTime + (when || 0);
    const o = a.createOscillator(), o2 = a.createOscillator(), v = a.createGain(), lp = a.createBiquadFilter();
    o.type = type || 'sine'; o2.type = 'sine'; o.frequency.setValueAtTime(f, t0); o2.frequency.setValueAtTime(f * 2.01, t0);
    if (slide) { o.frequency.exponentialRampToValueAtTime(slide, t0 + dur); o2.frequency.exponentialRampToValueAtTime(slide * 2.01, t0 + dur); }
    lp.type = 'lowpass'; lp.frequency.value = 3800; lp.Q.value = .4;
    const g2 = a.createGain(); g2.gain.value = .22; o2.connect(g2); g2.connect(v); o.connect(v); v.connect(lp); lp.connect(master);
    v.gain.setValueAtTime(0.0001, t0); v.gain.exponentialRampToValueAtTime(g, t0 + .006); v.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    o.start(t0); o2.start(t0); o.stop(t0 + dur + .05); o2.stop(t0 + dur + .05);
  }
  const S = {
    tick() { note(1320, 0, .09, .035); },
    soft() { note(880, 0, .08, .03); },
    nav() { note(493.88, 0, .11, .04); note(739.99, .035, .12, .025); },
    tab(i) { const f = PENTA[(i || 0) % PENTA.length]; note(f, 0, .2, .05); note(f * 2, .02, .14, .018); },
    open() { note(392, 0, .16, .035, 'sine', 587); },
    close() { note(587, 0, .14, .03, 'sine', 392); },
    play() { note(659.25, 0, .16, .04); note(987.77, .07, .2, .035); },
    pause() { note(659.25, 0, .14, .035); note(440, .07, .18, .03); },
    send() { [523.25, 659.25, 783.99].forEach((f, i) => note(f, i * .08, .3, .04)); },
    err() { note(220, 0, .22, .045, 'triangle'); },
    bh() { note(65, 0, .9, .09, 'sine', 48); note(130, .05, .7, .03, 'sine', 90); },
    theme(m) {
      if (m === 'light') { note(784, 0, .3, .04); note(1046.5, .09, .4, .035); note(1318.5, .18, .5, .02); }
      else if (m === 'sunset') { note(587.33, 0, .35, .04, 'triangle'); note(880, .1, .45, .03); note(1174.7, .2, .5, .015); }
      else { note(659.25, 0, .4, .04); note(493.88, .12, .5, .035); note(329.63, .25, .7, .025); }
    }
  };
  function play(n, a) { if (!on || !S[n]) return; try { S[n](a); } catch (e) {} }
  window.GFSfx = { play, get enabled() { return on; }, set enabled(v) { on = !!v; try { localStorage.setItem('gf-sfx', on ? 'on' : 'off'); } catch (e) {} } };
  addEventListener('gf:sfx', e => play(e.detail));

  /* ---- penghubung klik ---- */
  const map = [
    ['.portfolio-tab-btn', el => ['tab', [...el.parentElement.querySelectorAll('.portfolio-tab-btn')].indexOf(el)]],
    ['.theme-toggle', () => { pendingTheme = Date.now(); return null; }],
    ['.music-trigger', () => { setTimeout(() => { const p = document.getElementById('music-panel'); play(p && !p.hidden ? 'open' : 'close'); }, 0); return null; }],
    ['#music-close', () => ['close']],
    ['.music-control', () => { setTimeout(() => { const i = document.getElementById('music-play-icon'); play(i && /pause/.test(i.className) ? 'play' : 'pause'); }, 120); return null; }],
    ['.music-result', () => ['play']],
    ['.sfx-toggle', () => null],
    ['.nav-links a,.partisi-back,.partisi-shortcut,.pt-card,.pt-toc a,.pt-foot a,.pt-foot button', () => ['nav']],
    ['.astro-arrow,.contact-item,.bh-info,.hero-socials a,.social-icon,.btn-hire', () => ['tick']],
    ['#guestbook-submit', () => ['send']]
  ];
  let pendingTheme = 0;
  document.addEventListener('click', e => {
    const t = e.target.closest && e.target; if (!t) return;
    for (const [sel, fn] of map) { const el = t.closest(sel); if (el) { const r = fn(el); if (r) play(r[0], r[1]); return; } }
  }, true);
  new MutationObserver(() => { if (pendingTheme && Date.now() - pendingTheme < 2500) { pendingTheme = 0; play('theme', document.documentElement.getAttribute('data-theme')); } })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  /* ---- tombol SFX di music player ---- */
  function addToggle() {
    const bar = document.querySelector('.music-bottom'); if (!bar || bar.querySelector('.sfx-toggle')) return;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'sfx-toggle'; b.setAttribute('aria-pressed', String(on)); b.title = 'Efek suara klik';
    const paint = () => { b.innerHTML = '<i class="fas ' + (on ? 'fa-bell' : 'fa-bell-slash') + '"></i><span>SFX ' + (on ? 'on' : 'off') + '</span>'; b.setAttribute('aria-pressed', String(on)); };
    paint(); b.addEventListener('click', () => { window.GFSfx.enabled = !on; paint(); if (on) play('tick'); }); bar.insertBefore(b, bar.children[1] || null);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addToggle); else addToggle();
})();
