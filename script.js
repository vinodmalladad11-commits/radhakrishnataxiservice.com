/* =========================================================
   RADHAKRISHNA TAXI SERVICE
   Main Website JavaScript
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =======================================================
     MOBILE NAVIGATION
     ======================================================= */

  const menuButton = document.querySelector(".menu-button");
  const navLinks = document.querySelector(".nav-links");

  if (menuButton && navLinks) {

    menuButton.addEventListener("click", () => {

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

    // Close menu after clicking a navigation link
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
   VEHICLE SLIDER — STABLE RESPONSIVE VERSION
   ======================================================= */

(() => {
  const slider = document.querySelector(".vehicle-slider");

  if (!slider) return;

  const track = slider.querySelector(".slider-track");
  const slides = Array.from(slider.querySelectorAll(".slide"));
  const prevBtn = slider.querySelector(".slider-prev");
  const nextBtn = slider.querySelector(".slider-next");
  const dotsWrap = slider.querySelector(".slider-dots");

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  let autoplayTimer = null;
  let startX = 0;
  let isDragging = false;

  /* -----------------------------------------------
     CREATE DOTS
  ----------------------------------------------- */

  if (dotsWrap) {
    dotsWrap.innerHTML = "";

    slides.forEach((_, index) => {
      const dot = document.createElement("button");

      dot.type = "button";
      dot.className = "slider-dot";
      dot.setAttribute("aria-label", `Go to slide ${index + 1}`);

      dot.addEventListener("click", () => {
        goToSlide(index);
        restartAutoplay();
      });

      dotsWrap.appendChild(dot);
    });
  }

  const dots = dotsWrap
    ? Array.from(dotsWrap.querySelectorAll(".slider-dot"))
    : [];

  /* -----------------------------------------------
     MOVE SLIDER
  ----------------------------------------------- */

  function goToSlide(index) {
    currentIndex =
      (index + slides.length) % slides.length;

    track.style.transform =
      `translateX(-${currentIndex * 100}%)`;

    updateDots();
  }

  /* -----------------------------------------------
     UPDATE DOTS
  ----------------------------------------------- */

  function updateDots() {
    dots.forEach((dot, index) => {
      const active = index === currentIndex;

      dot.classList.toggle("active", active);
      dot.setAttribute("aria-current", active ? "true" : "false");
    });
  }

  /* -----------------------------------------------
     NEXT / PREVIOUS
  ----------------------------------------------- */

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function previousSlide() {
    goToSlide(currentIndex - 1);
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      nextSlide();
      restartAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      previousSlide();
      restartAutoplay();
    });
  }

  /* -----------------------------------------------
     AUTOPLAY
  ----------------------------------------------- */

  function startAutoplay() {
    stopAutoplay();

    autoplayTimer = setInterval(() => {
      nextSlide();
    }, 5000);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function restartAutoplay() {
    startAutoplay();
  }

  /* -----------------------------------------------
     PAUSE WHEN MOUSE IS OVER SLIDER
  ----------------------------------------------- */

  slider.addEventListener("mouseenter", stopAutoplay);

  slider.addEventListener("mouseleave", startAutoplay);

  /* -----------------------------------------------
     MOBILE SWIPE
  ----------------------------------------------- */

  slider.addEventListener(
    "touchstart",
    (event) => {
      if (!event.touches.length) return;

      startX = event.touches[0].clientX;
      isDragging = true;

      stopAutoplay();
    },
    { passive: true }
  );

  slider.addEventListener(
    "touchend",
    (event) => {
      if (!isDragging || !event.changedTouches.length) return;

      const endX = event.changedTouches[0].clientX;
      const distance = endX - startX;

      isDragging = false;

      if (Math.abs(distance) > 50) {
        if (distance < 0) {
          nextSlide();
        } else {
          previousSlide();
        }
      }

      startAutoplay();
    },
    { passive: true }
  );

  /* -----------------------------------------------
     KEYBOARD CONTROL
  ----------------------------------------------- */

  document.addEventListener("keydown", (event) => {
    if (!slider.matches(":hover")) return;

    if (event.key === "ArrowRight") {
      nextSlide();
      restartAutoplay();
    }

    if (event.key === "ArrowLeft") {
      previousSlide();
      restartAutoplay();
    }
  });

  /* -----------------------------------------------
     RESIZE SAFETY
  ----------------------------------------------- */

  window.addEventListener("resize", () => {
    goToSlide(currentIndex);
  });

  /* -----------------------------------------------
     INITIALIZE
  ----------------------------------------------- */

  goToSlide(0);
  startAutoplay();

})();


  /* =======================================================
     BOOKING FORM → WHATSAPP
     ======================================================= */

  const bookingForm =
    document.getElementById("booking-form");


  if (bookingForm) {

    bookingForm.addEventListener(
      "submit",
      event => {

        event.preventDefault();


        const formData =
          new FormData(bookingForm);


        const name =
          formData.get("name") || "";


        const phone =
          formData.get("phone") || "";


        const pickup =
          formData.get("pickup") || "";


        const destination =
          formData.get("destination") || "";


        const date =
          formData.get("date") || "";


        const vehicle =
          formData.get("vehicle") || "";


        /* ---------------------------------------------------
           Format date
           --------------------------------------------------- */

        let formattedDate = date;

        if (date) {

          const dateObject =
            new Date(`${date}T00:00:00`);

          formattedDate =
            dateObject.toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
              }
            );

        }


        /* ---------------------------------------------------
           WhatsApp message
           --------------------------------------------------- */

        const message =
`🚕 RADHAKRISHNA TAXI SERVICE

📋 TAXI BOOKING REQUEST

👤 Name: ${name}
📱 Phone: ${phone}

📍 Pickup: ${pickup}
🏁 Destination: ${destination}

📅 Travel Date: ${formattedDate}

🚗 Vehicle: ${vehicle}

Please confirm availability and fare.

Thank you,
Radhakrishna Taxi Service`;


        const whatsappNumber =
          "918147771217";


        const whatsappURL =
          `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;


        window.open(
          whatsappURL,
          "_blank",
          "noopener,noreferrer"
        );

      }
    );

  }


  /* =======================================================
     SET CURRENT YEAR
     ======================================================= */

  const yearElement =
    document.getElementById("year");


  if (yearElement) {

    yearElement.textContent =
      new Date().getFullYear();

  }


  /* =======================================================
     SMOOTH SCROLL
     ======================================================= */

  document.querySelectorAll(
    'a[href^="#"]'
  ).forEach(link => {

    link.addEventListener(
      "click",
      event => {

        const targetID =
          link.getAttribute("href");


        if (
          !targetID ||
          targetID === "#"
        ) {

          return;

        }


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

  const destinationDetails =
    document.querySelectorAll(
      ".destination-list details"
    );


  destinationDetails.forEach(detail => {

    detail.addEventListener(
      "toggle",
      () => {

        if (!detail.open) {
          return;
        }


        destinationDetails.forEach(otherDetail => {

          if (
            otherDetail !== detail &&
            otherDetail.open
          ) {

            otherDetail.removeAttribute("open");

          }

        });

      }
    );

  });


  /* =======================================================
     ACTIVE NAVIGATION ON SCROLL
     ======================================================= */

  const sections =
    document.querySelectorAll(
      "main section[id]"
    );


  const navigationItems =
    document.querySelectorAll(
      '.nav-links a[href^="#"]'
    );


  if (
    sections.length > 0 &&
    navigationItems.length > 0
  ) {

    const observer =
      new IntersectionObserver(
        entries => {

          entries.forEach(entry => {

            if (!entry.isIntersecting) {
              return;
            }


            const id =
              entry.target.getAttribute("id");


            navigationItems.forEach(link => {

              link.classList.remove(
                "active"
              );


              if (
                link.getAttribute("href") ===
                `#${id}`
              ) {

                link.classList.add(
                  "active"
                );

              }

            });

          });

        },
        {
          rootMargin:
            "-30% 0px -60% 0px"
        }
      );


    sections.forEach(section => {

      observer.observe(section);

    });

  }


  /* =======================================================
     IMAGE ERROR HANDLING
     ======================================================= */

  document.querySelectorAll("img").forEach(image => {

    image.addEventListener(
      "error",
      () => {

        image.classList.add(
          "image-error"
        );

      }
    );

  });


  /* =======================================================
     PREVENT EMPTY WHATSAPP LINKS
     ======================================================= */

  document.querySelectorAll(
    'a[href*="wa.me"]'
  ).forEach(link => {

    link.addEventListener(
      "click",
      () => {

        link.setAttribute(
          "rel",
          "noopener noreferrer"
        );

      }
    );

  });


  /* =======================================================
     BACK TO TOP
     ======================================================= */

  let backToTop =
    document.querySelector(
      ".back-to-top"
    );


  if (!backToTop) {

    backToTop =
      document.createElement("button");

    backToTop.className =
      "back-to-top";

    backToTop.type =
      "button";

    backToTop.setAttribute(
      "aria-label",
      "Back to top"
    );

    backToTop.innerHTML =
      "↑";

    document.body.appendChild(
      backToTop
    );

  }


  window.addEventListener(
    "scroll",
    () => {

      if (window.scrollY > 500) {

        backToTop.classList.add(
          "visible"
        );

      } else {

        backToTop.classList.remove(
          "visible"
        );

      }

    },
    { passive: true }
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


  /* =======================================================
     CONSOLE MESSAGE
     ======================================================= */

  console.log(
    "Radhakrishna Taxi Service website loaded successfully."
  );

});