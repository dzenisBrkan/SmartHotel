const apiBaseUrl = '';

function fetchJson(endpoint, options = {}) {
  const url = apiBaseUrl ? apiBaseUrl.replace(/\/$/, '') + endpoint : endpoint;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 3000);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => window.clearTimeout(timeout))
    .then(async (res) => {
      const txt = await res.text();
      if (!res.ok) {
        throw new Error(txt || res.statusText);
      }
      try {
        return JSON.parse(txt);
      } catch { return txt; }
    });
}

function getRoomEndpoints() {
  const paths = ['/api/sobe', '/api/sobe/available', '/api/rooms', '/api/rooms/available'];
  const endpoints = [];

  if (apiBaseUrl) {
    const base = apiBaseUrl.replace(/\/$/, '');
    paths.forEach((path) => endpoints.push(`${base}${path}`));
  } else {
    paths.forEach((path) => endpoints.push(path));
    ['4000', '5000', '3000', '4200'].forEach((port) => {
      paths.forEach((path) => endpoints.push(`http://localhost:${port}${path}`));
    });
  }

  return endpoints;
}

 function renderRooms(rooms) {
   const grid = document.getElementById('rooms-grid');
   grid.innerHTML = '';
   if (!rooms || rooms.length === 0) {
     document.getElementById('landing-message').textContent = 'No rooms available right now.';
     return;
   }
 
   rooms.forEach((room) => {
     const card = document.createElement('article');
     card.className = 'room-card';
     card.addEventListener('click', (event) => {
       const target = event.target;
       if (target instanceof HTMLElement && target.closest('button')) {
         return;
       }
       openRoomPage(room);
     });
 
     const body = document.createElement('div');
     body.className = 'room-card-body';
     const title = document.createElement('h3');
     title.textContent = room.naziv || room.name || 'Room';
     const subtitle = document.createElement('p');
     subtitle.className = 'room-type';
     subtitle.textContent = room.tip || room.type || 'Guest room';
     const desc = document.createElement('p');
     desc.className = 'room-description';
     desc.textContent = room.opis || room.description || 'No description available.';
     const meta = document.createElement('div');
     meta.className = 'room-meta';
     meta.textContent = `Capacity: ${room.kapacitet ?? room.capacity ?? '-'} • Price: ${room.cijena ?? room.price ?? '-'}`;
 
     const actions = document.createElement('div');
     actions.className = 'room-actions';
     const details = document.createElement('button');
     details.className = 'button secondary';
     details.textContent = 'More';
     details.addEventListener('click', (event) => {
       event.stopPropagation();
       openModal(room);
     });
 
     const reserve = document.createElement('button');
     reserve.className = 'button primary';
     reserve.textContent = 'Reserve';
     reserve.addEventListener('click', (event) => {
       event.stopPropagation();
       const query = new URLSearchParams({
         roomId: room.id ?? room.sobaId ?? room._id ?? ''
       }).toString();
       location.href = `./rezervacija-create.html?${query}`;
     });
 
     actions.appendChild(details);
     actions.appendChild(reserve);
 
     body.appendChild(title);
     body.appendChild(subtitle);
     body.appendChild(desc);
     body.appendChild(meta);
     body.appendChild(actions);
     card.appendChild(body);
     grid.appendChild(card);
   });
 }
 
 function openRoomPage(room) {
   const roomId = room.id ?? room.sobaId ?? room._id ?? '';
   if (!roomId) {
     return;
   }
   location.href = `./room-details.html?${new URLSearchParams({ roomId }).toString()}`;
 }

function openModal(room) {
  const modal = document.getElementById('room-modal');
  document.getElementById('modal-title').textContent = room.naziv || room.name || 'Room details';
  document.getElementById('modal-content').innerHTML = `
    <p><strong>Description:</strong> ${room.opis || room.description || '—'}</p>
    <p><strong>Capacity:</strong> ${room.kapacitet ?? room.capacity ?? '—'}</p>
    <p><strong>Price:</strong> ${room.cijena ?? room.price ?? '—'}</p>
  `;
  modal.dataset.room = JSON.stringify(room);
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  const modal = document.getElementById('room-modal');
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
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
  const endpoints = getRoomEndpoints();
  document.getElementById('landing-message').textContent = 'Loading rooms…';
  for (const endpoint of endpoints) {
    try {
      document.getElementById('landing-message').textContent = `Trying room endpoint: ${endpoint}`;
      const result = await fetchJson(endpoint);
      if (Array.isArray(result)) {
        renderRooms(result);
        document.getElementById('landing-message').textContent = `Loaded ${result.length} rooms from ${endpoint}.`;
        return;
      }
      document.getElementById('landing-message').textContent = `Endpoint ${endpoint} returned unexpected data; trying next endpoint.`;
    } catch (err) {
      console.warn('Room fetch failed:', endpoint, err);
      document.getElementById('landing-message').textContent = `Endpoint failed: ${endpoint}`;
    }
  }
  document.getElementById('landing-message').textContent = 'Unable to load rooms. Please ensure the backend exposes /api/sobe or /api/rooms.';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-reserve').addEventListener('click', reserveFromModal);
  loadRooms();
});