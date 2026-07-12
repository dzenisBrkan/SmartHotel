const apiBaseUrl = '';

function fetchJson(endpoint, options = {}) {
  const url = apiBaseUrl + endpoint;
  return fetch(url, options).then(async (response) => {
    const text = await response.text();
    try { return JSON.parse(text); } catch { return text; }
  });
}

function renderRooms(listEl, rooms) {
  listEl.innerHTML = '';
  if (!rooms || rooms.length === 0) {
    listEl.textContent = 'No rooms found for the selected dates.';
    return;
  }

  rooms.forEach((r) => {
    const card = document.createElement('div');
    card.className = 'room-card';

    const info = document.createElement('div');
    info.className = 'room-info';
    info.innerHTML = `<strong>${r.naziv || r.name || 'Room'}</strong>
                      <div>${r.opis || r.description || ''}</div>
                      <div>Capacity: ${r.kapacitet ?? r.capacity ?? '—'}</div>
                      <div>Price: ${r.cijena ?? r.price ?? '—'}</div>`;

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '0.5rem';

    const detailsBtn = document.createElement('button');
    detailsBtn.textContent = 'Details';
    detailsBtn.addEventListener('click', () => openModal(r));

    const selectBtn = document.createElement('button');
    selectBtn.textContent = 'Select';
    selectBtn.className = 'select-btn';
    selectBtn.addEventListener('click', () => {
      // navigate to reservation create page with query params
      const q = new URLSearchParams({
        roomId: r.id ?? r.sobaId ?? r._id ?? '',
        checkin: document.getElementById('checkin').value,
        checkout: document.getElementById('checkout').value,
        guests: document.getElementById('guests').value
      }).toString();
      location.href = `./rezervacija-create.html?${q}`;
    });

    actions.appendChild(detailsBtn);
    actions.appendChild(selectBtn);

    card.appendChild(info);
    card.appendChild(actions);
    listEl.appendChild(card);
  });
}

function showMessage(msg) {
  const el = document.getElementById('search-message');
  el.textContent = msg;
}

function searchRooms() {
  const checkin = document.getElementById('checkin').value;
  const checkout = document.getElementById('checkout').value;
  const guests = document.getElementById('guests').value || '1';
  if (!checkin || !checkout) {
    showMessage('Please provide check-in and check-out dates.');
    return;
  }
  showMessage('Searching...');
  const qs = new URLSearchParams({ checkin, checkout, guests }).toString();
  // try common endpoints
  const endpoints = [
    `/api/sobe?${qs}`,
    `/api/sobe/available?${qs}`,
    `/api/rooms?${qs}`,
    `/api/rooms/available?${qs}`
  ];

  const listEl = document.getElementById('rooms-list');
  // try endpoints in sequence until one returns an array
  (async function tryEndpoints() {
    for (const ep of endpoints) {
      try {
        const data = await fetchJson(ep);
        if (Array.isArray(data)) {
          showMessage(`Found ${data.length} rooms (from ${ep}).`);
          renderRooms(listEl, data);
          return;
        }
      } catch (err) {
        // ignore and continue
      }
    }
    showMessage('No room data found from backend endpoints. Ensure backend exposes /api/sobe or /api/rooms endpoints.');
    listEl.textContent = '';
  })();
}

function openModal(room) {
  const modal = document.getElementById('room-modal');
  const title = document.getElementById('modal-title');
  const content = document.getElementById('modal-content');
  title.textContent = room.naziv || room.name || 'Room details';
  content.innerHTML = `
    <div><strong>Description:</strong> ${room.opis || room.description || '—'}</div>
    <div><strong>Capacity:</strong> ${room.kapacitet ?? room.capacity ?? '—'}</div>
    <div><strong>Price:</strong> ${room.cijena ?? room.price ?? '—'}</div>
    <div style="margin-top:0.5rem;"><strong>Extras:</strong> ${room.extras || room.dodatno || '-'}</div>
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

function selectFromModal() {
  const modal = document.getElementById('room-modal');
  const room = modal.dataset.room ? JSON.parse(modal.dataset.room) : null;
  if (!room) return;
  const roomId = room.id ?? room.sobaId ?? room._id ?? '';
  const q = new URLSearchParams({
    roomId,
    checkin: document.getElementById('checkin').value,
    checkout: document.getElementById('checkout').value,
    guests: document.getElementById('guests').value
  }).toString();
  location.href = `./rezervacija-create.html?${q}`;
}

document.getElementById('search-btn').addEventListener('click', searchRooms);
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-select').addEventListener('click', selectFromModal);

// support Enter key in dates
['checkin','checkout'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchRooms();
  });
});