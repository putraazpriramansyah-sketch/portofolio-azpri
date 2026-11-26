# GuideFs Portfolio — Cosmic Liquid Glass Refresh

## Cara melihat
1. Ekstrak ZIP.
2. Buka folder `update portofolio guidefs`.
3. Jalankan `index.html` menggunakan Live Server (disarankan) atau browser.
4. Buka `partisi.html` melalui shortcut Partisi pada halaman utama.

## Theme
- Night menjadi mode awal jika belum ada pilihan tersimpan.
- Tombol tema berpindah Night → Sunset → Normal.
- Pilihan tema disimpan di localStorage browser.

## Perubahan utama
- Logo emblem 3D berubah karakter warna/tekstur mengikuti tema.
- Latar normal, sunset, dan night dibedakan lebih jelas.
- Canvas Milky Way dikurangi resolusi dan jumlah bintangnya serta dibatasi ke sekitar 20 FPS di layar kecil.
- Menghapus animasi scroll JavaScript dan partikel pointer yang terus membuat elemen DOM.
- Kartu menggunakan liquid glass dengan blur lebih ringan pada perangkat mobile.
- Halaman Partisi memiliki tab Partisi 1 dan Partisi 2 agar konten dibuka terpisah.
- Loader Partisi dibuat lebih ringan dan tidak memakai progress palsu yang berjalan lama.

Catatan: performa akhir tetap dipengaruhi browser, perangkat, dan koneksi internet karena font serta ikon masih memakai CDN.
