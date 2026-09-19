```javascript
/* =======================================================
   RADHAKRISHNA TAXI SERVICE
   MAIN JAVASCRIPT
======================================================= */


/* =======================================================
   MOBILE NAVIGATION
======================================================= */

const menuButton = document.querySelector(".menu-button");
const navLinks = document.querySelector(".nav-links");

if (menuButton && navLinks) {

    menuButton.addEventListener("click", (event) => {

        event.preventDefault();
        event.stopPropagation();

        const isOpen = navLinks.classList.toggle("active");

        menuButton.setAttribute(
            "aria-expanded",
            isOpen ? "true" : "false"
        );

        menuButton.setAttribute(
            "aria-label",
            isOpen ? "Close navigation" : "Open navigation"
        );

    });


    /* Close menu after clicking normal links */

    navLinks.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            navLinks.classList.remove("active");

            menuButton.setAttribute(
                "aria-expanded",
                "false"
            );

            menuButton.setAttribute(
                "aria-label",
                "Open navigation"
            );

        });

    });

}


/* =======================================================
   PACKAGE TOURS DROPDOWN
======================================================= */

const packageDropdown = document.querySelector(".nav-dropdown");
const packageToggle = document.querySelector(".nav-dropdown-toggle");

if (packageDropdown && packageToggle) {

    packageToggle.addEventListener("click", (event) => {

        event.preventDefault();
        event.stopPropagation();

        /*
         * On mobile, toggle the dropdown manually.
         * On desktop, CSS hover handles the dropdown.
         */

        if (window.innerWidth <= 700) {

            const isOpen =
                packageDropdown.classList.toggle("open");

            packageToggle.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );

        }

    });


    /* Close dropdown when clicking outside */

    document.addEventListener("click", (event) => {

        if (
            window.innerWidth <= 700 &&
            !packageDropdown.contains(event.target)
        ) {

            packageDropdown.classList.remove("open");

            packageToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    });


    /* Close dropdown after selecting a package */

    packageDropdown
        .querySelectorAll(".package-menu a")
        .forEach(link => {

            link.addEventListener("click", () => {

                packageDropdown.classList.remove("open");

                packageToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );


                /* Also close mobile navigation */

                if (navLinks) {
                    navLinks.classList.remove("active");
                }


                if (menuButton) {

                    menuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    menuButton.setAttribute(
                        "aria-label",
                        "Open navigation"
                    );

                }

            });

        });

}


/* =======================================================
   VEHICLE SLIDER
   MOBILE + DESKTOP FIX
======================================================= */

const sliderTrack =
    document.querySelector(".slider-track");

const slides =
    document.querySelectorAll(".slide");

const prevButton =
    document.querySelector(".slider-prev");

const nextButton =
    document.querySelector(".slider-next");

const dots =
    document.querySelectorAll(".slider-dots button");


let currentSlide = 0;
let sliderTimer = null;


/* Touch variables */

let touchStartX = 0;
let touchStartY = 0;
let touchCurrentX = 0;
let isTouching = false;
let isHorizontalSwipe = false;


/* -------------------------------------------------------
   UPDATE SLIDER
------------------------------------------------------- */

function updateSlider() {

    if (!sliderTrack || !slides.length) {
        return;
    }


    /*
     * Make sure current slide is valid.
     */

    if (currentSlide < 0) {
        currentSlide = slides.length - 1;
    }

    if (currentSlide >= slides.length) {
        currentSlide = 0;
    }


    /*
     * IMPORTANT:
     * Use the actual position of each slide instead of
     * translateX(100%).
     *
     * This works correctly when:
     * - slide width changes
     * - mobile layout changes
     * - gaps are present
     * - desktop/mobile CSS differs
     */

    const slidePosition =
        slides[currentSlide].offsetLeft;


    sliderTrack.style.transform =
        `translate3d(-${slidePosition}px, 0, 0)`;


    /*
     * Update active dot.
     */

    dots.forEach((dot, index) => {

        dot.classList.toggle(
            "active",
            index === currentSlide
        );

        dot.setAttribute(
            "aria-current",
            index === currentSlide
                ? "true"
                : "false"
        );

    });

}


/* -------------------------------------------------------
   NEXT SLIDE
------------------------------------------------------- */

function nextSlide() {

    if (!slides.length) {
        return;
    }

    currentSlide =
        (currentSlide + 1) % slides.length;

    updateSlider();

}


/* -------------------------------------------------------
   PREVIOUS SLIDE
------------------------------------------------------- */

function previousSlide() {

    if (!slides.length) {
        return;
    }

    currentSlide =
        (currentSlide - 1 + slides.length) %
        slides.length;

    updateSlider();

}


/* -------------------------------------------------------
   NEXT BUTTON
------------------------------------------------------- */

if (nextButton) {

    nextButton.addEventListener("click", (event) => {

        event.preventDefault();

        nextSlide();

        restartSlider();

    });

}


/* -------------------------------------------------------
   PREVIOUS BUTTON
------------------------------------------------------- */

if (prevButton) {

    prevButton.addEventListener("click", (event) => {

        event.preventDefault();

        previousSlide();

        restartSlider();

    });

}


/* -------------------------------------------------------
   DOT NAVIGATION
------------------------------------------------------- */

dots.forEach((dot, index) => {

    dot.addEventListener("click", (event) => {

        event.preventDefault();

        if (index >= slides.length) {
            return;
        }

        currentSlide = index;

        updateSlider();

        restartSlider();

    });

});


/* -------------------------------------------------------
   MOBILE TOUCH START
------------------------------------------------------- */

if (sliderTrack) {

    sliderTrack.addEventListener(
        "touchstart",
        (event) => {

            if (!event.touches || !event.touches.length) {
                return;
            }

            touchStartX =
                event.touches[0].clientX;

            touchStartY =
                event.touches[0].clientY;

            touchCurrentX =
                touchStartX;

            isTouching = true;
            isHorizontalSwipe = false;


            /*
             * Stop auto slider while user is touching it.
             */

            if (sliderTimer) {

                clearInterval(sliderTimer);

                sliderTimer = null;

            }

        },
        {
            passive: true
        }
    );


    /* ---------------------------------------------------
       MOBILE TOUCH MOVE
    --------------------------------------------------- */

    sliderTrack.addEventListener(
        "touchmove",
        (event) => {

            if (
                !isTouching ||
                !event.touches ||
                !event.touches.length
            ) {
                return;
            }


            touchCurrentX =
                event.touches[0].clientX;

            const currentY =
                event.touches[0].clientY;


            const diffX =
                touchCurrentX - touchStartX;

            const diffY =
                currentY - touchStartY;


            /*
             * Determine whether the user is swiping
             * horizontally or scrolling vertically.
             */

            if (
                Math.abs(diffX) > 10 &&
                Math.abs(diffX) > Math.abs(diffY)
            ) {

                isHorizontalSwipe = true;

                /*
                 * Prevent the page from scrolling sideways
                 * while the vehicle slider is being swiped.
                 */

                event.preventDefault();

            }

        },
        {
            passive: false
        }
    );


    /* ---------------------------------------------------
       MOBILE TOUCH END
    --------------------------------------------------- */

    sliderTrack.addEventListener(
        "touchend",
        () => {

            if (!isTouching) {
                return;
            }


            const swipeDistance =
                touchCurrentX - touchStartX;


            /*
             * 50px is the minimum swipe distance.
             */

            const minimumSwipeDistance = 50;


            if (
                isHorizontalSwipe &&
                Math.abs(swipeDistance) >=
                minimumSwipeDistance
            ) {

                if (swipeDistance < 0) {

                    /*
                     * Swipe left
                     * → next vehicle
                     */

                    nextSlide();

                } else {

                    /*
                     * Swipe right
                     * → previous vehicle
                     */

                    previousSlide();

                }

            }


            /*
             * Reset touch values.
             */

            touchStartX = 0;
            touchStartY = 0;
            touchCurrentX = 0;

            isTouching = false;
            isHorizontalSwipe = false;


            /*
             * Restart automatic slider.
             */

            restartSlider();

        },
        {
            passive: true
        }
    );


    /* ---------------------------------------------------
       MOBILE TOUCH CANCEL
    --------------------------------------------------- */

    sliderTrack.addEventListener(
        "touchcancel",
        () => {

            touchStartX = 0;
            touchStartY = 0;
            touchCurrentX = 0;

            isTouching = false;
            isHorizontalSwipe = false;

            restartSlider();

        },
        {
            passive: true
        }
    );

}


/* -------------------------------------------------------
   AUTO SLIDER
------------------------------------------------------- */

function startSlider() {

    /*
     * No need for auto-slide if there is
     * only one vehicle.
     */

    if (slides.length <= 1) {
        return;
    }


    /*
     * Prevent multiple timers.
     */

    if (sliderTimer) {
        clearInterval(sliderTimer);
    }


    sliderTimer = setInterval(
        nextSlide,
        5000
    );

}


/* -------------------------------------------------------
   RESTART AUTO SLIDER
------------------------------------------------------- */

function restartSlider() {

    if (sliderTimer) {

        clearInterval(
            sliderTimer
        );

        sliderTimer = null;

    }

    startSlider();

}


/* -------------------------------------------------------
   REPOSITION SLIDER AFTER RESIZE
------------------------------------------------------- */

let resizeTimer = null;

window.addEventListener(
    "resize",
    () => {

        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(() => {

            updateSlider();

        }, 150);

    },
    {
        passive: true
    }
);


/* -------------------------------------------------------
   INITIALIZE SLIDER
------------------------------------------------------- */

updateSlider();

startSlider();


/* =======================================================
   BOOKING FORM
======================================================= */

const bookingForm =
    document.querySelector("#booking-form");

if (bookingForm) {

    bookingForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            const pickup =
                document
                    .querySelector("#pickup")
                    ?.value
                    .trim();


            const drop =
                document
                    .querySelector("#drop")
                    ?.value
                    .trim();


            const date =
                document
                    .querySelector("#date")
                    ?.value;


            const time =
                document
                    .querySelector("#time")
                    ?.value;


            const passengers =
                document
                    .querySelector("#passengers")
                    ?.value;


            const vehicle =
                document
                    .querySelector("#vehicle")
                    ?.value;


            /*
             * Required fields
             */

            if (
                !pickup ||
                !drop ||
                !date ||
                !time
            ) {

                alert(
                    "Please fill in all required booking details."
                );

                return;

            }


            /*
             * WhatsApp booking message
             */

            const message =
`Hello Radhakrishna Taxi Service,

