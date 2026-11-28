/* ===== LOADER V4.4b (gaya ekizr.com) =====
   Ikon -> "Welcome To My" -> "Portfolio Website" kata per kata -> pill dengan efek ketik. Menunggu halaman benar-benar selesai dimuat.
   Event "gf:ready" dikirim saat loader mulai keluar (dipakai bubble hint partisi). */

let skipWelcome = false;
try {
    skipWelcome = sessionStorage.getItem("skipWelcome") === "1";
    if (skipWelcome) { sessionStorage.removeItem("skipWelcome"); document.documentElement.classList.add("skip-welcome"); }
} catch (e) {}

const loaderEl = document.getElementById("loader");
const reducedMotionPref = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function gfReady(callback) {
    if (document.body.classList.contains("loading")) {
        window.addEventListener("gf:ready", callback, { once: true });
    } else {
        callback();
    }
}

function gfFinishLoading() {
    if (!document.body.classList.contains("loading")) return;
    document.body.classList.remove("loading");
    window.dispatchEvent(new Event("gf:ready"));
}

if (skipWelcome || !loaderEl) {
    if (loaderEl) loaderEl.style.display = "none";
    document.body.classList.remove("loading");
} else {
    document.body.classList.add("loading");

    const typeEl = document.getElementById("ld-type");
    const MIN_TIME = reducedMotionPref ? 600 : 2800;   // loader minimal tampil (ms)
    const MAX_TIME = 6500;                              // batas aman jika ada resource macet
    let pageLoaded = document.readyState === "complete";
    let minDone = false, closing = false;

    // efek ketik pada pill (seperti ekizr.com): mulai saat kata-kata sudah muncul
    if (typeEl) {
        const full = typeEl.dataset.text || "";
        if (reducedMotionPref) {
            typeEl.textContent = full;
        } else {
            setTimeout(() => {
                let i = 0;
                const timer = setInterval(() => {
                    typeEl.textContent = full.slice(0, ++i);
                    if (i >= full.length) clearInterval(timer);
                }, 90);
            }, 1200);
        }
    }

    function closeLoader() {
        if (closing) return;
        closing = true;
        loaderEl.classList.add("fade-out");
        setTimeout(gfFinishLoading, 180);
        setTimeout(() => { loaderEl.style.display = "none"; gfFinishLoading(); }, 950);
    }

    function tryClose() {
        if (minDone && pageLoaded) closeLoader();
    }

    if (!pageLoaded) window.addEventListener("load", () => { pageLoaded = true; tryClose(); }, { once: true });
    setTimeout(() => { minDone = true; tryClose(); }, MIN_TIME);
    setTimeout(closeLoader, MAX_TIME);   // jaring pengaman: resource macet / tab di background
}

/* ===== TYPING EFFECT ===== */
/* ===== TYPING EFFECT FIX ===== */
const textElement = document.querySelector(".typing-text");
const words = ["GuideFs", "Developer", "Azpri", "Student"];

let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingTimer;

function typeEffect() {
    if (!textElement) return;

    const currentWord = words[wordIndex];

    if (!isDeleting) {
        charIndex++;
        textElement.textContent = currentWord.slice(0, charIndex);

        if (charIndex === currentWord.length) {
            isDeleting = true;
            typingTimer = setTimeout(typeEffect, 1600);
            return;
        }

        typingTimer = setTimeout(typeEffect, 140);
    } else {
        charIndex--;
        textElement.textContent = currentWord.slice(0, charIndex);

        if (charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typingTimer = setTimeout(typeEffect, 350);
            return;
        }

        typingTimer = setTimeout(typeEffect, 75);
    }
}

if (textElement) {
    clearTimeout(typingTimer);
    textElement.textContent = "";
    typeEffect();
}



/* Navbar (pill + scroll-spy) dikelola theme.js. Blok .nav-indicator lama dibuang di V4.4. */


/* ===== AOS ANIMATIONS ===== */
const gfSmallScreen = window.innerWidth < 769;

if (typeof AOS !== "undefined") {
    AOS.init({
        duration: gfSmallScreen ? 700 : 900,
        once: gfSmallScreen,          // di HP animasi cukup sekali (hemat baterai & tidak patah saat scroll naik-turun)
        offset: gfSmallScreen ? 60 : 100,
        easing: "ease",
        mirror: !gfSmallScreen,
        disable: reducedMotionPref
    });
} else {
    // CDN AOS gagal dimuat: tampilkan semua konten (kalau tidak, elemen data-aos tetap transparan)
    document.documentElement.classList.add("no-aos");
}


/* ===== CONTACT YEAR ===== */
const contactYear = document.querySelector("#contact-year");

if (contactYear) {
    contactYear.textContent = new Date().getFullYear();
}


/* ASTRO GALLERY CONTROLS */
const astroTrack = document.querySelector("#astro-track");
const astroPrev = document.querySelector("#astro-prev");
const astroNext = document.querySelector("#astro-next");

