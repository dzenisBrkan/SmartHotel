const apiBaseUrl = '';

function fetchJson(endpoint, options = {}) {
  const url = apiBaseUrl + endpoint;
  return fetch(url, options).then(async (res) => {
    const txt = await res.text();
    try { return JSON.parse(txt); } catch { return txt; }
  });
}

function setError(message) {
  document.getElementById('room-loading').style.display = 'none';
  const errorEl = document.getElementById('room-error');
  errorEl.style.display = 'block';
  errorEl.textContent = message;
}

function renderRoom(roomId, room) {
  document.getElementById('room-loading').style.display = 'none';
  const info = document.getElementById('room-info');
  document.getElementById('room-title').textContent = room.naziv || room.name || `Room ${roomId}`;
  document.getElementById('room-description').textContent = room.opis || room.description || 'No description available.';
  document.getElementById('room-capacity').textContent = room.kapacitet ?? room.capacity ?? '-';
  document.getElementById('room-price').textContent = room.cijena ?? room.price ?? '-';
  document.getElementById('room-extras').textContent = room.extras || room.dodatno || 'None';
  info.style.display = 'block';

  document.getElementById('reserve-button').addEventListener('click', () => {
    const query = new URLSearchParams({
      roomId,
      checkin: room.checkin || '',
      checkout: room.checkout || '',
      guests: room.kapacitet || room.capacity || 1
    }).toString();
    location.href = `./rezervacija-create.html?${query}`;
  });
}

function getRoomId() {
  return new URLSearchParams(window.location.search).get('roomId');
}

async function loadRoom() {
  const roomId = getRoomId();
  if (!roomId) {
    setError('Room ID is missing from the URL.');
    return;
  }
  const endpoints = [
    `/api/sobe/${roomId}`,
    `/api/rooms/${roomId}`,
    `/api/sobe?id=${roomId}`,
    `/api/rooms?id=${roomId}`
  ];
  for (const endpoint of endpoints) {
    try {
      const data = await fetchJson(endpoint);
      const room = Array.isArray(data) ? data[0] : data;
      if (room && (room.id || room.sobaId || room._id || room.name || room.naziv)) {
        renderRoom(roomId, room);
        return;
      }
    } catch (err) {
      // ignore and continue
    }
  }
  setError('Unable to load room details. Confirm backend endpoint exists.');
}

document.addEventListener('DOMContentLoaded', loadRoom);