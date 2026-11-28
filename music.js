/* GuideFs V5 - music player (dipisah dari script.js supaya dipakai index.html & partisi.html). Status lagu tersimpan di localStorage[gf-music]. */
(function(){
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

/* ---- V5: status musik disimpan supaya lanjut saat pindah halaman (index <-> partisi) ---- */
const MKEY = "gf-music";
let saved = null, blocked = false, tick = 0;
try { saved = JSON.parse(localStorage.getItem(MKEY) || "null"); } catch (e) { saved = null; }
function saveState(extra) {
    try {
        const cur = Object.assign({}, JSON.parse(localStorage.getItem(MKEY) || "null") || {}, extra || {});
        if (youtubePlayer && playerReady && cur.id && youtubePlayer.getCurrentTime) {
            const tt = youtubePlayer.getCurrentTime();
            if (Number.isFinite(tt) && !(extra && "t" in extra)) cur.t = tt;
        }
        cur.vol = Number(volume.value);
        cur.ts = Date.now();
        localStorage.setItem(MKEY, JSON.stringify(cur));
    } catch (e) {}
}
addEventListener("pagehide", () => saveState());
document.addEventListener("visibilitychange", () => { if (document.hidden) saveState(); });

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

    if (open) {
        loadYouTubeAPI();      // API YouTube baru diunduh saat player pertama kali dibuka (hemat data & CPU saat load)
        searchInput.focus();
    }
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
                if (saved && saved.id) {
                    if (saved.vol != null) volume.value = saved.vol;
                    event.target.setVolume(Number(volume.value));
                    titleElement.textContent = saved.title || "Lagu terakhir";
                    artistElement.textContent = saved.artist || "";
                    const gap = saved.playing ? Math.min(8, (Date.now() - saved.ts) / 1000) : 0;
                    const start = Math.max(0, (saved.t || 0) + gap);
                    if (saved.playing) {
                        event.target.loadVideoById({ videoId: saved.id, startSeconds: start });
                        message.textContent = "Melanjutkan lagu...";
                        setTimeout(() => {
                            if (youtubePlayer.getPlayerState() !== YT.PlayerState.PLAYING) {
                                blocked = true;
                                message.textContent = "Browser menahan autoplay. Ketuk di mana saja untuk lanjut.";
                            }
                        }, 2500);
                    } else {
                        event.target.cueVideoById({ videoId: saved.id, startSeconds: start });
                        message.textContent = "Tekan play untuk lanjut.";
                    }
                } else {
                    event.target.setVolume(Number(volume.value));
                    message.textContent = "Cari lagu untuk mulai mendengarkan.";
                }
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
                    blocked = false;
                    saveState({ playing: true });
                    startProgress();
                } else {
                    if (state === YT.PlayerState.PAUSED) saveState({ playing: false });
                    stopProgress();
                }

                if (state === YT.PlayerState.ENDED) {
                    saveState({ playing: false, t: 0 });
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

// loadYouTubeAPI() dipanggil malas dari setPanel(true)

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
                saveState({ id: videoId, title: item.snippet.title, artist: item.snippet.channelTitle, t: 0, playing: true });
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
    saveState();
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
        if (++tick % 2 === 0) saveState();
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
    let moved = false;
    let suppressClick = false;

    let startX = 0;
    let startY = 0;
    let initialX = 0;
    let initialY = 0;

    const dragHandle = document.getElementById("music-trigger");

    // Posisi awal di kanan atas
    
    function setInitialPosition() {
        musicIsland.style.position = "fixed";
        musicIsland.style.top = "12px";
        musicIsland.style.right = "12px";
        musicIsland.style.left = "auto";
        musicIsland.style.bottom = "auto";
        musicIsland.style.zIndex = "9999";
        if (document.body.classList.contains("partisi-page") && matchMedia("(max-width:820px)").matches) {
            musicIsland.classList.add("at-bottom");
            musicIsland.style.top = "auto";
            musicIsland.style.bottom = "14px";
        }
    }


    setInitialPosition();

    if (dragHandle) {
        dragHandle.style.cursor = "grab";
        dragHandle.style.touchAction = "none";

        dragHandle.addEventListener("pointerdown", e => {
            if (e.button !== 0) return;

            dragging = true;
            moved = false;

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

        dragHandle.addEventListener("pointermove", e => {
            if (!dragging) return;

            const distanceX = e.clientX - startX;
            const distanceY = e.clientY - startY;

            if (
                Math.abs(distanceX) > 5 ||
                Math.abs(distanceY) > 5
            ) {
                moved = true;
            }

            if (!moved) return;

            const maxX = window.innerWidth - musicIsland.offsetWidth;
            const maxY = window.innerHeight - musicIsland.offsetHeight;

            const x = initialX + distanceX;
            const y = initialY + distanceY;

            musicIsland.style.left =
                `${Math.max(0, Math.min(x, maxX))}px`;

            musicIsland.style.top =
                `${Math.max(0, Math.min(y, maxY))}px`;
        });

        function stopDragging() {
            if (!dragging) return;

            dragging = false;
            dragHandle.style.cursor = "grab";

            if (moved) {
                suppressClick = true;

                setTimeout(() => {
                    suppressClick = false;
                }, 100);
            }
        }

        dragHandle.addEventListener("pointerup", stopDragging);
        dragHandle.addEventListener("pointercancel", stopDragging);
        dragHandle.addEventListener("lostpointercapture", stopDragging);

        // Mencegah capsule terbuka saat selesai digeser
        dragHandle.addEventListener("click", e => {
            if (suppressClick) {
                e.preventDefault();
                e.stopPropagation();
                suppressClick = false;
            }
        }, true);
    }

    window.addEventListener("resize", () => {
        if (!musicIsland.style.left || musicIsland.style.left === "auto") {
            setInitialPosition();
        }
    });
}


/* ---- V5: lanjutkan musik begitu ada interaksi bila autoplay ditahan browser; muat player otomatis bila ada lagu tersimpan ---- */
document.addEventListener("pointerdown", e => {
    if (!blocked || !youtubePlayer || !playerReady || e.target.closest("#music-play")) return;
    blocked = false;
    try { youtubePlayer.playVideo(); } catch (err) {}
}, true);
if (saved && saved.id) { titleElement.textContent = saved.title || "Lagu terakhir"; artistElement.textContent = saved.artist || ""; miniStatus.textContent = saved.playing ? "NOW PLAYING" : "MUSIC PLAYER"; loadYouTubeAPI(); }

})();
