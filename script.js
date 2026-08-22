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
     VEHICLE SLIDER
     ======================================================= */

  const slider = document.querySelector(".vehicle-slider");
  const track = document.querySelector(".slider-track");
  const slides = document.querySelectorAll(".slide");
  const prevButton = document.querySelector(".slider-prev");
  const nextButton = document.querySelector(".slider-next");
  const dotsContainer = document.querySelector(".slider-dots");

  if (
    slider &&
    track &&
    slides.length > 0 &&
    prevButton &&
    nextButton
  ) {

    let currentSlide = 0;
    let autoSlide;

    /* -------------------------------------------------------
       Create dots
       ------------------------------------------------------- */

    if (dotsContainer) {

      dotsContainer.innerHTML = "";

      slides.forEach((slide, index) => {

        const dot = document.createElement("button");

        dot.type = "button";

        dot.className = "slider-dot";

        dot.setAttribute(
          "aria-label",
          `Go to vehicle ${index + 1}`
        );

        dot.addEventListener("click", () => {

          currentSlide = index;

          updateSlider();

          restartAutoSlide();

        });

        dotsContainer.appendChild(dot);

      });

    }


    /* -------------------------------------------------------
       Update slider
       ------------------------------------------------------- */

    function updateSlider() {

      const slideWidth = slides[0].getBoundingClientRect().width;

      const gap = parseFloat(
        getComputedStyle(track).gap || "0"
      );

      const moveAmount =
        currentSlide * (slideWidth + gap);

      track.style.transform =
        `translateX(-${moveAmount}px)`;


      // Active slide
      slides.forEach((slide, index) => {

        slide.classList.toggle(
          "active",
          index === currentSlide
        );

      });


      // Active dots
      if (dotsContainer) {

        const dots =
          dotsContainer.querySelectorAll(".slider-dot");

        dots.forEach((dot, index) => {

          dot.classList.toggle(
            "active",
            index === currentSlide
          );

        });

      }

    }


    /* -------------------------------------------------------
       Next
       ------------------------------------------------------- */

    function nextSlide() {

      currentSlide++;

      if (currentSlide >= slides.length) {
        currentSlide = 0;
      }

      updateSlider();

    }


    /* -------------------------------------------------------
       Previous
       ------------------------------------------------------- */

    function previousSlide() {

      currentSlide--;

      if (currentSlide < 0) {
        currentSlide = slides.length - 1;
      }

      updateSlider();

    }


    /* -------------------------------------------------------
       Buttons
       ------------------------------------------------------- */

    nextButton.addEventListener(
      "click",
      () => {

        nextSlide();

        restartAutoSlide();

      }
    );


    prevButton.addEventListener(
      "click",
      () => {

        previousSlide();

        restartAutoSlide();

      }
    );


    /* -------------------------------------------------------
       Automatic sliding
       ------------------------------------------------------- */

    function startAutoSlide() {

      autoSlide = setInterval(() => {

        nextSlide();

      }, 5000);

    }


    function stopAutoSlide() {

      clearInterval(autoSlide);

    }


    function restartAutoSlide() {

      stopAutoSlide();

      startAutoSlide();

    }


    /* -------------------------------------------------------
       Pause when mouse is over slider
       ------------------------------------------------------- */

    slider.addEventListener(
      "mouseenter",
      stopAutoSlide
    );


    slider.addEventListener(
      "mouseleave",
      startAutoSlide
    );


    /* -------------------------------------------------------
       Touch / swipe support
       ------------------------------------------------------- */

    let touchStartX = 0;
    let touchEndX = 0;


    slider.addEventListener(
      "touchstart",
      event => {

        touchStartX =
          event.changedTouches[0].screenX;

        stopAutoSlide();

      },
      { passive: true }
    );


    slider.addEventListener(
      "touchend",
      event => {

        touchEndX =
          event.changedTouches[0].screenX;

        handleSwipe();

        startAutoSlide();

      },
      { passive: true }
    );


    function handleSwipe() {

      const difference =
        touchStartX - touchEndX;

      // Minimum swipe distance
      if (Math.abs(difference) < 50) {
        return;
      }

      if (difference > 0) {

        nextSlide();

      } else {

        previousSlide();

      }

    }


    /* -------------------------------------------------------
       Keyboard support
       ------------------------------------------------------- */

    slider.addEventListener(
      "keydown",
      event => {

        if (event.key === "ArrowRight") {

          nextSlide();

          restartAutoSlide();

        }

        if (event.key === "ArrowLeft") {

          previousSlide();

          restartAutoSlide();

        }

      }
    );


    /* -------------------------------------------------------
       Resize handling
       ------------------------------------------------------- */

    let resizeTimer;

    window.addEventListener(
      "resize",
      () => {

        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(() => {

          updateSlider();

        }, 150);

      }
    );


    /* -------------------------------------------------------
       Initial setup
       ------------------------------------------------------- */

    updateSlider();

    startAutoSlide();

  }


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