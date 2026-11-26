# GuideFs Portfolio — Handoff V4.4 (lanjut di tempat lain)

Dokumen ini ringkasan supaya pekerjaan bisa dilanjutkan oleh AI/orang lain tanpa konteks percakapan.
Pemilik: Putra Azpriramansyah (Azpri). Gaya bahasa pemilik: santai ("gua/lu"). Balas dalam Bahasa Indonesia.

## 1. Ringkasan proyek
Website portofolio statis (HTML/CSS/JS murni, tanpa build tool) dengan 3 tema: **Normal (siang berawan)**, **Sunset**, **Night (Milky Way)**.
Halaman: `index.html` (utama) dan `partisi.html` (rangkuman materi, tab Partisi 1 & 2).
Versi sebelumnya: V3 "Fantasy Atmosphere" (palet slate/teal/emas, heading Cinzel). V4 = perbaikan di atas V3.

## 2. Struktur file
```
GuideFs/
  index.html        halaman utama (markup + ornamen pembatas inline SVG)
  partisi.html/.css/.js   halaman partisi
  style.css         CSS asli (besar, banyak override lama: jangan dihapus)
  theme.css         lapisan tema. V3 di atas, blok "GUIDEFs V4" di paling bawah (menimpa V3)
  theme.js          tema, navbar pill, langit/awan, Milky Way, tab portofolio, observer pembatas
  script.js         logika asli (loader, typing, supabase guestbook, lightbox, dll)
  Photo/            gambar
  HANDOFF_GuideFs_V4.md  (file ini)
  (V4.4) font Cinzel/Orbitron/Poppins sekarang lewat <link> di <head> (bukan @import di style.css)
```
CDN yang dipakai: Font Awesome 6.5, AOS 2.3.1, Supabase JS, Google Fonts (Cinzel, Poppins).
Tanpa internet, ikon dan font fallback jadi berbeda.

## 3. Sistem tema
- `<html data-theme="light|sunset|night">`, disimpan di `localStorage['gf-theme']`, default `night`.
- Skrip kecil di `<head>` menyetel tema sebelum render (cegah kedip).
- Tombol `#theme-toggle` memutar: light -> sunset -> night.
- Semua warna lewat CSS variable: `--t-*` (halaman/teks/kartu), `--g-*` (kapsul kaca navbar), `--gi` (emas pembatas).
  Tiap tema mendefinisikan variabelnya di `theme.css` (blok V3, lalu ditimpa blok V4 untuk sunset).
- `theme-color` meta ikut berubah (warna address-bar HP).

### Animasi ganti tema (PENTING, ini perbaikan bug hosting/HP)
V3 memakai `document.startViewTransition` + clip-path. Di Live Server bagus, tapi di HP (setelah hosting) aneh/patah karena
browser mem-snapshot seluruh halaman termasuk layer fixed + canvas + backdrop-filter.
V4 mengganti dengan **overlay lingkaran** (`.theme-wipe`) yang di-scale dari posisi tombol (hanya transform/opacity, 1 layer GPU).
Tema diganti saat layar tertutup; class `html.no-trans` mematikan transisi CSS selama pergantian supaya tidak kedap-kedip.
Jangan kembalikan ke View Transition API.

## 4. Langit / latar (`.sky` fixed, z-index -1)
- `.sky-light` (siang), `.sky-sunset` (senja + `.sun`), `.sky-clouds` (awan), `canvas#sky-night` (Milky Way).
- Pergantian tema = transisi **opacity** antar layer (murah). Gradien tidak dianimasikan langsung.
- Awan digambar **sekali** ke canvas kecil (siang: kumulus putih; sunset: stratus memanjang ungu atas / oranye bawah).
  Parallax scroll lewat 2 grup (`.cl-group` far/near) yang di-`translate3d` dari JS. Drift CSS hanya di desktop.
- Sunset: matahari turun & langit menggelap sesuai progres scroll lewat `--sp` yang ditulis ke elemen `.sky` saja
  (BUKAN `<html>`, supaya style-recalc tidak menyapu seluruh dokumen).
- Night: canvas noise-fbm. Dibangun malas (hanya saat night aktif), FPS dibatasi (~15 fps HP, ~25 fps desktop),
  dan **tidak dibangun ulang** saat address-bar HP naik/turun (hanya jika lebar berubah >40px atau tinggi >30%).

## 5. Pembatas section (gaya fantasy-RPG emas, desain orisinal)
Markup: `.gi-divider` = `.gi-line` + `svg.gi-emblem (<use href="#gi-center">)` + `.gi-line.flip` + `.gi-label`.
Symbol `#gi-center` ada di SVG tersembunyi tepat setelah `<body>`. Animasi reveal dipicu IntersectionObserver (class `.in`).
Ada 5 pembatas: I About Me, II Journey, III Interests, IV Portfolio, V Contact. Warna dari `--gi`.
`.section-divider` lama disembunyikan.

