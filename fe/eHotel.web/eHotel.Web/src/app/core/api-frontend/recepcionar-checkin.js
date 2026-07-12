const apiBaseUrl = '';

function fetchJson(endpoint, options = {}) {
  const url = apiBaseUrl + endpoint;
  return fetch(url, options).then(async (res) => {
    const txt = await res.text();
    try { return JSON.parse(txt); } catch { return txt; }
  });
}

function renderCheckin(reservation) {
  const card = document.createElement('div');
  card.className = 'item-card';
  const guest = reservation.name || reservation.guestName || reservation.gost || '-';
  const room = reservation.roomName || reservation.soba || reservation.room || '-';
  card.innerHTML = `
    <div><strong>Reservation:</strong> ${reservation.id || reservation.rezervacijaId || '-'}</div>
    <div><strong>Guest:</strong> ${guest}</div>
    <div><strong>Room:</strong> ${room}</div>
    <div><strong>Check-in:</strong> ${reservation.checkin || reservation.startDate || '-'}</div>
    <div><strong>Check-out:</strong> ${reservation.checkout || reservation.endDate || '-'}</div>
    <div class="actions">
      <button class="button checkin">Check in</button>
    </div>
  `;
  return card;
}

function renderCheckins(list) {
  const container = document.getElementById('checkin-list');
  container.innerHTML = '';
  if (!Array.isArray(list) || list.length === 0) {
    container.innerHTML = '<div class="item-card">No arrivals found.</div>';
    return;
  }
  list.forEach((reservation) => container.appendChild(renderCheckin(reservation)));
}

async function loadCheckins() {
  const endpoints = ['/api/rezervacije', '/api/reservations', '/api/bookings'];
  for (const ep of endpoints) {
    try {
      const data = await fetchJson(ep);
      const list = Array.isArray(data) ? data : data?.data ?? data;
      if (Array.isArray(list)) {
        renderCheckins(list);
        return;
      }
    } catch {}
  }
  document.getElementById('checkin-list').innerHTML = '<div class="item-card">Unable to load arrivals.</div>';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('reload-checkins').addEventListener('click', loadCheckins);
  loadCheckins();
});