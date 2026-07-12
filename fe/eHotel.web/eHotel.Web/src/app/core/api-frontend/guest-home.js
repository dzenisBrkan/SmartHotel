const apiBaseUrl = '';

function fetchJson(endpoint, options = {}) {
  const url = apiBaseUrl + endpoint;
  return fetch(url, options).then(async (res) => {
    const txt = await res.text();
    try { return JSON.parse(txt); } catch { return txt; }
  });
}

function renderGrid(rooms) {
  const grid = document.getElementById('rooms-grid');
  grid.innerHTML = '';
  if (!rooms || rooms.length === 0) {
    document.getElementById('home-message').textContent = 'No rooms available.';
    return;
  }
  rooms.forEach(r => {
    const card = document.createElement('div');
    card.className = 'room-card';
    const title = document.createElement('h3');
    title.textContent = r.naziv || r.name || 'Room';
    const desc = document.createElement('div');
    desc.textContent = r.opis || r.description || '';
    const meta = document.createElement('div');
    meta.textContent = `Capacity: ${r.kapacitet ?? r.capacity ?? '-'} • Price: ${r.cijena ?? r.price ?? '-'}`;
    const actions = document.createElement('div');
    actions.className = 'card-actions';
    const details = document.createElement('button');
    details.textContent = 'Details';
    details.addEventListener('click', () => openModal(r));
    const reserve = document.createElement('button');
    reserve.textContent = 'Reserve';
    reserve.className = 'select-btn';
    reserve.addEventListener('click', () => {
      const q = new URLSearchParams({ roomId: r.id ?? r.sobaId ?? r._id ?? '' }).toString();
      location.href = `./rezervacija-create.html?${q}`;
    });
    actions.appendChild(details);
    actions.appendChild(reserve);

    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(meta);
    card.appendChild(actions);
    grid.appendChild(card);
  });
}

function openModal(room) {
  const modal = document.getElementById('room-modal');
  document.getElementById('modal-title').textContent = room.naziv || room.name || 'Room details';
  document.getElementById('modal-content').innerHTML = `
    <div><strong>Description:</strong> ${room.opis || room.description || '—'}</div>
    <div><strong>Capacity:</strong> ${room.kapacitet ?? room.capacity ?? '—'}</div>
    <div><strong>Price:</strong> ${room.cijena ?? room.price ?? '—'}</div>
  `;
  modal.dataset.room = JSON.stringify(room);
  modal.classList.add('active');
  modal.setAttribute('aria-hidden','false');
}

function closeModal() {
  const modal = document.getElementById('room-modal');
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden','true');
  delete modal.dataset.room;
}

function reserveFromModal() {
  const modal = document.getElementById('room-modal');
  const room = modal.dataset.room ? JSON.parse(modal.dataset.room) : null;
  if (!room) return;
  const roomId = room.id ?? room.sobaId ?? room._id ?? '';
  location.href = `./rezervacija-create.html?${new URLSearchParams({ roomId }).toString()}`;
}

async function loadRooms() {
  const endpoints = ['/api/sobe', '/api/sobe/available', '/api/rooms', '/api/rooms/available'];
  document.getElementById('home-message').textContent = 'Loading...';
  for (const ep of endpoints) {
    try {
      const data = await fetchJson(ep);
      if (Array.isArray(data)) {
        renderGrid(data);
        document.getElementById('home-message').textContent = `Loaded ${data.length} rooms (from ${ep}).`;
        return;
      }
    } catch(e) {
      // continue
    }
  }
  document.getElementById('home-message').textContent = 'No rooms found. Ensure backend exposes /api/sobe or /api/rooms.';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-reserve').addEventListener('click', reserveFromModal);
  loadRooms();
});