## 6. Tipografi & mobile
- Ukuran teks fluid pakai `clamp()` (hero h1/h3/p, h2 section, deskripsi, kartu).
- Portofolio: tab jadi segmented control 3 kolom (tidak wrap), grid 1 kolom di HP, gambar rasio 16/11.
- Di HP `backdrop-filter` pada kartu dimatikan (kartu dibuat lebih opak) — ini penyebab lag terbesar di HP. Blur hanya untuk navbar/toggle.
- Bubble "Rangkuman partisi ada di sini" di HP menghilang sendiri setelah ~7 detik.

## 7. Cache-busting saat hosting
Link/script sekarang memakai `?v=7` (V4.2=4, V4.3=6, V4.4=7; `partisi.css` juga ikut diberi `?v=7`). Setiap kali ubah CSS/JS dan deploy, naikkan angkanya (`?v=8`, dst) di `index.html` dan `partisi.html`,
atau pengunjung/HP bisa memuat CSS lama + JS baru (penyebab "animasi aneh setelah hosting").
Setelah deploy uji dengan hard-refresh / tab incognito.

## 8. Status & keterbatasan
Sudah: sunset realistis, 3 tema, pembatas, tab porto mobile, animasi tema ringan, optimasi mobile, halaman partisi ikut tema.
Diuji: Chromium headless (desktop 1280px, mobile 390px, CPU throttle 4x). **Belum diuji di HP fisik / Safari iOS.**
Catatan: font Cinzel/Poppins dan ikon FA butuh internet; saat offline tampilan fallback.
Masalah kecil yang diketahui: `style.css` penuh override lama + `!important` di `theme.css` (V3). Bila ingin dirapikan, lakukan bertahap
dan uji ketiga tema di desktop & HP.

## 9. Ide lanjutan
- Rapikan `theme.css` (gabungkan blok V3 + V4, hapus rule tak terpakai seperti `.planet-*`, `.cloud`).
- Loader gaya modern (kata muncul bertahap + progress halus).
- Tab portofolio: indikator geser (sliding pill) dan swipe di HP.
- Self-host font/ikon (hindari CDN) untuk kecepatan.

## 9b. Perubahan V4.2 (sesi terakhir) — blok "V4.2" di paling bawah `theme.css`
1. **Kotak persegi panjang siku di navbar dihapus.** Penyebab: aturan global `:focus-visible { outline: 2px solid; outline-offset: 4px }` di `style.css` (~baris 1938).
   `<a>` di navbar punya `border-radius: 0`, jadi outline fokus tampil sebagai kotak bersudut siku. Fix: outline dimatikan untuk
   `.nav-links a`, `.theme-toggle`, `.music-trigger`, `.partisi-shortcut`, dll; `.nav-links a` diberi `border-radius:999px`;
   fokus keyboard diganti ring bulat lembut (box-shadow) demi aksesibilitas. Jangan hapus rule `:focus-visible` global (dipakai elemen lain).
2. **Music player jadi liquid glass:** kapsul `.music-trigger` memakai resep yang sama dengan navbar (`--g-bg`, blur 22px + saturate, rim inset, sheen via
   `linear-gradient` di background). `.music-disc` jadi bola kaca (bukan kotak rounded). `.music-panel` ikut rim kaca (blur 24px, tetap cukup pekat agar teks terbaca).
3. **Tombol Rangkuman Partisi jadi liquid glass** di 3 tema. Sheen sengaja lewat `background` (bukan `::before`) karena `::before/::after`
   dipakai bubble hint "Rangkuman partisi ada di sini". Di HP tombol berbentuk lingkaran 42px (sama seperti toggle tema).
   Rule lama yang memaksa background solid `.94` (`!important`) tetap ada tapi ditimpa blok V4.2 (urutan kemudian menang).
4. Cache-busting dinaikkan ke `?v=5`.
Diuji: Chromium headless 1280px & 390px, 3 tema, plus simulasi Tab keyboard. Belum di HP fisik / Safari iOS.
Catatan: di tes offline ikon Font Awesome tidak muncul (kotak kosong di tombol sosial/partisi) — itu normal tanpa internet, bukan bug.
Belum disentuh: navbar halaman `partisi.html` (`.partisi-navbar`, tombol `.partisi-back`) — hanya outline fokusnya yang ikut diperbaiki; bisa dijadikan liquid glass juga bila diminta.

## 9c. Perubahan V4.3 — blok "V4.3" di paling bawah `theme.css` + handler tab di `theme.js`
1. **Tab portofolio: indikator geser (sliding pill).** `.portfolio-tabs::before` adalah pill yang bergeser lewat CSS var `--ti` (0/1/2, ditulis JS ke `.portfolio-tabs`),
   animasi spring, hanya `transform` (ringan di HP). Tombol aktif background-nya transparan, pill-nya yang berwarna (`--t-btn`).
