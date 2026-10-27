
/* ===== LOADER ===== */
document.body.classList.add("loading");

window.addEventListener("load", () => {
    const loader = document.getElementById("loader");

    setTimeout(() => {
        loader.classList.add("fade-out");

        setTimeout(() => {
            loader.style.display = "none";
            document.body.classList.remove("loading");
        }, 700);
    }, 2800);
});

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

/* ===== MOBILE MENU ===== */
const menuToggle = document.querySelector("#menu-toggle");
const iconToggle = document.querySelector("#icon-toggle");
const navLinks = document.querySelector("#nav-links");

if (menuToggle && iconToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("active");

        iconToggle.classList.toggle("fa-bars", !isOpen);
        iconToggle.classList.toggle("fa-xmark", isOpen);

        menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
            iconToggle.classList.remove("fa-xmark");
            iconToggle.classList.add("fa-bars");
            menuToggle.setAttribute("aria-expanded", "false");
        });
    });

    document.addEventListener("click", event => {
        if (
            navLinks.classList.contains("active") &&
            !navLinks.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {
            navLinks.classList.remove("active");
            iconToggle.classList.remove("fa-xmark");
            iconToggle.classList.add("fa-bars");
            menuToggle.setAttribute("aria-expanded", "false");
        }
    });
}

/* ===== ACTIVE NAVIGATION ===== */
const pageSections = document.querySelectorAll("main section[id]");
const pageLinks = document.querySelectorAll(".nav-links a");

if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    pageLinks.forEach(link => {
                        const isActive =
                            link.getAttribute("href") ===
                            `#${entry.target.id}`;

                        link.classList.toggle("active", isActive);
                    });
                }
            });
        },
        {
            rootMargin: "-30% 0px -60% 0px"
        }
    );

    pageSections.forEach(section => {
        sectionObserver.observe(section);
    });
}


/* ===== AOS ANIMATIONS ===== */
if (typeof AOS !== "undefined") {
    AOS.init({
        duration: 900,
        once: false,
        offset: 100,
        easing: "ease",
        mirror: true
    });
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


/* ===== PURPLE CURSOR PARTICLE TRAIL ===== */
document.addEventListener("mousemove", (event) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    const particle = document.createElement("span");
    particle.className = "cursor-particle";

    particle.style.left = `${event.clientX}px`;
    particle.style.top = `${event.clientY}px`;

    document.body.appendChild(particle);

    setTimeout(() => {
        particle.remove();
    }, 650);
});


/* ===== GUIDEFs YOUTUBE MUSIC PLAYER ===== */

const island = document.getElementById("music-island");
const trigger = document.getElementById("music-trigger");
const panel = document.getElementById("music-panel");
const closeButton = document.getElementById("music-close");

const searchForm = document.getElementById("music-search");
const searchInput = document.getElementById("music-query");
const resultsBox = document.getElementById("music-results");
const message = document.getElementById("music-message");

const titleElement = document.getElementById("music-title");
const artistElement = document.getElementById("music-artist");
const miniStatus = document.getElementById("mini-status");

const playButton = document.getElementById("music-play");
const playIcon = document.getElementById("music-play-icon");
const seek = document.getElementById("music-seek");
const currentTimeLabel = document.getElementById("music-current");
const durationLabel = document.getElementById("music-duration");
const volume = document.getElementById("music-volume");

let youtubePlayer = null;
let playerReady = false;
let progressTimer = null;
let seeking = false;

/*
  Masukkan API key YouTube Data API v3 milik lu di sini.
  Jangan gunakan API key rahasia/server di frontend.
*/
const YOUTUBE_API_KEY = "AIzaSyC-F_NJREMOC_dQBbCZlTBmYMLwy7z5Zqc";

