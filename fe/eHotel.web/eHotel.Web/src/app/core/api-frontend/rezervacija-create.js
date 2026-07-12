const apiBaseUrl = '';

function fetchJson(endpoint, options = {}) {
  const url = apiBaseUrl + endpoint;
  return fetch(url, options).then(async (res) => {
    const txt = await res.text();
    try { return { ok: res.ok, data: JSON.parse(txt), status: res.status }; } catch { return { ok: res.ok, data: txt, status: res.status }; }
  });
}

function getQuery() {
  return Object.fromEntries(new URLSearchParams(location.search));
}

function setSelectedRoomInfo(roomId) {
  // try to fetch room details if available
  const el = document.getElementById('selected-room');
  el.textContent = roomId || '—';
  // attempt to fetch room details from common endpoints
  const candidates = [
    `/api/sobe/${roomId}`,
    `/api/rooms/${roomId}`,
    `/api/sobe?id=${roomId}`,
    `/api/rooms?id=${roomId}`
  ];
  (async () => {
    for (const ep of candidates) {
      try {
        const r = await fetchJson(ep);
        if (r && r.data) {
          const d = Array.isArray(r.data) ? r.data[0] : r.data;
          if (d) {
            el.textContent = (d.naziv || d.name || 'Room') + ` (${roomId})`;
            return;
          }
        }
      } catch (e) {}
    }
  })();
}

function tryCreateReservation(payload) {
  const endpoints = [
    '/api/rezervacije',
    '/api/reservations',
    '/api/booking',
    '/api/reservation'
  ];
  const output = document.getElementById('reservation-output');
  output.textContent = 'Submitting...';
  (async () => {
    for (const ep of endpoints) {
      try {
        const r = await fetchJson(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (r && (r.ok || r.status === 201 || r.status === 200)) {
          output.textContent = 'Success:\n' + JSON.stringify(r.data, null, 2);
          return;
        } else {
          // show backend response
          output.textContent = `Attempted ${ep}: ${JSON.stringify(r.data, null, 2)}`;
        }
      } catch (err) {
        output.textContent = `Error posting to ${ep}: ${err.message || err}`;
      }
    }
    output.textContent += '\nAll endpoints tried and failed.';
  })();
}

document.addEventListener('DOMContentLoaded', () => {
  const q = getQuery();
  if (q.roomId) setSelectedRoomInfo(q.roomId);
  if (q.checkin) document.getElementById('checkin').value = q.checkin;
  if (q.checkout) document.getElementById('checkout').value = q.checkout;
  if (q.guests) document.getElementById('guests').value = q.guests;

  document.getElementById('reservation-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = {
      roomId: q.roomId || document.getElementById('selected-room').textContent,
      checkin: document.getElementById('checkin').value,
      checkout: document.getElementById('checkout').value,
      guests: Number(document.getElementById('guests').value),
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      notes: document.getElementById('notes').value
    };
    tryCreateReservation(payload);
  });

  document.getElementById('cancel-btn').addEventListener('click', () => {
    location.href = './rezervacije.html';
  });
});