2. **Swipe kiri/kanan di HP** untuk pindah tab (ambang 70px, dominan horizontal, <700ms). Diabaikan bila sentuhan dimulai di elemen yang bisa scroll horizontal.
   Logika ada di `theme.js` (fungsi `setTab`, `tabIdx`); klik tab dan swipe memakai fungsi yang sama.
3. **Navbar `partisi.html` jadi kapsul liquid glass melayang** (sticky, rounded penuh, lebar maks 920px), tombol "Kembali" ikut glass; toggle tema 42px di HP.
4. Cache-busting `?v=6`.
Diuji: Chromium headless (390px & 1280px, 3 tema) + simulasi event touch untuk swipe (tab berpindah maju/mundur, tanpa error JS). Belum di HP fisik / Safari iOS.
Sisa ide dari V4.3 (loader modern + buang `.planet-*`/`.cloud`) SUDAH dikerjakan di V4.4 (lihat 9d).

## 9d. Perubahan V4.4 — blok "GUIDEFs V4.4" di paling bawah `theme.css` + perubahan di script.js / theme.js / partisi.js / HTML
1. **Loader modern** (`#loader` di index.html, logika di awal `script.js`): emblem emas (`#gi-center`) muncul, kata "Welcome / to / my" bertahap,
   judul "Portfolio Website" masuk huruf per huruf DARI TENGAH KE LUAR (simetris; `--d` = jarak huruf ke tengah) (JS memecah jadi `.ld-word > .ld-ch`, kata tidak terpotong di HP), progres halus (`transform: scaleX`, bukan width)
   yang mengikuti pemuatan halaman nyata: naik cepat lalu melambat (maks ~86%) sampai event `load`, lalu ke 100%.
   Minimal tampil 1.9 dtk, batas aman 6.5 dtk (+jaring pengaman timer). Keluar sebagai tirai naik dengan sisi bawah melengkung. Semua elemen rata tengah (terukur offset <1px): `text-indent` mengimbangi letter-spacing, progres tumbuh dari tengah, "GUIDEFS · 89%" satu baris di tengah.
   Catatan: pemilik minta gaya loader ala ekizr.com, tapi situsnya dirender JS sehingga loader-nya tidak bisa dibaca dari sesi ini — minta screenshot/deskripsi kalau mau disamakan.
   Warna ikut tema lewat `--t-loader`, `--t-accent`, `--t-head`. `prefers-reduced-motion` -> tanpa animasi, tampil 0.5 dtk.
   Class lama `.anim-sub/.anim-title/.loading-bar/.fade-right*` tidak dipakai lagi (rule-nya masih di style.css, aman dibiarkan).
2. **Teks hero TIDAK diubah** (permintaan pemilik, revisi V4.4b): delay `.fadeup*` (2.69s-3.01s) dan typing effect kembali persis seperti aslinya (typing mulai langsung).
   Yang tersisa dari V4.4 hanya helper `gfReady(cb)` + event `gf:ready` (dipakai bubble hint partisi) dan `body.loading{overflow:hidden}`.
3. **Rapihin theme.css:** 49 rule mati dibuang (`.planet-*`, `.cloud*`, `.sky-day`, `.hero-logo-badge`, `.tech-badge`, `.section-divider`, `.partisi-tab` dll) +
   2 `@keyframes` tak terpakai. 51.9KB -> 44.3KB (sebelum blok V4.4). Dicek: screenshot 3 tema x desktop/HP x 9 posisi identik piksel (selisih <=6/255 di 1 ikon).
   Blok V3/V4/V4.x BELUM digabung (urutan cascade masih diandalkan) — kalau mau, lakukan bertahap dengan tes screenshot.
4. **Perbaikan bug:**
   - Desktop: deskripsi di section Interests & Portfolio terpusat sendiri sementara judulnya rata kiri -> sekarang sejajar (`margin-inline:0`).
   - Font Cinzel tidak pernah dimuat di index.html (hanya di partisi) -> label pembatas `I · About Me` dll jatuh ke Georgia. Sekarang satu `<link>` Google Fonts (Cinzel+Orbitron+Poppins) + preconnect di kedua halaman.
   - Partikel kursor dobel (dua handler `mousemove` membuat dua elemen per gerak) -> satu handler, dibatasi 24 elemen hidup, HP maks 1 per 90ms.
   - Jika CDN AOS gagal dimuat, semua elemen `data-aos` tetap transparan -> sekarang `html.no-aos` memaksa tampil. `<noscript>` juga ditambahkan (loader tidak menutup selamanya tanpa JS).
   - AOS di HP: `once:true`, durasi 700ms (tidak re-animasi bolak-balik saat scroll). `mirror` tetap di desktop.
   - API YouTube kini dimuat malas (baru saat music player pertama dibuka), bukan saat halaman dibuka.
   - Bubble hint partisi: maks 3x muncul tiap 40 dtk (sebelumnya selamanya tiap 20 dtk). Blok navbar lama (`.nav-indicator`) di script.js dibuang (theme.js yang mengurus).
   - partisi.js: `setInterval` progres loader tidak pernah di-clear -> diperbaiki.
