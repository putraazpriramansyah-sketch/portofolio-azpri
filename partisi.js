/* GuideFs Partisi — pilihan terpisah, transisi ringan, loader minimum 2 detik */
document.addEventListener('DOMContentLoaded', () => {
  const article = document.querySelector('.partisi-content');
  const heading = document.querySelector('.partisi-heading');
  const original = article ? [...article.children] : [];
  const sections = [];
  if (article) {
    let current = null;
    original.forEach(node => {
      if (node.matches && node.matches('h2')) {
        current = document.createElement('section');
        current.className = 'partisi-section';
        const number = sections.length + 1;
        current.dataset.partisi = String(number);
        const title = node.textContent.replace(/^PARTISI\s*\d+\s*[—-]\s*/i, '');
        current.dataset.title = title;
        current.appendChild(node);
        sections.push(current);
      } else if (current) current.appendChild(node);
    });
    article.replaceChildren();
    article.classList.add('partisi-reader');
    const chooser = document.createElement('div');
    chooser.className = 'partisi-chooser';
    chooser.innerHTML = `<div class="chooser-kicker">PILIH MATERI</div><h2>Mulai dari bagian mana?</h2><p>Buka setiap rangkuman secara terpisah agar lebih nyaman dibaca.</p><div class="partisi-options"></div>`;
    const options = chooser.querySelector('.partisi-options');
    sections.forEach((section, i) => {
      const card = document.createElement('button');
      card.type = 'button'; card.className = 'partisi-option';
      card.innerHTML = `<span class="option-index">0${i+1}</span><span class="option-copy"><strong>Partisi ${i+1}</strong><small>${section.dataset.title}</small><em>Buka materi <span aria-hidden="true">↗</span></em></span><span class="option-arrow" aria-hidden="true">→</span>`;
      card.addEventListener('click', () => {
        chooser.hidden = true;
        sections.forEach(s => { s.hidden = true; });
        section.hidden = false;
        article.classList.add('is-reading');
        if (heading) heading.querySelector('h1').textContent = `Partisi ${i+1}`;
        window.scrollTo({top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
      });
      options.appendChild(card);
    });
    const back = document.createElement('button');
    back.type = 'button'; back.className = 'partisi-reader-back'; back.innerHTML = '← <span>Kembali ke pilihan materi</span>';
    back.addEventListener('click', () => {
      sections.forEach(s => { s.hidden = true; });
      chooser.hidden = false; article.classList.remove('is-reading');
      if (heading) heading.querySelector('h1').textContent = 'Partisi 1 & 2';
      window.scrollTo({top: 0, behavior: 'smooth'});
    });
    article.append(chooser, back, ...sections);
    sections.forEach(s => s.hidden = true);
  }

  const loader = document.getElementById('partisi-loader');
  const status = document.getElementById('loader-status');
  const percent = document.getElementById('loader-percent');
  const bar = document.querySelector('.loader-progress-fill');
  const start = performance.now();
  let loaded = false;
  const finish = () => {
    if (loaded) return; loaded = true;
    const wait = Math.max(0, 2100 - (performance.now() - start));
    if (status) status.textContent = 'Menyiapkan ruang baca...';
    if (percent) percent.textContent = '100%';
    if (bar) bar.style.width = '100%';
    setTimeout(() => {
      if (loader) loader.classList.add('fade-out');
      document.body.classList.remove('loading');
      setTimeout(() => loader && loader.remove(), 650);
    }, wait);
  };
  let progress = 0;
  const progressTimer = setInterval(() => {
    progress = Math.min(92, progress + 4 + Math.random() * 8);
    if (percent) percent.textContent = `${Math.round(progress)}%`;
    if (bar) bar.style.width = `${progress}%`;
    if (progress >= 92) clearInterval(progressTimer);
  }, 125);
  document.body.classList.add('loading');
  if (document.readyState === 'complete') finish();
  else window.addEventListener('load', finish, {once:true});
  setTimeout(finish, 4500);
});
