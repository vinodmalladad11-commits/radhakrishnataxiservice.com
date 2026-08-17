// Local Storage Keys
const STORAGE_KEYS = {
  BOOKINGS: 'taxi_bookings',
  VEHICLES: 'taxi_vehicles',
  CONTACTS: 'taxi_contacts',
  TOURS: 'taxi_tours',
  ADMIN_CODE: 'taxi_admin_code',
  IS_LOGGED_IN: 'taxi_logged_in',
};

// Default Admin Code (should be changed in production)
const DEFAULT_ADMIN_CODE = 'admin2024';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  attachEventListeners();
  loadDashboard();
});

// Initialize App
function initializeApp() {
  // Check if user is logged in
  if (!localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN)) {
    showLoginScreen();
  } else {
    showAdminPanel();
    loadDashboard();
  }

  // Initialize default admin code if not set
  if (!localStorage.getItem(STORAGE_KEYS.ADMIN_CODE)) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_CODE, DEFAULT_ADMIN_CODE);
  }

  // Load sample data if empty
  loadSampleData();
}

// Show/Hide Screens
function showLoginScreen() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('adminPanel').style.display = 'none';
}

function showAdminPanel() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'flex';
}

// Load Sample Data
function loadSampleData() {
  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    const sampleBookings = [
      {
        id: 1,
        name: 'Rajesh Kumar',
        phone: '9876543210',
        pickup: 'Mangalore Airport',
        destination: 'Downtown Mangalore',
        date: '2024-12-20',
        vehicle: 'Dzire / Etios',
        status: 'pending',
        notes: '',
      },
      {
        id: 2,
        name: 'Priya Singh',
        phone: '9876543211',
        pickup: 'MG Road',
        destination: 'Pilikula',
        date: '2024-12-19',
        vehicle: 'Innova',
        status: 'confirmed',
        notes: '',
      },
      {
        id: 3,
        name: 'Arjun Patel',
        phone: '9876543212',
        pickup: 'Panambur Beach',
        destination: 'Udupi',
        date: '2024-12-18',
        vehicle: 'Innova Crysta',
        status: 'completed',
        notes: '',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(sampleBookings));
  }

  if (!localStorage.getItem(STORAGE_KEYS.VEHICLES)) {
    const sampleVehicles = [
      {
        id: 1,
        type: 'Comfort Sedan',
        model: 'Maruti Dzire',
        capacity: 4,
        price: 13,
        status: 'available',
      },
      {
        id: 2,
        type: 'Comfort Sedan',
        model: 'Toyota Etios',
        capacity: 4,
        price: 13,
        status: 'available',
      },
      {
        id: 3,
        type: 'Family SUV',
        model: 'Toyota Innova',
        capacity: 6,
        price: 18,
        status: 'booked',
      },
      {
        id: 4,
        type: 'Premium SUV',
        model: 'Innova Crysta',
        capacity: 6,
        price: 20,
        status: 'available',
      },
      {
        id: 5,
        type: 'Family MPV',
        model: 'Maruti Ertiga',
        capacity: 6,
        price: 16,
        status: 'available',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(sampleVehicles));
  }

  if (!localStorage.getItem(STORAGE_KEYS.TOURS)) {
    const sampleTours = [
      {
        id: 1,
        name: 'Coastal Karnataka Tour',
        destinations: ['Udupi', 'Murudeshwar', 'Gokarna'],
        duration: '3 days',
      },
      {
        id: 2,
        name: 'Coffee Country Tour',
        destinations: ['Coorg', 'Chikmagalur', 'Kudremukh'],
        duration: '2 days',
      },
      {
        id: 3,
        name: 'Heritage Tour',
        destinations: ['Mysore', 'Srirangapatna', 'Hampi'],
        duration: '4 days',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.TOURS, JSON.stringify(sampleTours));
  }

  if (!localStorage.getItem(STORAGE_KEYS.CONTACTS)) {
    const sampleContacts = [
      {
        id: 1,
        name: 'Vivek Desai',
        phone: '9876543220',
        email: 'vivek@email.com',
        message: 'Interested in airport transfer service',
        date: '2024-12-15',
      },
      {
        id: 2,
        name: 'Sneha Sharma',
        phone: '9876543221',
        email: 'sneha@email.com',
        message: 'Looking for group travel options',
        date: '2024-12-14',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(sampleContacts));
  }
}

// Attach Event Listeners
function attachEventListeners() {
  // Login
  document.getElementById('loginForm').addEventListener('submit', handleLogin);

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);

  // Navigation
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const section = item.dataset.section;
      showSection(section);
    });
  });

  // Bookings
  document.getElementById('bookingSearch')?.addEventListener('input', filterBookings);
  document.getElementById('bookingStatus')?.addEventListener('change', filterBookings);

  // Fleet
  document.getElementById('addVehicleBtn')?.addEventListener('click', openAddVehicleModal);
  document.getElementById('vehicleForm')?.addEventListener('submit', handleSaveVehicle);

  // Tours
  document.getElementById('addTourBtn')?.addEventListener('click', openAddTourModal);

  // Contacts
  document.getElementById('contactSearch')?.addEventListener('input', filterContacts);

  // Settings
  document.getElementById('settingsForm')?.addEventListener('submit', handleSaveSettings);
  document.getElementById('adminSettingsForm')?.addEventListener('submit', handleChangeAdminCode);
  document.getElementById('clearDataBtn')?.addEventListener('click', handleClearData);
}