if (astroTrack && astroPrev && astroNext) {
    astroNext.addEventListener("click", () => {
        astroTrack.scrollBy({
            left: astroTrack.clientWidth * 0.75,
            behavior: "smooth"
        });
    });

    astroPrev.addEventListener("click", () => {
        astroTrack.scrollBy({
            left: -astroTrack.clientWidth * 0.75,
            behavior: "smooth"
        });
    });
}


/* MOBILE LEGENDS GALLERY CONTROLS */
const mlTrack = document.querySelector("#ml-track");
const mlPrev = document.querySelector("#ml-prev");
const mlNext = document.querySelector("#ml-next");

if (mlTrack && mlPrev && mlNext) {
    mlNext.addEventListener("click", () => {
        mlTrack.scrollBy({
            left: mlTrack.clientWidth * 0.75,
            behavior: "smooth"
        });
    });

    mlPrev.addEventListener("click", () => {
        mlTrack.scrollBy({
            left: -mlTrack.clientWidth * 0.75,
            behavior: "smooth"
        });
    });
}


/* =========================================
   GUIDEFS SEAL SPARK EFFECT
========================================= */

const sealEffect = document.getElementById("seal-effect");

if (sealEffect) {

    sealEffect.addEventListener("click", function (event) {

        const rect = sealEffect.getBoundingClientRect();

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const sparkCount = 20;

        for (let i = 0; i < sparkCount; i++) {

            const spark = document.createElement("span");

            spark.classList.add("seal-spark");

            const angle = Math.random() * Math.PI * 2;

            const distance = 50 + Math.random() * 100;

            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;

            spark.style.left = centerX + "px";
            spark.style.top = centerY + "px";

            spark.style.setProperty("--spark-x", x + "px");
            spark.style.setProperty("--spark-y", y + "px");

            sealEffect.appendChild(spark);

            setTimeout(() => {
                spark.remove();
            }, 800);

        }

    });

}


/* ===== DRAG PORTFOLIO DENGAN KURSOR ===== */

const portfolioTrack = document.querySelector(".portfolio-grid");

if (portfolioTrack) {
    let isDragging = false;
    let startX = 0;
    let scrollStart = 0;
    let moved = false;

    portfolioTrack.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;

        isDragging = true;
        moved = false;
        startX = e.pageX;
        scrollStart = portfolioTrack.scrollLeft;
    });

    window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        const distance = e.pageX - startX;

        if (Math.abs(distance) > 4) {
            moved = true;
        }

        if (moved) {
            portfolioTrack.scrollLeft = scrollStart - distance;
        }
    });

    window.addEventListener("mouseup", () => {
        isDragging = false;
    });

    portfolioTrack.addEventListener("click", (e) => {
        if (moved) {
            e.preventDefault();
            e.stopPropagation();
            moved = false;
        }
    }, true);
}




/* ===== PORTFOLIO & ACHIEVEMENT LIGHTBOX ===== */
document.addEventListener("DOMContentLoaded", () => {
    const lightbox = document.createElement("div");
    lightbox.className = "image-lightbox";

    const enlargedImage = document.createElement("img");
    enlargedImage.alt = "Foto diperbesar";

    const closeButton = document.createElement("button");
    closeButton.className = "lightbox-close";
    closeButton.innerHTML = "&times;";
    closeButton.setAttribute("aria-label", "Tutup foto");

    lightbox.append(closeButton, enlargedImage);
    document.body.appendChild(lightbox);

    function openPhoto(photo) {
        enlargedImage.src = photo.currentSrc || photo.src;
        enlargedImage.alt = photo.alt || "Foto diperbesar";
        lightbox.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closePhoto() {
        lightbox.classList.remove("active");
        document.body.style.overflow = "";
    }

    document.addEventListener("click", (event) => {
        const photo = event.target.closest(
            ".portfolio-grid img, .achievement-image img, .portfolio-grid img, .astro-card img"
        );

        if (!photo || lightbox.contains(event.target)) return;

        openPhoto(photo);
    });

    closeButton.addEventListener("click", closePhoto);

    lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox) closePhoto();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closePhoto();
    });
});


/* (Blok partikel kursor ganda dibuang di V4.4: sudah ditangani createParticle di bagian bawah.) */


/* =====================================
   GUIDEFs GUESTBOOK - SUPABASE
===================================== */

// GANTI DENGAN DATA PROJECT SUPABASE LU
const SUPABASE_URL = "https://lurcvyhuajsamrqvsjma.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_SAUkc4td_NbczC_gWCT8pQ_gnhhMohW";

const guestbookForm = document.getElementById("guestbook-form");
const guestbookName = document.getElementById("guestbook-name");
const guestbookMessage = document.getElementById("guestbook-message");
const guestbookList = document.getElementById("guestbook-list");
const guestbookStatus = document.getElementById("guestbook-status");
const guestbookSubmit = document.getElementById("guestbook-submit");
const guestbookCount = document.getElementById("guestbook-count");

if (
    guestbookForm &&
    window.supabase &&
    SUPABASE_URL !== "MASUKKAN_PROJECT_URL" &&
    SUPABASE_ANON_KEY !== "MASUKKAN_ANON_KEY"
) {
    const guestbookDB = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );

