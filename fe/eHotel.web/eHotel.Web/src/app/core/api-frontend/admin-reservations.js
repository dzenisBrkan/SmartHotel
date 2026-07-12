const apiBaseUrl = '';

function fetchJson(endpoint, options = {}) {
  const url = apiBaseUrl + endpoint;
  return fetch(url, options).then(async (res) => {
    const txt = await res.text();
    try { return JSON.parse(txt); } catch { return txt; }
  });
}

function renderReservation(res) {
  const card = document.createElement('div');
  card.className = 'item-card';
  card.innerHTML = `
    <div><strong>ID:</strong> ${res.id || res.rezervacijaId || '-'}</div>
    <div><strong>Room:</strong> ${res.roomName || res.soba || res.room || '-'}</div>
    <div><strong>Guest:</strong> ${res.name || res.guestName || res.korisnik || '-'}</div>
    <div><strong>From:</strong> ${res.checkin || res.startDate || '-'}</div>
    <div><strong>To:</strong> ${res.checkout || res.endDate || '-'}</div>
    <div><strong>Status:</strong> ${res.status || res.stanje || '-'}</div>
  `;
  return card;
}

function renderReservations(list) {
  const container = document.getElementById('reservations-list');
  container.innerHTML = '';
  if (!Array.isArray(list) || list.length === 0) {
    container.innerHTML = '<div class="item-card">No reservations found.</div>';
    return;
  }
  list.forEach((reservation) => container.appendChild(renderReservation(reservation)));
}

async function loadReservations() {
  const endpoints = ['/api/rezervacije', '/api/reservations', '/api/bookings'];
  for (const ep of endpoints) {
    try {
      const data = await fetchJson(ep);
      const list = Array.isArray(data) ? data : data?.data ?? data;
      if (Array.isArray(list)) {
        renderReservations(list);
        return;
      }
    } catch {}
  }
  document.getElementById('reservations-list').innerHTML = '<div class="item-card">Unable to load reservations.</div>';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('reload-reservations').addEventListener('click', loadReservations);
  loadReservations();
});