// Login Handler
function handleLogin(e) {
  e.preventDefault();
  const code = document.getElementById('adminCode').value;
  const storedCode = localStorage.getItem(STORAGE_KEYS.ADMIN_CODE);

  if (code === storedCode) {
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    showAdminPanel();
    document.getElementById('loginForm').reset();
    loadDashboard();
  } else {
    alert('Invalid admin code. Please try again.');
    document.getElementById('adminCode').value = '';
  }
}

// Logout Handler
function handleLogout() {
  localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
  showLoginScreen();
  document.getElementById('adminCode').value = '';
}

// Show Section
function showSection(section) {
  // Hide all sections
  document.querySelectorAll('.section').forEach((s) => {
    s.classList.remove('active');
  });

  // Show selected section
  const sectionElement = document.getElementById(section);
  if (sectionElement) {
    sectionElement.classList.add('active');
  }

  // Update nav
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.remove('active');
    if (item.dataset.section === section) {
      item.classList.add('active');
    }
  });

  // Update header
  const titles = {
    dashboard: { title: 'Dashboard', subtitle: 'Overview of your taxi service' },
    bookings: { title: 'Bookings', subtitle: 'Manage all taxi bookings' },
    fleet: { title: 'Fleet Management', subtitle: 'Manage your vehicle fleet' },
    tours: { title: 'Tours', subtitle: 'Manage tour packages' },
    contacts: { title: 'Contacts', subtitle: 'Customer inquiries and messages' },
    settings: { title: 'Settings', subtitle: 'Admin settings and configuration' },
  };

  if (titles[section]) {
    document.getElementById('sectionTitle').textContent = titles[section].title;
    document.getElementById('sectionSubtitle').textContent = titles[section].subtitle;
  }

  // Load section data
  if (section === 'dashboard') {
    loadDashboard();
  } else if (section === 'bookings') {
    loadBookings();
  } else if (section === 'fleet') {
    loadFleet();
  } else if (section === 'tours') {
    loadTours();
  } else if (section === 'contacts') {
    loadContacts();
  }
}

// Dashboard
function loadDashboard() {
  const bookings = getBookings();
  const vehicles = getVehicles();

  // Calculate stats
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter((b) => b.status === 'completed').length;
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
  const availableVehicles = vehicles.filter((v) => v.status === 'available').length;

  // Update stat cards
  document.getElementById('totalBookings').textContent = totalBookings;
  document.getElementById('completedBookings').textContent = completedBookings;
  document.getElementById('pendingBookings').textContent = pendingBookings;
  document.getElementById('availableVehicles').textContent = availableVehicles;

  // Load preview data
  loadBookingsPreview();
  loadFleetPreview();
}

function loadBookingsPreview() {
  const bookings = getBookings();
  const preview = document.getElementById('bookingsPreview');
  preview.innerHTML = '';

  const recentBookings = bookings.slice(0, 5);

  if (recentBookings.length === 0) {
    preview.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No bookings yet</p>';
    return;
  }

  recentBookings.forEach((booking) => {
    const item = document.createElement('div');
    item.className = 'item';
    item.innerHTML = `
      <div>
        <div class="item-primary">${booking.name}</div>
        <div class="item-secondary">${booking.pickup} â†’ ${booking.destination}</div>
      </div>
      <span class="status-badge status-${booking.status}">${booking.status}</span>
    `;
    preview.appendChild(item);
  });
}