function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${minutes}:${String(secs).padStart(2, "0")}`;
}

/* BUKA / TUTUP PLAYER */

function setPanel(open) {
    panel.hidden = !open;
    island.classList.toggle("open", open);
    trigger.setAttribute("aria-expanded", String(open));
    trigger.setAttribute(
        "aria-label",
        open ? "Tutup music player" : "Buka music player"
    );

    if (open) searchInput.focus();
}

trigger.addEventListener("click", () => {
    setPanel(panel.hidden);
});

closeButton.addEventListener("click", () => {
    setPanel(false);
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") setPanel(false);
});

document.addEventListener("click", event => {
    if (!island.contains(event.target)) setPanel(false);
});

/* LOAD YOUTUBE IFRAME API */

function loadYouTubeAPI() {
    if (window.YT && window.YT.Player) {
        createPlayer();
        return;
    }

    if (document.getElementById("youtube-iframe-api")) return;

    const script = document.createElement("script");
    script.id = "youtube-iframe-api";
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
}

window.onYouTubeIframeAPIReady = function () {
    createPlayer();
};

function createPlayer() {
    if (youtubePlayer || !window.YT || !window.YT.Player) return;

    youtubePlayer = new YT.Player("youtube-player", {
        width: "300",
        height: "200",
        videoId: "",
        playerVars: {
            playsinline: 1,
            controls: 1,
            rel: 0
        },
        events: {
            onReady(event) {
                playerReady = true;
                event.target.setVolume(Number(volume.value));
                message.textContent = "Cari lagu untuk mulai mendengarkan.";
            },

            onStateChange(event) {
                const state = event.data;
                const playing = state === YT.PlayerState.PLAYING;

                playIcon.className = playing
                    ? "fas fa-pause"
                    : "fas fa-play";

                miniStatus.textContent = playing
                    ? "NOW PLAYING"
                    : "MUSIC PLAYER";

                if (state === YT.PlayerState.PLAYING) {
                    startProgress();
                } else {
                    stopProgress();
                }

                if (state === YT.PlayerState.ENDED) {
                    seek.value = 0;
                    currentTimeLabel.textContent = "0:00";
                }
            },

            onError(event) {
    console.error("YouTube Player Error:", event.data);

    const errors = {
        2: "ID video tidak valid.",
        5: "Pemutar mengalami masalah HTML5.",
        100: "Video dihapus atau tidak tersedia.",
        101: "Pemilik video melarang pemutaran tersemat.",
        150: "Pemilik video melarang pemutaran tersemat.",
        153: "Informasi referer tidak tersedia atau tidak valid."
    };

    message.textContent =
        errors[event.data] || "Video gagal diputar. Coba lagu lain.";
}
        }
    });
}

loadYouTubeAPI();

/* CARI LAGU */

searchForm.addEventListener("submit", async event => {
    event.preventDefault();

    const query = searchInput.value.trim();
    if (!query) return;

    if (
        !YOUTUBE_API_KEY ||
        YOUTUBE_API_KEY === "MASUKKAN_API_KEY_DI_SINI"
    ) {
        message.textContent =
            "Masukkan API key YouTube Data API v3 terlebih dahulu.";
        return;
    }

    resultsBox.replaceChildren();
    message.textContent = "Sedang mencari lagu...";

    try {
        const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    videoEmbeddable: "true",
    videoSyndicated: "true",
    maxResults: "25",
    q: query,
    key: YOUTUBE_API_KEY
});

        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?${params}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error?.message || "Pencarian gagal."
            );
        }

        if (!data.items || data.items.length === 0) {
            message.textContent = "Lagu tidak ditemukan.";
            return;
        }

        message.textContent = `${data.items.length} hasil ditemukan.`;

        data.items.forEach(item => {
            const videoId = item.id.videoId;
            if (!videoId) return;

            const button = document.createElement("button");
            button.type = "button";
            button.className = "music-result";

            const image = document.createElement("img");
            image.src =
                item.snippet.thumbnails.medium?.url ||
                item.snippet.thumbnails.default?.url;
            image.alt = "";
            image.loading = "lazy";

            const info = document.createElement("span");
            const videoTitle = document.createElement("strong");
            const channel = document.createElement("small");

            videoTitle.textContent = item.snippet.title;
            channel.textContent = item.snippet.channelTitle;

            info.append(videoTitle, channel);
            button.append(image, info);

            button.addEventListener("click", () => {
                if (!playerReady || !youtubePlayer) {
                    message.textContent =
                        "Pemutar sedang dimuat. Coba lagi sebentar.";
                    return;
                }

                titleElement.textContent = item.snippet.title;
                artistElement.textContent = item.snippet.channelTitle;
                message.textContent = "Memuat lagu...";

                youtubePlayer.loadVideoById(videoId);
                setPanel(true);
            });

            resultsBox.appendChild(button);
        });

    } catch (error) {
        console.error("YouTube search error:", error);
        message.textContent =
            "Pencarian gagal. Periksa API key dan koneksi internet.";
    }
});

/* PLAY / PAUSE */

playButton.addEventListener("click", () => {
    if (!playerReady || !youtubePlayer) {
        message.textContent = "Pemutar sedang dimuat.";
        return;
    }

    const state = youtubePlayer.getPlayerState();

    if (state === YT.PlayerState.PLAYING) {
        youtubePlayer.pauseVideo();
    } else if (
        state === YT.PlayerState.PAUSED ||
        state === YT.PlayerState.CUED
    ) {
        youtubePlayer.playVideo();
    } else {
        message.textContent = "Pilih lagu dari hasil pencarian dahulu.";
    }
});

/* VOLUME */

volume.addEventListener("input", () => {
    if (playerReady && youtubePlayer) {
        youtubePlayer.setVolume(Number(volume.value));
    }
});

/* PROGRESS LAGU */

function startProgress() {
    stopProgress();

    progressTimer = setInterval(() => {
        if (!youtubePlayer || !playerReady || seeking) return;

        const duration = youtubePlayer.getDuration();
        const current = youtubePlayer.getCurrentTime();

        if (!Number.isFinite(duration) || duration <= 0) return;

        seek.max = duration;
        seek.value = current;

        currentTimeLabel.textContent = formatTime(current);
        durationLabel.textContent = formatTime(duration);
    }, 500);
}

function stopProgress() {
    if (progressTimer !== null) {
        clearInterval(progressTimer);
        progressTimer = null;
    }
}

seek.addEventListener("input", () => {
    seeking = true;
    currentTimeLabel.textContent = formatTime(Number(seek.value));
});

seek.addEventListener("change", () => {
    if (playerReady && youtubePlayer) {
        youtubePlayer.seekTo(Number(seek.value), true);
    }

    seeking = false;
});


/* ===== DRAG MUSIC CAPSULE ===== */

const musicIsland = document.getElementById("music-island");

if (musicIsland) {
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let initialX = 0;
    let initialY = 0;

    musicIsland.style.position = "fixed";
    musicIsland.style.right = "20px";
    musicIsland.style.bottom = "20px";
    musicIsland.style.left = "auto";
    musicIsland.style.top = "auto";
    musicIsland.style.zIndex = "9999";

    // Gunakan tombol capsule sebagai area drag
    const dragHandle = document.getElementById("music-trigger");

    if (dragHandle) {
        dragHandle.style.cursor = "grab";
        dragHandle.style.touchAction = "none";

        dragHandle.addEventListener("pointerdown", (e) => {
            if (e.button !== 0) return;

            dragging = true;

            const rect = musicIsland.getBoundingClientRect();

            startX = e.clientX;
            startY = e.clientY;
            initialX = rect.left;
            initialY = rect.top;

            musicIsland.style.left = `${rect.left}px`;
            musicIsland.style.top = `${rect.top}px`;
            musicIsland.style.right = "auto";
            musicIsland.style.bottom = "auto";

            dragHandle.style.cursor = "grabbing";
            dragHandle.setPointerCapture(e.pointerId);
            e.preventDefault();
        });

        dragHandle.addEventListener("pointermove", (e) => {
            if (!dragging) return;

            const maxX = window.innerWidth - musicIsland.offsetWidth;
            const maxY = window.innerHeight - musicIsland.offsetHeight;

            const x = initialX + e.clientX - startX;
            const y = initialY + e.clientY - startY;

            musicIsland.style.left =
                `${Math.max(0, Math.min(x, maxX))}px`;

            musicIsland.style.top =
                `${Math.max(0, Math.min(y, maxY))}px`;
        });

        function stopDragging() {
            dragging = false;
            dragHandle.style.cursor = "grab";
        }

        dragHandle.addEventListener("pointerup", stopDragging);
        dragHandle.addEventListener("pointercancel", stopDragging);
        dragHandle.addEventListener("lostpointercapture", stopDragging);
    }
}