I would like to book a taxi.

Pickup: ${pickup}
Drop: ${drop}
Date: ${date}
Time: ${time}
Passengers: ${passengers || "Not specified"}
Vehicle: ${vehicle || "Not specified"}

Please confirm availability and fare.`;


            const whatsappURL =
                `https://wa.me/918147771217?text=${encodeURIComponent(message)}`;


            window.open(
                whatsappURL,
                "_blank",
                "noopener"
            );

        }
    );

}


/* =======================================================
   CURRENT YEAR
======================================================= */

document
    .querySelectorAll(".current-year")
    .forEach(element => {

        element.textContent =
            new Date().getFullYear();

    });


/* =======================================================
   SMOOTH SCROLL
======================================================= */

document
    .querySelectorAll('a[href^="#"]')
    .forEach(link => {

        link.addEventListener(
            "click",
            function (event) {

                const targetID =
                    this.getAttribute("href");


                if (
                    !targetID ||
                    targetID === "#" ||
                    targetID.length <= 1
                ) {

                    return;

                }


                /*
                 * Ignore links that do not point
                 * to an existing section.
                 */

                const target =
                    document.querySelector(targetID);


                if (!target) {
                    return;
                }


                event.preventDefault();


                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        );

    });


/* =======================================================
   DESTINATION DETAILS
======================================================= */

const destinationButtons =
    document.querySelectorAll(
        "[data-destination]"
    );


destinationButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const destination =
                button.getAttribute(
                    "data-destination"
                );


            if (!destination) {
                return;
            }


            const pickupField =
                document.querySelector("#pickup");


            const dropField =
                document.querySelector("#drop");


            /*
             * Put destination into drop field.
             */

            if (dropField) {

                dropField.value =
                    destination;

            }


            /*
             * Focus pickup field if empty.
             */

            if (
                pickupField &&
                !pickupField.value.trim()
            ) {

                pickupField.focus();

            }

        }
    );

});


