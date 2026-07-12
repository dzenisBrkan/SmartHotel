const apiBaseUrl = '';

function fetchJson(endpoint, options = {}) {
  const url = apiBaseUrl + endpoint;
  return fetch(url, options).then(async (res) => {
    const txt = await res.text();
    try { return JSON.parse(txt); } catch { return txt; }
  });
}

function renderUser(user) {
  const card = document.createElement('div');
  card.className = 'item-card';
  card.innerHTML = `
    <div><strong>ID:</strong> ${user.id || user.korisnikId || user._id || '-'}</div>
    <div><strong>Name:</strong> ${user.name || user.naziv || '-'}</div>
    <div><strong>Email:</strong> ${user.email || user.mail || '-'}</div>
    <div><strong>Role:</strong> ${user.role || user.uloga || '-'}</div>
  `;
  return card;
}

function renderUsers(list) {
  const container = document.getElementById('users-list');
  container.innerHTML = '';
  if (!Array.isArray(list) || list.length === 0) {
    container.innerHTML = '<div class="item-card">No users found.</div>';
    return;
  }
  list.forEach((user) => container.appendChild(renderUser(user)));
}

async function loadUsers() {
  const endpoints = ['/api/korisnici', '/api/users'];
  for (const ep of endpoints) {
    try {
      const data = await fetchJson(ep);
      const list = Array.isArray(data) ? data : data?.data ?? data;
      if (Array.isArray(list)) {
        renderUsers(list);
        return;
      }
    } catch {}
  }
  document.getElementById('users-list').innerHTML = '<div class="item-card">Unable to load users.</div>';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('reload-users').addEventListener('click', loadUsers);
  loadUsers();
});