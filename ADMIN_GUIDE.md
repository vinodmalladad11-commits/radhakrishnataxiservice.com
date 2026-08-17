# Admin Panel - Radhakrishna Taxi Service

A comprehensive admin panel for managing your taxi service business, including bookings, fleet, tours, and customer contacts.

## Accessing the Admin Panel

1. Navigate to `admin.html` in your browser
2. Enter the admin code: `admin2024`
3. Click "Sign In"

## Features

### ðŸ“Š Dashboard
- Overview of key metrics:
  - Total bookings for the month
  - Completed trips
  - Pending bookings
  - Available vehicles
- Recent bookings preview
- Fleet status preview

### ðŸ“… Bookings Management
- View all customer bookings
- Search bookings by name or phone
- Filter by status (Pending, Confirmed, Completed, Cancelled)
- Update booking status
- Delete bookings
- Quick access to customer phone numbers

### ðŸš— Fleet Management
- Add new vehicles to your fleet
- Edit existing vehicle details:
  - Vehicle type and model
  - Passenger capacity
  - Pricing per kilometer
  - Current status (Available, Booked, Maintenance)
- Delete vehicles
- Real-time status updates
- Fleet preview on dashboard

### ðŸ—ºï¸ Tours Management
- View all available tours
- Delete tour packages
- Add tours (coming soon)

### ðŸ‘¥ Contacts Management
- View all customer inquiries
- Search contacts by name or phone
- Delete contact messages
- Easy phone number access

### âš™ï¸ Settings
- **Contact Information:**
  - Update phone number
  - Update WhatsApp number
  - Update email address
  - Update service area description

- **Admin Settings:**
  - Change admin code
  - Security management

- **Danger Zone:**
  - Clear all data option
  - (Use with caution!)

## Data Storage

All data is stored locally in your browser using localStorage:
- **Bookings** - Customer booking requests
- **Vehicles** - Fleet information
- **Tours** - Tour package details
- **Contacts** - Customer inquiries
- **Admin Code** - Login credentials

### Default Sample Data
The admin panel comes with sample data for demonstration:
- 3 sample bookings
- 5 sample vehicles
- 3 sample tours
- 2 sample contacts

## Changing Your Admin Code

1. Go to **Settings** section
2. Click on **Admin Settings**
3. Enter your new admin code (minimum 4 characters)
4. Click "Update Code"
5. Your new code will be required for your next login

âš ï¸ **Remember:** If you forget your admin code, you may need to clear browser data to reset it.

## Security Notes

- This admin panel uses browser-based local storage
- Data is stored on your device only
- Clear browser cache/data will erase all information
- For production use, integrate with a proper backend database
- Always use a strong admin code

## Tips

1. **Regular Backups:** Export your data regularly (consider implementing a backup feature)
2. **Status Management:** Update booking statuses to keep accurate records
3. **Fleet Updates:** Keep vehicle information current with pricing changes
4. **Mobile Friendly:** Admin panel is responsive and works on tablets and phones

## Keyboard Shortcuts

- Click on any nav item to switch sections
- Click on vehicle names to view details
- Click status badges to see details in booking modal
- Click "Delete" buttons to remove items

## Troubleshooting

**Q: I lost my admin code**
A: You may need to check browser DevTools or clear browser data to reset it.

**Q: Where is my data stored?**
A: All data is stored in your browser's local storage. It persists as long as you don't clear browser data.

**Q: Can I access this from multiple devices?**
A: Not with the current setup. For multi-device access, you'll need to integrate with a cloud database.

**Q: Can I export my data?**
A: You can copy data from browser DevTools â†’ Application â†’ Local Storage and export as JSON.

## Future Enhancements

Potential features to add:
- Cloud database integration
- Email notifications for bookings
- Payment integration
- Driver management
- Route optimization
- Customer reviews
- Advanced analytics
- Multi-user admin accounts
- API integration with website booking form
- Automated WhatsApp confirmations

---

**Version:** 1.0  
**Last Updated:** December 2024

For support or feature requests, contact the development team.