/* =======================================================
   ACTIVE NAVIGATION ON SCROLL
======================================================= */

const sections =
    document.querySelectorAll(
        "section[id]"
    );


const navigationLinks =
    document.querySelectorAll(
        '.nav-links a[href^="#"]'
    );


if (
    sections.length &&
    navigationLinks.length
) {

    const updateActiveNavigation = () => {

        let currentSection = "";


        sections.forEach(section => {

            const sectionTop =
                section.offsetTop - 150;


            if (
                window.scrollY >= sectionTop
            ) {

                currentSection =
                    section.getAttribute("id");

            }

        });


        navigationLinks.forEach(link => {

            link.classList.remove("active");


            const href =
                link.getAttribute("href");


            if (
                href ===
                `#${currentSection}`
            ) {

                link.classList.add("active");

            }

        });

    };


    window.addEventListener(
        "scroll",
        updateActiveNavigation,
        {
            passive: true
        }
    );


    updateActiveNavigation();

}


/* =======================================================
   IMAGE ERROR HANDLING
======================================================= */

document
    .querySelectorAll("img")
    .forEach(image => {

        image.addEventListener(
            "error",
            () => {

                image.classList.add(
                    "image-error"
                );


                console.warn(
                    "Image could not be loaded:",
                    image.src
                );

            }
        );

    });


/* =======================================================
   PREVENT EMPTY WHATSAPP LINKS
======================================================= */

document
    .querySelectorAll(
        'a[href*="wa.me"]'
    )
    .forEach(link => {

        link.addEventListener(
            "click",
            event => {

                const href =
                    link.getAttribute("href");


                if (
                    !href ||
                    href.trim() === ""
                ) {

                    event.preventDefault();


                    console.warn(
                        "WhatsApp link is empty."
                    );

                }

            }
        );

    });


/* =======================================================
   BACK TO TOP BUTTON
======================================================= */

const backToTop =
    document.querySelector(
        ".back-to-top"
    );


if (backToTop) {

    window.addEventListener(
        "scroll",
        () => {

            if (
                window.scrollY > 500
            ) {

                backToTop.classList.add(
                    "show"
                );

            } else {

                backToTop.classList.remove(
                    "show"
                );

            }

        },
        {
            passive: true
        }
    );


    backToTop.addEventListener(
        "click",
        () => {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );

}


/* =======================================================
   CONSOLE MESSAGE
======================================================= */

console.log(
    "Radhakrishna Taxi Service website loaded successfully."
);