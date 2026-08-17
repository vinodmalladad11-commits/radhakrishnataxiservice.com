document.addEventListener('DOMContentLoaded', () => {

  // =========================
  // MOBILE NAVIGATION
  // =========================

  const menuButton = document.querySelector('.menu-button');
  const navigation = document.querySelector('.nav-links');

  if (menuButton && navigation) {

    menuButton.addEventListener('click', () => {
      const isOpen = navigation.classList.toggle('open');

      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute(
        'aria-label',
        isOpen ? 'Close navigation' : 'Open navigation'
      );
    });

    navigation.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navigation.classList.remove('open');

        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Open navigation');
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
Vehicle: ${details.get('vehicle')}`;

      const whatsappURL =
        `https://wa.me/918147771217?text=${encodeURIComponent(message)}`;

      window.open(whatsappURL, '_blank');
    });

  }

});
