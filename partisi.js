/* GuideFs Partisi V4.5
   - Pilihan Partisi 1 / 2 berupa "quest card" (sudut emas, angka romawi, daftar materi)
   - Transisi: chooser <-> materi dengan animasi masuk & keluar, tombol back browser/HP ikut bekerja (#partisi-1, #partisi-2)
   - Konten dibaca dari partisi.html (tanpa JS pun semua materi tetap terbaca)
   - Reveal saat scroll (IntersectionObserver), loader emas, estimasi waktu baca */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
  const corners = node => { ['tl', 'tr', 'bl', 'br'].forEach(c => node.appendChild(el('i', 'pt-c ' + c))); node.querySelectorAll('.pt-c').forEach(i => i.setAttribute('aria-hidden', 'true')); };
  const ROMAN = ['I', 'II', 'III', 'IV'];

  /* ---------------- LOADER ---------------- */
  function runLoader() {
    const loader = $('#partisi-loader');
    if (!loader) return Promise.resolve();
    const status = $('#loader-status'), percent = $('#loader-percent'), fill = $('#pl-fill');
    const MIN = reduce ? 450 : 1900, MAX = 6000;
    const t0 = performance.now();
    let pageLoaded = document.readyState === 'complete', shown = 0, last = t0, done = false;
    if (!pageLoaded) addEventListener('load', () => { pageLoaded = true; }, { once: true });
    document.body.classList.add('loading');

    return new Promise(resolve => {
      const paint = v => { if (fill) fill.style.transform = `scaleX(${(v / 100).toFixed(4)})`; if (percent) percent.textContent = Math.round(v) + '%'; };
      const close = () => {
        if (done) return; done = true; paint(100);
        if (status) status.textContent = 'Menyiapkan ruang baca...';
        setTimeout(() => {
          loader.classList.add('fade-out');
          document.body.classList.remove('loading');
          resolve();
          setTimeout(() => loader.remove(), 1000);
        }, reduce ? 40 : 300);
      };
      const tick = now => {
        if (done) return;
        const el = now - t0, dt = Math.min(now - last, 100); last = now;
        const realCap = pageLoaded || el > MAX ? 100 : 86 * (1 - Math.exp(-el / 1000));
        const goal = Math.min(realCap, 100 * Math.min(1, el / MIN));
        shown += (goal - shown) * (1 - Math.exp(-dt / 130));
        paint(shown);
        if (shown >= 99.4 && goal >= 100) close(); else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      setTimeout(close, MAX + 1500);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const loaderDone = runLoader();
    const article = $('#partisi-content');
    const heading = $('.partisi-heading');
    const sections = article ? [...article.querySelectorAll('.partisi-section')] : [];
    if (!article || !sections.length) return;

    document.documentElement.classList.add('pt-js');
    article.classList.add('partisi-reader');

    /* ---------- header tiap partisi (roman, judul, chip, daftar materi) ---------- */
    sections.forEach((sec, i) => {
      const materis = [...sec.querySelectorAll('.materi')];
      const words = (sec.textContent || '').trim().split(/\s+/).length;
      sec.dataset.minutes = String(Math.max(1, Math.round(words / 200)));
      sec.dataset.count = String(materis.length);

      const title = $('.pt-title', sec);
      const head = el('header', 'pt-reader-head');
      head.innerHTML = `
        <span class="pt-roman" aria-hidden="true">${sec.dataset.roman || ROMAN[i]}</span>
        <span class="pt-kicker">PARTISI ${sec.dataset.roman || ROMAN[i]}</span>
        <div class="pt-head-title"></div>
        <div class="gi-divider pt-orn" aria-hidden="true"><span class="gi-line"></span><svg class="gi-emblem" viewBox="0 0 120 40"><use href="#gi-center"/></svg><span class="gi-line flip"></span></div>
        <div class="pt-chips"><em><i class="fa-solid fa-book-open" aria-hidden="true"></i>${materis.length} Materi</em><em><i class="fa-regular fa-clock" aria-hidden="true"></i>± ${sec.dataset.minutes} menit baca</em></div>
        <nav class="pt-toc" aria-label="Daftar materi"></nav>`;
      $('.pt-head-title', head).appendChild(title);
      const toc = $('.pt-toc', head);
      materis.forEach((m, k) => {
        m.id = `p${i + 1}-m${k + 1}`;
        const a = el('a', 'pt-toc-item', `<b>${String(k + 1).padStart(2, '0')}</b><span>${$('h3', m).textContent}</span><i class="fa-solid fa-chevron-down" aria-hidden="true"></i>`);
        a.href = '#' + m.id;
        a.addEventListener('click', e => { e.preventDefault(); m.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); });
        toc.appendChild(a);
        corners(m);
      });
      sec.prepend(head);

      /* navigasi bawah: kembali / partisi lain */
      const foot = el('div', 'pt-foot');
      const back = el('button', 'pt-btn pt-btn-ghost', '<i class="fa-solid fa-grip" aria-hidden="true"></i><span>Pilihan materi</span>');
      back.type = 'button'; back.dataset.act = 'chooser';
      foot.appendChild(back);
      const other = sections[(i + 1) % sections.length];
      if (other !== sec) {
        const next = el('button', 'pt-btn pt-btn-gold', `<span>${i < sections.length - 1 ? 'Lanjut: Partisi ' + (i + 2) : 'Buka: Partisi ' + (((i + 1) % sections.length) + 1)}</span><i class="fa-solid fa-arrow-right" aria-hidden="true"></i>`);
        next.type = 'button'; next.dataset.act = 'goto'; next.dataset.i = String(sections.indexOf(other));
        foot.appendChild(next);
      }
      sec.appendChild(foot);

      /* kelas reveal (hanya diberi lewat JS supaya tanpa JS tetap terlihat) */
      $$(sec, '.pt-reader-head > *:not(.pt-roman), .materi-head, .materi > p, .materi .callout, .materi .intisari, .pt-foot').forEach((n, k) => {
        n.classList.add('pt-rv'); n.style.setProperty('--d', Math.min(k % 5, 4));
      });
      $$(sec, '.feature-grid li, .step-path li').forEach((n, k) => { n.classList.add('pt-rv'); n.style.setProperty('--d', Math.min(k % 5, 4)); });
    });
    function $$(root, sel) { return [...root.querySelectorAll(sel)]; }

    /* ---------- chooser ---------- */
    const chooser = el('section', 'pt-chooser');
    chooser.setAttribute('aria-label', 'Pilih partisi');
    chooser.innerHTML = `<div class="pt-chooser-head"><span class="pt-kicker">PILIH MATERI</span><h2>Mulai dari bagian mana?</h2><p>Pilih satu partisi untuk membuka rangkumannya. Setiap partisi berisi dua materi dari narasumber berbeda.</p></div><div class="pt-cards"></div>`;
    const cardsWrap = $('.pt-cards', chooser);
    const cards = sections.map((sec, i) => {
      const materis = $$(sec, '.materi');
      const rows = materis.map((m, k) => `<span class="pt-li"><b>${String(k + 1).padStart(2, '0')}</b><span><span class="pt-li-t">${$('h3', m).textContent}</span><span class="pt-li-s">${$('.speaker b', m).textContent}</span></span></span>`).join('');
      const card = el('a', 'pt-card', `
        <span class="pt-card-roman" aria-hidden="true">${sec.dataset.roman || ROMAN[i]}</span>
        <span class="pt-card-top">
          <span class="pt-badge" aria-hidden="true"><i class="fa-solid ${sec.dataset.icon || 'fa-book'}"></i></span>
          <span class="pt-card-id"><span class="pt-kicker">PARTISI ${sec.dataset.roman || ROMAN[i]}</span><span class="pt-chips"><em>${materis.length} Materi</em><em>± ${sec.dataset.minutes} menit</em></span></span>
        </span>
        <strong class="pt-card-title">${sec.dataset.title}</strong>
        <span class="pt-card-list">${rows}</span>
        <span class="pt-cta"><span>Buka materi</span><i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>`);
      card.href = `#partisi-${i + 1}`;
      card.style.setProperty('--i', i);
      card.setAttribute('aria-label', `Buka Partisi ${i + 1}: ${sec.dataset.title}`);
      corners(card);
      cardsWrap.appendChild(card);
      return card;
    });

    const readerBack = el('button', 'partisi-reader-back', '<i class="fa-solid fa-arrow-left" aria-hidden="true"></i><span>Kembali ke pilihan materi</span>');
    readerBack.type = 'button'; readerBack.dataset.act = 'chooser';
    article.prepend(chooser, readerBack);
    sections.forEach(s => { s.hidden = true; });

    /* ---------- navigasi berantai (anti tabrakan animasi) ---------- */
    let view = 'chooser', current = -1, chain = Promise.resolve();
    const nav = fn => { chain = chain.then(fn).catch(() => {}); return chain; };
    const pulse = (node, cls, ms) => { node.classList.add(cls); return sleep(ms).then(() => node.classList.remove(cls)); };

    async function openSection(i, { push = true, instant = false } = {}) {
      if (view === 'reader' && current === i) return;
      const sec = sections[i];
      if (!instant) {
        if (view === 'chooser') {
          cards[i].classList.add('is-picked');
          await pulse(chooser, 'is-leaving', 460);
          cards[i].classList.remove('is-picked');
        } else if (sections[current]) {
          await pulse(sections[current], 'is-leaving', 320);
        }
      }
      chooser.hidden = true;
      sections.forEach(s => { s.hidden = s !== sec; });
      if (heading) heading.hidden = true;
      article.classList.add('is-reading');
      window.scrollTo(0, 0);
      view = 'reader'; current = i;
      document.title = `Partisi ${i + 1} | GuideFs`;
      if (push) history.pushState({ p: i }, '', `#partisi-${i + 1}`);
      if (!instant) { sec.classList.add('is-entering'); setTimeout(() => sec.classList.remove('is-entering'), 1400); }
      requestAnimationFrame(() => $$(sec, '.gi-divider').forEach(d => d.classList.add('in')));
      observe(sec);
    }

    async function openChooser({ push = true, instant = false } = {}) {
      if (view === 'chooser') return;
      if (!instant && sections[current]) await pulse(sections[current], 'is-leaving', 320);
      sections.forEach(s => { s.hidden = true; });
      chooser.hidden = false;
      if (heading) heading.hidden = false;
      article.classList.remove('is-reading');
      window.scrollTo(0, 0);
      view = 'chooser'; current = -1;
      document.title = 'Partisi | GuideFs';
      if (push) history.pushState({ p: -1 }, '', location.pathname);
      if (!instant) { chooser.classList.add('is-entering'); if (heading) heading.classList.add('is-entering'); setTimeout(() => { chooser.classList.remove('is-entering'); heading && heading.classList.remove('is-entering'); }, 1200); }
    }

    cards.forEach((card, i) => card.addEventListener('click', e => { e.preventDefault(); nav(() => openSection(i)); }));
    article.addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      if (b.dataset.act === 'chooser') nav(() => openChooser());
      if (b.dataset.act === 'goto') nav(() => openSection(Number(b.dataset.i)));
    });

    const fromHash = () => { const m = /^#partisi-(\d+)$/.exec(location.hash); const n = m ? Number(m[1]) - 1 : -1; return n >= 0 && n < sections.length ? n : -1; };
    addEventListener('popstate', () => {
      const n = fromHash();
      nav(() => n >= 0 ? openSection(n, { push: false }) : openChooser({ push: false }));
    });

    /* ---------- reveal saat scroll ---------- */
    let io = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    }
    function observe(root) { $$(root, '.pt-rv:not(.in)').forEach(n => io ? io.observe(n) : n.classList.add('in')); }

    /* ---------- masuk awal (ikut hash) ---------- */
    const start = fromHash();
    if (start >= 0) openSection(start, { push: false, instant: true });
    else history.replaceState({ p: -1 }, '', location.pathname + location.search);
    loaderDone.then(() => {
      if (view === 'chooser') { chooser.classList.add('is-entering'); heading && heading.classList.add('is-entering'); setTimeout(() => { chooser.classList.remove('is-entering'); heading && heading.classList.remove('is-entering'); }, 1500); }
      else { sections[current].classList.add('is-entering'); setTimeout(() => sections[current].classList.remove('is-entering'), 1400); }
    });
  });
})();
