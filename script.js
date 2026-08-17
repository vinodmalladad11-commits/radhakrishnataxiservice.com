const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.nav-links');

menuButton.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', isOpen);
  menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});

navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

document.querySelector('#year').textContent = new Date().getFullYear();

document.querySelector('#booking-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const details = new FormData(event.currentTarget);
  const message = `Hello Radhakrishna Taxi Service, I would like to book a taxi.\n\nName: ${details.get('name')}\nPhone: ${details.get('phone')}\nPickup: ${details.get('pickup')}\nDestination: ${details.get('destination')}\nTravel date: ${details.get('date')}\nVehicle: ${details.get('vehicle')}`;
  window.open(`https://wa.me/918147771217?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
});
