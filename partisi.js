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
