document.addEventListener('DOMContentLoaded', () => {

  // =========================
  // MOBILE NAVIGATION
  // =========================

  const menuButton = document.querySelector('.menu-button');
  const navigation = document.querySelector('.nav-links');

  if (menuButton && navigation) {

    menuButton.addEventListener('click', () => {

      const isOpen = navigation.classList.toggle('open');

      menuButton.setAttribute(
        'aria-expanded',
        String(isOpen)
      );

      menuButton.setAttribute(
        'aria-label',
        isOpen ? 'Close navigation' : 'Open navigation'
      );

    });

    navigation.querySelectorAll('a').forEach((link) => {

      link.addEventListener('click', () => {

        navigation.classList.remove('open');

        menuButton.setAttribute(
          'aria-expanded',
          'false'
        );

        menuButton.setAttribute(
          'aria-label',
          'Open navigation'
        );

      });

    });

  }


  // =========================
  // FOOTER YEAR
  // =========================

  const yearElement = document.querySelector('#year');

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }


  // =========================
  // WHATSAPP BOOKING FORM
  // =========================

  const bookingForm = document.querySelector('#booking-form');

  if (bookingForm) {

    bookingForm.addEventListener('submit', (event) => {

      event.preventDefault();

      const details = new FormData(bookingForm);

      const message =
`Hello Radhakrishna Taxi Service, I would like to book a taxi.

Name: ${details.get('name')}
Phone: ${details.get('phone')}
Pickup: ${details.get('pickup')}
Destination: ${details.get('destination')}
Travel date: ${details.get('date')}
Vehicle: ${details.get('vehicle')}

Please confirm availability and fare.

Thank you,
Radhakrishna Taxi Service`;

      const whatsappURL =
        `https://wa.me/918147771217?text=${encodeURIComponent(message)}`;

      window.open(whatsappURL, '_blank');

    });

  }


  // =========================
  // VEHICLE IMAGE SLIDER
  // =========================

  const slider = document.querySelector('.vehicle-slider');

  if (slider) {

    const track = slider.querySelector('.slider-track');
    const slides = slider.querySelectorAll('.slide');
    const nextBtn = slider.querySelector('.slider-next');
    const prevBtn = slider.querySelector('.slider-prev');
    const dotsContainer = slider.querySelector('.slider-dots');

    if (
      track &&
      slides.length > 0 &&
      nextBtn &&
      prevBtn &&
      dotsContainer
    ) {

      let currentSlide = 0;
      let autoSlide;


      // =========================
      // CREATE SLIDER DOTS
      // =========================

      slides.forEach((slide, index) => {

        const dot = document.createElement('button');

        dot.className = 'slider-dot';

        dot.setAttribute(
          'aria-label',
          `Go to slide ${index + 1}`
        );

        dot.addEventListener('click', () => {

          showSlide(index);
          restartAutoSlide();

        });

        dotsContainer.appendChild(dot);

      });


      const dots =
        dotsContainer.querySelectorAll('.slider-dot');


      // =========================
      // SHOW SLIDE
      // =========================

      function showSlide(index) {

        if (index >= slides.length) {

          currentSlide = 0;

        } else if (index < 0) {

          currentSlide = slides.length - 1;

        } else {

          currentSlide = index;

        }


        track.style.transform =
          `translateX(-${currentSlide * 100}%)`;


        dots.forEach((dot, i) => {

          dot.classList.toggle(
            'active',
            i === currentSlide
          );

        });

      }


      // =========================
      // NEXT BUTTON
      // =========================

      nextBtn.addEventListener('click', () => {

        showSlide(currentSlide + 1);

        restartAutoSlide();

      });


      // =========================
      // PREVIOUS BUTTON
      // =========================

      prevBtn.addEventListener('click', () => {

        showSlide(currentSlide - 1);

        restartAutoSlide();

      });


      // =========================
      // AUTOMATIC SLIDE
      // =========================

      function startAutoSlide() {

        autoSlide = setInterval(() => {

          showSlide(currentSlide + 1);

        }, 4000);

      }


      // =========================
      // RESTART AUTO SLIDE
      // =========================

      function restartAutoSlide() {

        clearInterval(autoSlide);

        startAutoSlide();

      }


      // =========================
      // START SLIDER
      // =========================

      showSlide(0);

      startAutoSlide();

    }

  }

});