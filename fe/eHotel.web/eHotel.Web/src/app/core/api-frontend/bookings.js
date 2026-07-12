const apiBaseUrl = '';

function fetchJson(endpoint, options = {}) {
  const url = apiBaseUrl + endpoint;
  return fetch(url, options).then(async (res) => {
    const txt = await res.text();
    try { return JSON.parse(txt); } catch { return txt; }
  });
}

function renderBooking(cardEl, booking) {
  const details = `
    <h3>${booking.id || booking.rezervacijaId || 'Booking'}</h3>
    <div><strong>Room:</strong> ${booking.roomName || booking.naziv || booking.soba || booking.room || '-'}</div>
    <div><strong>Guest:</strong> ${booking.name || booking.guestName || booking.gost || '-'}</div>
    <div><strong>Check-in:</strong> ${booking.checkin || booking.startDate || '-'}</div>
    <div><strong>Check-out:</strong> ${booking.checkout || booking.endDate || '-'}</div>
    <div><strong>Status:</strong> ${booking.status || booking.stanje || '-'}</div>
  `;
  cardEl.innerHTML = details;
}

function renderBookings(bookings) {
  const list = document.querySelector('.booking-list');
  list.innerHTML = '';
  if (!bookings || bookings.length === 0) {
    list.innerHTML = '<div class="booking-card no-bookings">No bookings found.</div>';
    return;
  }
  bookings.forEach((booking) => {
    const card = document.createElement('div');
    card.className = 'booking-card';
    renderBooking(card, booking);
    list.appendChild(card);
  });
}

async function loadBookings() {
  const messageEl = document.getElementById('bookings-message');
  messageEl.textContent = 'Loading bookings...';
  const endpoints = ['/api/rezervacije', '/api/reservations', '/api/bookings'];
  for (const endpoint of endpoints) {
    try {
      const data = await fetchJson(endpoint);
      const list = Array.isArray(data) ? data : data?.data ?? data;
      if (Array.isArray(list)) {
        renderBookings(list);
        return;
      }
    } catch (err) {
      // ignore
    }
  }
  messageEl.textContent = 'Unable to load bookings. Confirm backend endpoint exists.';
}

document.addEventListener('DOMContentLoaded', loadBookings);