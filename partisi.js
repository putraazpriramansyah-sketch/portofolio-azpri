// ===== PARTISI PAGE =====

document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("partisi-loaded");
});

/* ===== PARTISI LOADER ===== */

document.body.classList.add("loading");

window.addEventListener("load", () => {
    const loader = document.getElementById("partisi-loader");

    if (!loader) return;

    setTimeout(() => {
        loader.classList.add("fade-out");

        setTimeout(() => {
            loader.style.display = "none";
            document.body.classList.remove("loading");
        }, 700);

    }, 2800);
});

