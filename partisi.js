// ===== PARTISI PAGE =====

document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("partisi-loaded");
});


/* ===== PARTISI PAGE ===== */

document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("partisi-loaded");
});

/* ===== PARTISI LOADER ===== */

document.body.classList.add("loading");

window.addEventListener("load", () => {
    const loader = document.getElementById("partisi-loader");
    const progress = document.querySelector(".loader-progress-fill");
    const percent = document.getElementById("loader-percent");

    if (!loader || !progress || !percent) return;

    let value = 0;

    const loading = setInterval(() => {
        value += 1;

        progress.style.width = value + "%";
        percent.textContent = value + "%";

        if (value >= 100) {
            clearInterval(loading);

            setTimeout(() => {
                loader.classList.add("fade-out");

                setTimeout(() => {
                    loader.style.display = "none";
                    document.body.classList.remove("loading");
                }, 700);

            }, 300);
        }
    }, 30);
});

/* ===== CURSOR & TOUCH PARTICLES ===== */

let lastParticleTime = 0;

function createParticle(x, y) {
    const now = Date.now();

    // Batasi jumlah partikel di HP
    if (now - lastParticleTime < 25) return;
    lastParticleTime = now;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const particle = document.createElement("span");
    particle.className = "cursor-particle";

    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;

    document.body.appendChild(particle);

    setTimeout(() => particle.remove(), 650);
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