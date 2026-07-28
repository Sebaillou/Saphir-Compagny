/*==================================================
            RECOMPENSES.JS
==================================================*/

// Apparition progressive des cartes
document.addEventListener("DOMContentLoaded", () => {

    const cards = document.querySelectorAll(".reward-card");

    cards.forEach((card, index) => {

        card.style.opacity = "0";
        card.style.transform = "translateY(40px)";

        setTimeout(() => {

            card.style.transition =
                "opacity .6s ease, transform .6s ease";

            card.style.opacity = "1";
            card.style.transform = "translateY(0)";

        }, index * 120);

    });

});


/*==================================================
        Effet de lumière suivant la souris
==================================================*/

document.querySelectorAll(".reward-card").forEach(card => {

    card.addEventListener("mousemove", e => {

        const rect = card.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.background = `
            radial-gradient(
                circle at ${x}px ${y}px,
                rgba(110,150,255,.18),
                rgba(20,27,50,.97) 55%
            )
        `;

    });

    card.addEventListener("mouseleave", () => {

        card.style.background = `
            linear-gradient(
                145deg,
                rgba(25,33,62,.95),
                rgba(15,21,42,.96)
            )
        `;

    });

});


/*==================================================
        Animation du badge Saphir
==================================================*/

const badge = document.querySelector(".ultimate-badge");

if (badge) {

    setInterval(() => {

        badge.animate([
            {
                transform: "scale(1)"
            },
            {
                transform: "scale(1.05)"
            },
            {
                transform: "scale(1)"
            }
        ], {

            duration: 1800,
            easing: "ease-in-out"

        });

    }, 1800);

}


/*==================================================
        Apparition des infos
==================================================*/

const observer = new IntersectionObserver(entries => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("visible");

        }

    });

}, {

    threshold: 0.2

});

document.querySelectorAll(".info-card").forEach(card => {

    observer.observe(card);

});