// MEMUAT KOMENTAR
async function loadGuestbook() {
    guestbookList.innerHTML = "";

    const { data, error } = await guestbookDB
        .from("guestbook_comments")
        .select("id, name, message, created_at, is_pinned")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(30);

    if (error) {
        guestbookList.textContent = "Gagal memuat pesan.";
        console.error("Guestbook error:", error);
        return;
    }

    guestbookCount.textContent = `${data.length} pesan`;

    if (data.length === 0) {
        guestbookList.textContent =
            "Belum ada pesan. Jadilah yang pertama!";
        guestbookList.className = "guestbook-empty";
        return;
    }

    guestbookList.className = "";

    data.forEach(comment => {
        const card = document.createElement("div");
        card.className = "guestbook-comment";

        const header = document.createElement("div");
        header.className = "guestbook-comment-header";

        const author = document.createElement("div");
        author.className = "guestbook-comment-author";

        const name = document.createElement("span");
        name.className = "guestbook-comment-name";
        name.textContent = comment.name;

        author.appendChild(name);

        if (comment.is_pinned) {
            const pin = document.createElement("span");
            pin.className = "guestbook-pin";
            pin.innerHTML = '<i class="fas fa-thumbtack"></i>';
            author.appendChild(pin);
        }

        const date = document.createElement("span");
        date.className = "guestbook-comment-date";
        date.textContent = new Date(comment.created_at).toLocaleString(
            "id-ID",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );

        const message = document.createElement("p");
        message.className = "guestbook-comment-message";
        message.textContent = comment.message;

        header.append(author, date);
        card.append(header, message);

        guestbookList.appendChild(card);
    });
}
    // MENGIRIM KOMENTAR
    guestbookForm.addEventListener("submit", async event => {
        event.preventDefault();

        const name = guestbookName.value.trim();
        const message = guestbookMessage.value.trim();

        if (name.length < 2 || name.length > 30) {
            guestbookStatus.textContent =
                "Nama harus terdiri dari 2–30 karakter.";
            return;
        }

        if (message.length < 2 || message.length > 500) {
            guestbookStatus.textContent =
                "Pesan harus terdiri dari 2–500 karakter.";
            return;
        }

        guestbookSubmit.disabled = true;
        guestbookSubmit.textContent = "Mengirim...";
        guestbookStatus.textContent = "";

        const { error } = await guestbookDB
            .from("guestbook_comments")
            .insert({
                name: name,
                message: message
            });

        if (error) {
            console.error("Guestbook insert error:", error);

            guestbookStatus.textContent =
                "Pesan gagal dikirim. Coba lagi.";

            guestbookSubmit.disabled = false;
            guestbookSubmit.innerHTML =
                '<i class="fas fa-paper-plane"></i> Kirim Pesan';

            return;
        }

        guestbookForm.reset();

        guestbookStatus.textContent =
            "Pesan berhasil dikirim!";

        guestbookSubmit.disabled = false;
        guestbookSubmit.innerHTML =
            '<i class="fas fa-paper-plane"></i> Kirim Pesan';

        await loadGuestbook();
    });

    // TAMPILKAN KOMENTAR SAAT WEBSITE DIBUKA
    loadGuestbook();

} else if (guestbookForm) {
    console.error("Supabase belum dikonfigurasi.");
    guestbookStatus.textContent =
        "Guestbook belum terhubung ke database.";
}


/* ===== PARTISI HINT NOTIFICATION ===== */

window.addEventListener("load", () => {
    const shortcut = document.querySelector(".partisi-shortcut");

    if (!shortcut) return;

    // Tampilkan petunjuk
    function showPartisiHint() {
        if (window.innerWidth > 600) return;

        shortcut.classList.add("show-hint");

        setTimeout(() => {
            shortcut.classList.remove("show-hint");
        }, 4000);
    }

    // Tunggu loader selesai
    gfReady(() => setTimeout(showPartisiHint, 1200));

    // Muncul kembali tiap 40 detik, maksimal 3 kali (tidak mengganggu terus-menerus)
    let hintCount = 0;
    const hintTimer = setInterval(() => {
        showPartisiHint();
        if (++hintCount >= 3) clearInterval(hintTimer);
    }, 40000);
});

/* ===== CURSOR & TOUCH PARTICLES ===== */

let lastParticleTime = 0;
let liveParticles = 0;
const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

function createParticle(x, y) {
    const now = Date.now();

    // Batasi laju & jumlah partikel (HP lebih jarang) supaya DOM tidak membengkak saat scroll/geser
    if (now - lastParticleTime < (coarsePointer ? 90 : 25) || liveParticles >= 24) return;
    lastParticleTime = now;

    if (reducedMotionPref) return;

    const particle = document.createElement("span");
    particle.className = "cursor-particle";

    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;

    document.body.appendChild(particle);
    liveParticles++;

    setTimeout(() => {
        particle.remove();
        liveParticles--;
    }, 650);
}

// Komputer
document.addEventListener("mousemove", event => {
    createParticle(event.clientX, event.clientY);
});

// HP
document.addEventListener("touchmove", event => {
    const touch = event.touches[0];
    if (!touch) return;

    createParticle(touch.clientX, touch.clientY);
}, { passive: true });

