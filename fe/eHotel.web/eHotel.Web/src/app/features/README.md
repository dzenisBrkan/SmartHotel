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
- `login.html` — Dedicated login page.
- `login.js` — Login form handler.
- `register.html` — Dedicated registration page.
- `register.js` — Registration form handler.
- `admin-dashboard.html` — Dedicated admin dashboard page.
- `admin-dashboard.js` — Admin dashboard loader.
- `recepcionar-dashboard.html` — Dedicated recepcionar dashboard page.
- `recepcionar-dashboard.js` — Recepcionar dashboard loader.
- `guest-dashboard.html` — Dedicated guest dashboard page.
- `guest-dashboard.js` — Guest dashboard loader.
- `guest-home.html` — Public home page for guests showing rooms.
- `guest-home.js` — Loads room list and shows details modal.
- `profile.html` — Reusable user profile page (view/update).
- `profile.js` — Profile loader and updater (reused by roles).
- `rezervacije.html` — Room search & selection page (with modal).
- `rezervacije.js` — Search logic, modal and select handling.
- `rezervacija-create.html` — Reservation creation form (pre-filled from selection).
- `rezervacija-create.js` — Reservation submitter that posts to common reservation endpoints.

## Usage

1. Guests:
   - Open `guest-home.html` to browse rooms and view details.
   - Use `rezervacije.html` to search by date and select a room.
   - Use `rezervacija-create.html` to complete booking.

2. Auth / Profiles:
   - Open `profile.html` to view or update your user profile. This component is reusable by admin/recepcionar/guest pages.

3. Admin / Recepcionar:
   - Use `admin-dashboard.html` and `recepcionar-dashboard.html` for role-specific overviews. Each includes a link to `profile.html`.

## Configuration

If the backend runs on a different host or path, update the `apiBaseUrl` value in the scripts:
- `app.js`, `login.js`, `register.js`, `admin-dashboard.js`, `recepcionar-dashboard.js`, `guest-dashboard.js`, `guest-home.js`, `profile.js`, `rezervacije.js`, `rezervacija-create.js`.

This frontend is intentionally minimal and attempts multiple common endpoints where backend routes vary. Adjust endpoints in the scripts to match your backend API.