function loadFleetPreview() {
  const vehicles = getVehicles();
  const preview = document.getElementById('fleetPreview');
  preview.innerHTML = '';

  if (vehicles.length === 0) {
    preview.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No vehicles</p>';
    return;
  }

  vehicles.slice(0, 5).forEach((vehicle) => {
    const item = document.createElement('div');
    item.className = 'item';
    item.innerHTML = `
      <div>
        <div class="item-primary">${vehicle.model}</div>
        <div class="item-secondary">Capacity: ${vehicle.capacity} | â‚¹${vehicle.price}/km</div>
      </div>
      <span class="status-badge status-${vehicle.status}">${vehicle.status}</span>
    `;
    preview.appendChild(item);
  });
}

// Bookings
function loadBookings() {
  const bookings = getBookings();
  const tbody = document.getElementById('bookingsTable');
  tbody.innerHTML = '';

  if (bookings.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="9" style="text-align: center; padding: 40px; color: #999;">No bookings found</td></tr>';
    return;
  }

  bookings.forEach((booking) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${booking.id}</td>
      <td>${booking.name}</td>
      <td>${booking.phone}</td>
      <td>${booking.pickup}</td>
      <td>${booking.destination}</td>
      <td>${booking.date}</td>
      <td>${booking.vehicle}</td>
      <td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
      <td>
        <div class="action-buttons">
          <button class="action-btn" onclick="openBookingModal(${booking.id})">View</button>
          <button class="action-btn delete" onclick="deleteBooking(${booking.id})">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function filterBookings() {
  const search = document.getElementById('bookingSearch').value.toLowerCase();
  const status = document.getElementById('bookingStatus').value;
  let bookings = getBookings();

  bookings = bookings.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(search) || b.phone.includes(search);
    const matchesStatus = !status || b.status === status;
    return matchesSearch && matchesStatus;
  });

  const tbody = document.getElementById('bookingsTable');
  tbody.innerHTML = '';

  if (bookings.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="9" style="text-align: center; padding: 40px; color: #999;">No bookings found</td></tr>';
    return;
  }

  bookings.forEach((booking) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${booking.id}</td>
      <td>${booking.name}</td>
      <td>${booking.phone}</td>
      <td>${booking.pickup}</td>
      <td>${booking.destination}</td>
      <td>${booking.date}</td>
      <td>${booking.vehicle}</td>
      <td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
      <td>
        <div class="action-buttons">
          <button class="action-btn" onclick="openBookingModal(${booking.id})">View</button>
          <button class="action-btn delete" onclick="deleteBooking(${booking.id})">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function openBookingModal(id) {
  const booking = getBookings().find((b) => b.id === id);
  if (!booking) return;

  const details = document.getElementById('bookingDetails');
  details.innerHTML = `
    <div style="display: grid; gap: 16px;">
      <div>
        <label style="display: block; font-weight: 600; font-size: 12px; color: #666; margin-bottom: 4px; text-transform: uppercase;">Name</label>
        <p style="margin: 0; color: #102d35;">${booking.name}</p>
      </div>
      <div>
        <label style="display: block; font-weight: 600; font-size: 12px; color: #666; margin-bottom: 4px; text-transform: uppercase;">Phone</label>
        <a href="tel:${booking.phone}" style="color: #ec6b38; text-decoration: none; word-break: break-all;">${booking.phone}</a>
      </div>
      <div>
        <label style="display: block; font-weight: 600; font-size: 12px; color: #666; margin-bottom: 4px; text-transform: uppercase;">Pickup Location</label>
        <p style="margin: 0; color: #102d35;">${booking.pickup}</p>
      </div>
      <div>
        <label style="display: block; font-weight: 600; font-size: 12px; color: #666; margin-bottom: 4px; text-transform: uppercase;">Destination</label>
        <p style="margin: 0; color: #102d35;">${booking.destination}</p>
      </div>
      <div>
        <label style="display: block; font-weight: 600; font-size: 12px; color: #666; margin-bottom: 4px; text-transform: uppercase;">Travel Date</label>
        <p style="margin: 0; color: #102d35;">${booking.date}</p>
      </div>
      <div>
        <label style="display: block; font-weight: 600; font-size: 12px; color: #666; margin-bottom: 4px; text-transform: uppercase;">Vehicle</label>
        <p style="margin: 0; color: #102d35;">${booking.vehicle}</p>
      </div>
      <div>
        <label style="display: block; font-weight: 600; font-size: 12px; color: #666; margin-bottom: 4px; text-transform: uppercase;">Status</label>
        <select id="bookingStatusSelect" style="padding: 8px 12px; border: 1px solid #e9ddc7; border-radius: 4px; font-size: 14px;">
          <option value="pending" ${booking.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="confirmed" ${booking.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
          <option value="completed" ${booking.status === 'completed' ? 'selected' : ''}>Completed</option>
          <option value="cancelled" ${booking.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </div>
    </div>
  `;

  document.getElementById('confirmBookingBtn').onclick = () => {
    booking.status = document.getElementById('bookingStatusSelect').value;
    saveBookings();
    closeModal('bookingModal');
    loadBookings();
  };

  openModal('bookingModal');
}

function deleteBooking(id) {
  if (confirm('Are you sure you want to delete this booking?')) {
    let bookings = getBookings();
    bookings = bookings.filter((b) => b.id !== id);
    saveBookings(bookings);
    loadBookings();
  }
}

function cancelBooking() {
  alert('Booking cancellation should be processed manually for customer notification.');
}

// Fleet Management
function loadFleet() {
  const vehicles = getVehicles();
  const container = document.getElementById('fleetManagement');
  container.innerHTML = '';

  if (vehicles.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No vehicles</p>';
    return;
  }

  vehicles.forEach((vehicle) => {
    const card = document.createElement('div');
    card.className = 'vehicle-card';
    card.innerHTML = `
      <div class="vehicle-header">
        <div>
          <div class="vehicle-type">${vehicle.type}</div>
          <div class="vehicle-name">${vehicle.model}</div>
        </div>
        <span class="status-badge status-${vehicle.status}">${vehicle.status}</span>
      </div>
      <div class="vehicle-info">
        <div><strong>Capacity:</strong> <span>${vehicle.capacity} passengers</span></div>
        <div><strong>Price:</strong> <span>â‚¹${vehicle.price}/km</span></div>
      </div>
      <div class="vehicle-actions">
        <button class="action-btn" onclick="openEditVehicleModal(${vehicle.id})">Edit</button>
        <button class="action-btn delete" onclick="deleteVehicle(${vehicle.id})">Delete</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function openAddVehicleModal() {
  document.getElementById('vehicleModalTitle').textContent = 'Add Vehicle';
  document.getElementById('vehicleForm').reset();
  document.getElementById('vehicleForm').dataset.mode = 'add';
  openModal('vehicleModal');
}

function openEditVehicleModal(id) {
  const vehicle = getVehicles().find((v) => v.id === id);
  if (!vehicle) return;

  document.getElementById('vehicleModalTitle').textContent = 'Edit Vehicle';
  document.getElementById('vehicleType').value = vehicle.type;
  document.getElementById('vehicleModel').value = vehicle.model;
  document.getElementById('vehicleCapacity').value = vehicle.capacity;
  document.getElementById('vehiclePrice').value = vehicle.price;
  document.getElementById('vehicleStatus').value = vehicle.status;
  document.getElementById('vehicleForm').dataset.mode = 'edit';
  document.getElementById('vehicleForm').dataset.id = id;
  openModal('vehicleModal');
}

function handleSaveVehicle(e) {
  e.preventDefault();
  const mode = document.getElementById('vehicleForm').dataset.mode;
  const vehicles = getVehicles();

  const vehicleData = {
    type: document.getElementById('vehicleType').value,
    model: document.getElementById('vehicleModel').value,
    capacity: parseInt(document.getElementById('vehicleCapacity').value),
    price: parseFloat(document.getElementById('vehiclePrice').value),
    status: document.getElementById('vehicleStatus').value,
  };

  if (mode === 'add') {
    vehicleData.id = Math.max(...vehicles.map((v) => v.id), 0) + 1;
    vehicles.push(vehicleData);
  } else {
    const id = parseInt(document.getElementById('vehicleForm').dataset.id);
    const index = vehicles.findIndex((v) => v.id === id);
    if (index !== -1) {
      vehicles[index] = { ...vehicles[index], ...vehicleData };
    }
  }

  saveVehicles(vehicles);
  closeModal('vehicleModal');
  loadFleet();
  loadDashboard();
}

function deleteVehicle(id) {
  if (confirm('Are you sure you want to delete this vehicle?')) {
    let vehicles = getVehicles();
    vehicles = vehicles.filter((v) => v.id !== id);
    saveVehicles(vehicles);
    loadFleet();
    loadDashboard();
  }
}

// Tours
function loadTours() {
  const tours = getTours();
  const container = document.getElementById('toursList');
  container.innerHTML = '';

  if (tours.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No tours</p>';
    return;
  }

  tours.forEach((tour) => {
    const card = document.createElement('div');
    card.className = 'tour-card';
    card.innerHTML = `
      <div class="tour-info">
        <h3>${tour.name}</h3>
        <p><strong>Destinations:</strong> ${tour.destinations.join(', ')}</p>
        <p><strong>Duration:</strong> ${tour.duration}</p>
      </div>
      <div class="tour-actions">
        <button class="action-btn delete" onclick="deleteTour(${tour.id})">Delete</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function openAddTourModal() {
  alert('Tour management feature coming soon!');
}

function deleteTour(id) {
  if (confirm('Are you sure you want to delete this tour?')) {
    let tours = getTours();
    tours = tours.filter((t) => t.id !== id);
    saveTours(tours);
    loadTours();
  }
}

// Contacts
function loadContacts() {
  const contacts = getContacts();
  const tbody = document.getElementById('contactsTable');
  tbody.innerHTML = '';

  if (contacts.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #999;">No contacts</td></tr>';
    return;
  }

  contacts.forEach((contact) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${contact.id}</td>
      <td>${contact.name}</td>
      <td>${contact.phone}</td>
      <td>${contact.email}</td>
      <td>${contact.message}</td>
      <td>${contact.date}</td>
      <td>
        <div class="action-buttons">
          <button class="action-btn delete" onclick="deleteContact(${contact.id})">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function filterContacts() {
  const search = document.getElementById('contactSearch').value.toLowerCase();
  let contacts = getContacts();

  contacts = contacts.filter((c) => c.name.toLowerCase().includes(search) || c.phone.includes(search));

  const tbody = document.getElementById('contactsTable');
  tbody.innerHTML = '';

  if (contacts.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #999;">No contacts found</td></tr>';
    return;
  }

  contacts.forEach((contact) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${contact.id}</td>
      <td>${contact.name}</td>
      <td>${contact.phone}</td>
      <td>${contact.email}</td>
      <td>${contact.message}</td>
      <td>${contact.date}</td>
      <td>
        <div class="action-buttons">
          <button class="action-btn delete" onclick="deleteContact(${contact.id})">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function deleteContact(id) {
  if (confirm('Are you sure you want to delete this contact?')) {
    let contacts = getContacts();
    contacts = contacts.filter((c) => c.id !== id);
    saveContacts(contacts);
    loadContacts();
  }
}

// Settings
function handleSaveSettings(e) {
  e.preventDefault();
  alert('Settings saved successfully!');
  e.target.reset();
}

function handleChangeAdminCode(e) {
  e.preventDefault();
  const newCode = document.getElementById('newAdminCode').value;

  if (!newCode || newCode.length < 4) {
    alert('Admin code must be at least 4 characters long');
    return;
  }

  localStorage.setItem(STORAGE_KEYS.ADMIN_CODE, newCode);
  alert('Admin code updated successfully!');
  document.getElementById('adminSettingsForm').reset();
}

function handleClearData() {
  if (
    confirm(
      'Are you sure you want to clear all data? This action cannot be undone. All bookings and contacts will be deleted.'
    )
  ) {
    localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
    localStorage.removeItem(STORAGE_KEYS.CONTACTS);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, '[]');
    localStorage.setItem(STORAGE_KEYS.CONTACTS, '[]');
    alert('Data cleared successfully!');
    loadDashboard();
  }
}

// Modal Handlers
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

// Local Storage Helpers
function getBookings() {
  const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
  return data ? JSON.parse(data) : [];
}

function saveBookings(bookings = null) {
  if (bookings === null) {
    bookings = getBookings();
  }
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
}

function getVehicles() {
  const data = localStorage.getItem(STORAGE_KEYS.VEHICLES);
  return data ? JSON.parse(data) : [];
}

function saveVehicles(vehicles) {
  localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
}

function getContacts() {
  const data = localStorage.getItem(STORAGE_KEYS.CONTACTS);
  return data ? JSON.parse(data) : [];
}

function saveContacts(contacts) {
  localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
}

function getTours() {
  const data = localStorage.getItem(STORAGE_KEYS.TOURS);
  return data ? JSON.parse(data) : [];
}

function saveTours(tours) {
  localStorage.setItem(STORAGE_KEYS.TOURS, JSON.stringify(tours));
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('active');
  }
});
