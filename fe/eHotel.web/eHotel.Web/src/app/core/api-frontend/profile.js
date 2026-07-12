const apiBaseUrl = '';

function fetchJson(endpoint, options = {}) {
  const url = apiBaseUrl + endpoint;
  return fetch(url, options).then(async (res) => {
    const txt = await res.text();
    try { return { ok: res.ok, data: JSON.parse(txt), status: res.status }; } catch { return { ok: res.ok, data: txt, status: res.status }; }
  });
}

async function loadProfile() {
  const candidates = ['/api/korisnici/me','/api/users/me','/api/korisnici','/api/users'];
  for (const ep of candidates) {
    try {
      const r = await fetchJson(ep);
      const payload = r && r.data ? (Array.isArray(r.data)? r.data[0] : r.data) : r.data ?? r;
      if (payload && (payload.email || payload.name || payload.naziv)) {
        document.getElementById('name').value = payload.name || payload.naziv || '';
        document.getElementById('email').value = payload.email || payload.mail || '';
        document.getElementById('phone').value = payload.phone || payload.telefon || '';
        return;
      }
    } catch(e) {}
  }
}

async function saveProfile(e) {
  e.preventDefault();
  const payload = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    password: document.getElementById('password').value || undefined
  };
  const endpoints = ['/api/korisnici/me','/api/users/me','/api/korisnici','/api/users'];
  const out = document.getElementById('profile-output');
  out.textContent = 'Saving...';
  for (const ep of endpoints) {
    try {
      const r = await fetchJson(ep, {
        method: 'PUT',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(payload)
      });
      if (r && (r.ok || r.status === 200)) {
        out.textContent = 'Saved: ' + JSON.stringify(r.data ?? r, null, 2);
        return;
      } else {
        out.textContent = `Attempted ${ep}: ${JSON.stringify(r.data ?? r, null, 2)}`;
      }
    } catch(err) {
      out.textContent = `Error: ${err.message || err}`;
    }
  }
  out.textContent += '\nAll endpoints tried.';
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('profile-form');
  if (form) {
    form.addEventListener('submit', saveProfile);
    document.getElementById('logout-btn').addEventListener('click', () => {
      // best-effort logout: clear localStorage tokens if used and redirect
      try { localStorage.removeItem('token'); } catch {}
      location.href = './index.html';
    });
    loadProfile();
  }
});