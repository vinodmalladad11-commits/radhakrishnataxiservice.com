/* =========================================================
   RADHAKRISHNA TAXI SERVICE
   Main JavaScript
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* ================= MOBILE MENU ================= */

    const menuToggle =
        document.getElementById("menuToggle");

    const mainNav =
        document.getElementById("mainNav");


    if (menuToggle && mainNav) {

        menuToggle.addEventListener("click", function () {

            const isOpen =
                mainNav.classList.toggle("open");

            menuToggle.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );

        });


        mainNav
            .querySelectorAll("a")
            .forEach(function (link) {

                link.addEventListener("click", function () {

                    mainNav.classList.remove("open");

                    menuToggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                });

            });

    }


    /* ================= PACKAGE DROPDOWN MOBILE ================= */

    const dropdown =
        document.querySelector(".nav-dropdown");

    const dropdownButton =
        document.querySelector(".dropdown-button");


    if (dropdown && dropdownButton) {

        dropdownButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                if (
                    window.innerWidth <= 820
                ) {

                    dropdown.classList.toggle("open");

                }

            }
        );

    }


    /* ================= CURRENT YEAR ================= */

    const currentYear =
        document.getElementById("currentYear");


    if (currentYear) {

        currentYear.textContent =
            new Date().getFullYear();

    }


    /* ================= CLOSE MENU ON OUTSIDE CLICK ================= */

    document.addEventListener(
        "click",
        function (event) {

            if (
                window.innerWidth <= 820 &&
                mainNav &&
                menuToggle &&
                mainNav.classList.contains("open")
            ) {

                const clickedInsideNav =
                    mainNav.contains(event.target);

                const clickedMenuButton =
                    menuToggle.contains(event.target);

                if (
                    !clickedInsideNav &&
                    !clickedMenuButton
                ) {

                    mainNav.classList.remove("open");

                    menuToggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }

            }

        }
    );


    /* ================= SMOOTH INTERNAL LINKS ================= */

    document
        .querySelectorAll('a[href^="#"]')
        .forEach(function (link) {

            link.addEventListener(
                "click",
                function (event) {

                    const targetId =
                        this.getAttribute("href");

                    if (
                        !targetId ||
                        targetId === "#"
                    ) {
                        return;
                    }

                    const target =
                        document.querySelector(targetId);

                    if (target) {

                        event.preventDefault();

                        target.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    }

                }
            );

        });


    /* ================= HEADER SHADOW ================= */

    const header =
        document.querySelector(".site-header");


    function updateHeader() {

        if (!header) {
            return;
        }

        if (window.scrollY > 20) {

            header.style.boxShadow =
                "0 5px 25px rgba(16,45,53,.08)";

        } else {

            header.style.boxShadow = "none";

        }

    }


    window.addEventListener(
        "scroll",
        updateHeader,
        { passive: true }
    );


    updateHeader();


    /* ================= PREVENT EMPTY LINKS ================= */

    document
        .querySelectorAll('a[href="#"]')
        .forEach(function (link) {

            link.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                }
            );

        });

});