const apiBaseUrl = '';

function fetchJson(endpoint, options = {}) {
  const url = apiBaseUrl + endpoint;
  return fetch(url, options).then(async (res) => {
    const txt = await res.text();
    try { return JSON.parse(txt); } catch { return txt; }
  });
}

function renderRoom(room) {
  const card = document.createElement('div');
  card.className = 'item-card';
  card.innerHTML = `
    <div><strong>ID:</strong> ${room.id || room.sobaId || room._id || '-'}</div>
    <div><strong>Name:</strong> ${room.naziv || room.name || '-'}</div>
    <div><strong>Capacity:</strong> ${room.kapacitet ?? room.capacity ?? '-'}</div>
    <div><strong>Price:</strong> ${room.cijena ?? room.price ?? '-'}</div>
    <div><strong>Description:</strong> ${room.opis || room.description || '-'}</div>
  `;
  return card;
}

function renderRooms(list) {
  const container = document.getElementById('rooms-list');
  container.innerHTML = '';
  if (!Array.isArray(list) || list.length === 0) {
    container.innerHTML = '<div class="item-card">No rooms found.</div>';
    return;
  }
  list.forEach((room) => container.appendChild(renderRoom(room)));
}

async function loadRooms() {
  const endpoints = ['/api/sobe', '/api/rooms', '/api/sobe/available', '/api/rooms/available'];
  for (const ep of endpoints) {
    try {
      const data = await fetchJson(ep);
      const list = Array.isArray(data) ? data : data?.data ?? data;
      if (Array.isArray(list)) {
        renderRooms(list);
        return;
      }
    } catch {}
  }
  document.getElementById('rooms-list').innerHTML = '<div class="item-card">Unable to load rooms.</div>';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('reload-rooms').addEventListener('click', loadRooms);
  loadRooms();
});