5. **Tambahan kecil:** garis progres scroll di paling atas (`.scroll-progress`, juga di partisi.html), skip-link "Lewati ke konten", `::selection` berwarna tema,
   tab portofolio dapat ARIA (`role=tab/tabpanel`) + navigasi keyboard (panah, Home, End), estimasi waktu baca di kartu pilihan partisi (`± N menit baca`),
   favicon SVG inline, meta description + Open Graph dasar.
6. **Foto dikompres** (`Photo/*.jpeg`): 3.6MB -> 1.8MB total; sisi terpanjang maks 1600px, kualitas 82, orientasi EXIF dipertahankan. Semua `<img loading="lazy">` diberi `decoding="async"`.
   File yang tidak dipakai di HTML (`guidelogo*.png`, `logo cetas.jpeg`, `5d811633...jpeg`, `WhatsApp Image 2026-02-17...`) dibiarkan; aman dihapus bila mau memperkecil folder.
7. Cache-busting `?v=7`.
Diuji: Chromium headless (390px & 1280px, 3 tema): urutan loader (3 frame/tema), regresi piksel, interaksi (ganti tema 3x, tab via keyboard & swipe, lightbox, music panel, partikel, progres scroll,
tanpa overflow horizontal), halaman partisi (chooser + reader). Tanpa error JS. Belum di HP fisik / Safari iOS. Tes offline: ikon FA & font tampil fallback (normal).

### Catatan keamanan (PENTING sebelum/sesudah hosting)
- `YOUTUBE_API_KEY` ada telanjang di `script.js` (siapa pun bisa melihatnya lewat View Source). Di Google Cloud Console: batasi key ke **HTTP referrers** domain website lu
  (mis. `https://namalu.github.io/*`, `http://127.0.0.1:5503/*` untuk lokal) dan batasi API-nya hanya ke **YouTube Data API v3**. Kalau pernah terlanjur dipublikasikan/dibagikan, buat key baru.
- `SUPABASE_ANON_KEY` (yang `sb_publishable_...`) memang aman di frontend, TAPI pastikan Row Level Security aktif di tabel `guestbook_comments`:
  izinkan `select` + `insert` saja untuk anon; `update/delete` dan kolom `is_pinned` jangan bisa diubah anon (kalau tidak, pengunjung bisa mem-pin / menghapus pesan).

### Ide lanjutan (setelah V4.4)
- Gabungkan blok V3/V4/V4.x di `theme.css` jadi satu (bertahap + screenshot regresi 3 tema desktop & HP).
- Self-host font & ikon (hindari CDN) untuk kecepatan — butuh internet untuk mengunduh file font; di sesi ini jaringan dibatasi.
- Isi tab Projects (masih "Coming Soon") dan/atau og:image absolut setelah domain jadi.
- Uji di HP fisik & Safari iOS (terutama `color-mix`, `text-wrap:balance`, tirai loader).

## 10. Permintaan pemilik (riwayat singkat)
- Navbar liquid glass ala iOS, animasi halus; 3 mode (normal cerah berawan, sunset oranye, night Milky Way).
- Bukan warna ungu; warna harus selaras per mode; teks tidak boleh menyatu dengan latar.
- Logo hero: jangan pakai logo cetas / guidelogo (sudah dihapus di V3).
- Portofolio bergaya ekizr.com (tab Certificates / Tech Stack / Projects).
- Sunset realistis, pembatas section gaya Genshin Impact (tanpa menyalin aset resmi), teks responsif mobile+desktop,
  animasi tema lancar di HP setelah hosting, bagian portofolio mobile bagus.
- (V4.2) Hilangkan kotak persegi panjang bersudut siku di navbar; music player dan tombol partisi dijadikan liquid glass juga.
- Pemilik minta file md handoff ikut disertakan agar obrolan bisa dilanjut di sesi lain.
- (V4.3) Pemilik minta dimaksimalkan sampai limit dan md handoff disertakan; dikerjakan: sliding pill + swipe tab porto, navbar partisi liquid glass.
- (V4.4) Pemilik minta "maksimalin sampai kelar" dan md handoff disertakan; dikerjakan: loader modern, rapihin theme.css, perbaikan bug, kompres foto, a11y (lihat 9d).
