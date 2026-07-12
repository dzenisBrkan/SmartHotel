# API Frontend for eHotel Application

This folder now contains a lightweight API frontend for the eHotel backend. It provides pages for the following backend endpoint groups:

- `/api/sobe` — Rooms
- `/api/usluge` — Services
- `/api/rezervacije` — Reservations
- `/api/korisnici` — Users
- `/api/auth/login` — Login
- `/api/auth/register` — Register
- `/api/dashboard/admin` — Admin dashboard overview
- `/api/dashboard/recepcionar` — Recepcionar dashboard overview
- `/api/dashboard/guest` — Guest dashboard overview

## Files

- `index.html` — Main frontend page with navigation.
- `app.js` — Fetch logic for backend API endpoints and page routing.
- `styles.css` — UI styling.
- `landing.html` — Landing page with login/sign up menu and room listing.
- `landing.js` — Landing page room loader and modal.
- `login.html` — Dedicated login page.
- `login.js` — Login form handler.
- `register.html` — Dedicated registration page.
- `register.js` — Registration form handler.
- `admin-dashboard.html` — Dedicated admin dashboard page.
- `admin-dashboard.js` — Admin dashboard loader.
- `admin-reservations.html` — Admin reservation management page.
- `admin-reservations.js` — Admin reservation loader.
- `admin-rooms.html` — Admin room management page.
- `admin-rooms.js` — Admin room loader.
- `admin-users.html` — Admin user management page.
- `admin-users.js` — Admin user loader.
- `recepcionar-dashboard.html` — Dedicated recepcionar dashboard page.
- `recepcionar-dashboard.js` — Recepcionar dashboard loader.
- `recepcionar-checkin.html` — Recepcionar check-in page.
- `recepcionar-checkin.js` — Recepcionar check-in loader.
- `guest-dashboard.html` — Dedicated guest dashboard page.
- `guest-dashboard.js` — Guest dashboard loader.
- `guest-home.html` — Public home page for guests showing rooms.
- `guest-home.js` — Loads room list and shows details modal.
- `bookings.html` — Guest booking history page.
- `bookings.js` — Guest bookings loader.
- `room-details.html` — Dedicated room details page.
- `room-details.js` — Room details loader.
- `profile.html` — Reusable user profile page (view/update).
- `profile.js` — Profile loader and updater.
- `rezervacije.html` — Room search & selection page (with modal).
- `rezervacije.js` — Search logic, modal and select handling.
- `rezervacija-create.html` — Reservation creation form (pre-filled from selection).
- `rezervacija-create.js` — Reservation submitter that posts to common reservation endpoints.

## Usage

1. Landing:
   - Open `landing.html` to see the landing page with login and sign-up buttons and room cards.
   - Click room details to open the detail modal.
   - Click Reserve to go directly to the reservation form.

2. Guests:
   - Open `guest-home.html` to browse rooms and view details.
   - Use `rezervacije.html` to search by date and select a room.
   - Use `rezervacija-create.html` to complete booking.
   - Use `bookings.html` to review existing reservations.

3. Auth / Profiles:
   - Open `profile.html` to view or update your user profile.

4. Admin:
   - Use `admin-dashboard.html` for admin overview.
   - Use `admin-reservations.html` to manage reservations.
   - Use `admin-rooms.html` to view rooms.
   - Use `admin-users.html` to view users.

5. Recepcionar:
   - Use `recepcionar-dashboard.html` for recepcionar overview.
   - Use `recepcionar-checkin.html` for arrival/check-in management.

## Configuration

If the backend runs on a different host or path, update the `apiBaseUrl` value in the scripts:
- `landing.js`, `app.js`, `login.js`, `register.js`, `admin-dashboard.js`, `admin-reservations.js`, `admin-rooms.js`, `admin-users.js`, `recepcionar-dashboard.js`, `recepcionar-checkin.js`, `guest-dashboard.js`, `guest-home.js`, `bookings.js`, `profile.js`, `rezervacije.js`, `rezervacija-create.js`.

This frontend is intentionally minimal and attempts multiple common endpoints where backend routes vary. Adjust endpoints in the scripts to match your backend API.