
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



/* ===== GLOBAL IMAGE LIGHTBOX ===== */
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
            ".hobby-image img, .achievement-image img, .gallery-photo img, .astro-card img, .img-box img, .about-img img"
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



