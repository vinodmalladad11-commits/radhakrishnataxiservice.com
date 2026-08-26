# Admin Panel Setup Guide

## What's Been Created

Your admin panel is now ready to use! Here are the new files:

### Files Added
1. **admin.html** - Admin panel interface
2. **admin.css** - Professional styling  
3. **admin.js** - All functionality and data management
4. **ADMIN_GUIDE.md** - Complete documentation

## Quick Start

### Step 1: Open Admin Panel
Open your browser and navigate to:
```
file:///C:/Users/sanja/OneDrive/Documents/radhakrishnataxiservice.com/admin.html
```

Or if hosting online:
```
https://radhakrishnataxiservice.com/admin.html
```

### Step 2: Login
- **Default Admin Code:** `admin2024`
- Change this in Settings after first login for security

### Step 3: Start Managing
The admin panel includes:

âœ… **Dashboard** - Key metrics at a glance
âœ… **Bookings** - Manage all customer bookings  
âœ… **Fleet** - Add/edit/delete vehicles
âœ… **Tours** - Manage tour packages
âœ… **Contacts** - View customer inquiries
âœ… **Settings** - Configure admin settings

## Features Overview

### Dashboard
- Total bookings, completed trips, pending bookings
- Available vehicles count
- Recent activity previews

### Booking Management
- Search by name or phone
- Filter by status (Pending, Confirmed, Completed, Cancelled)
- Update booking status in real-time
- View full booking details

### Fleet Management
- Add new vehicles with type, model, capacity, pricing
- Edit existing vehicle information
- Set vehicle status (Available, Booked, Maintenance)
- Delete vehicles

### Contacts Management
- View all customer inquiries
- Search contacts
- Quick access to contact information

### Settings
- Change contact details
- Update admin code
- Clear data (with confirmation)

## Sample Data

The panel comes pre-loaded with sample data:
- 3 demo bookings
- 5 demo vehicles
- 3 demo tours
- 2 demo contacts

This helps you explore all features immediately.

## Data Storage

All data is stored in your browser's **localStorage**:
- Persists between sessions
- Cleared only when you clear browser data
- **No server backend required** for basic setup

## Security

- **Protected login** - Only accessible with admin code
- **Local storage** - Data stays on your device
- **Easy to change** - Update admin code anytime in Settings

## Next Steps

1. **Explore the Dashboard** - Get familiar with the interface
2. **Change Admin Code** - Set a secure code in Settings
3. **Add Your Vehicles** - Replace sample vehicles with your fleet
4. **Manage Real Bookings** - Start using it to track customer bookings
5. **Update Settings** - Add your actual contact information

## Integration Tips

To integrate with your main website booking form:

1. Modify `script.js` to save bookings to localStorage when the form is submitted:

```javascript
// Add this to script.js in the booking form submit handler:
const bookingData = {
  id: Date.now(),
  name: details.get('name'),
  phone: details.get('phone'),
  pickup: details.get('pickup'),
  destination: details.get('destination'),
  date: details.get('date'),
  vehicle: details.get('vehicle'),
  status: 'pending',
  notes: ''
};

// Save to localStorage
let bookings = JSON.parse(localStorage.getItem('taxi_bookings') || '[]');
bookings.push(bookingData);
localStorage.setItem('taxi_bookings', JSON.stringify(bookings));
```

2. Then open `admin.html` to see the new booking automatically appear!

## Support

For detailed documentation, see: **ADMIN_GUIDE.md**

Questions? Check the troubleshooting section in the guide.

---

 
