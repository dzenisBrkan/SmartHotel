const apiBaseUrl = '';

const routes = {
  home: 'page-home',
  sobe: 'page-sobe',
  usluge: 'page-usluge',
  rezervacije: 'page-rezervacije',
  korisnici: 'page-korisnici',
  login: 'page-login',
  register: 'page-register'
};

function setActivePage(pageKey) {
  Object.values(routes).forEach((id) => {
    const section = document.getElementById(id);
    section.classList.toggle('active', id === routes[pageKey]);
  });
  history.replaceState(null, '', `#${pageKey}`);
}

function fetchJson(endpoint, options = {}) {
  const url = apiBaseUrl + endpoint;
  return fetch(url, options).then(async (response) => {
    const result = await response.text();
    let data;
    try {
      data = JSON.parse(result);
    } catch {
      data = result;
    }

    if (!response.ok) {
      throw new Error(JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        body: data
      }, null, 2));
    }

    return data;
  });
}

function renderOutput(elementId, data) {
  const outputElement = document.getElementById(elementId);
  outputElement.textContent = JSON.stringify(data, null, 2);
}

function handleLoad(endpoint, outputId) {
  renderOutput(outputId, 'Loading...');
  fetchJson(endpoint)
    .then((data) => renderOutput(outputId, data))
    .catch((error) => renderOutput(outputId, error.message || String(error)));
}

function handleForm(event, endpoint, outputId) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const body = Object.fromEntries(formData.entries());

  renderOutput(outputId, 'Submitting...');
  fetchJson(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
    .then((data) => renderOutput(outputId, data))
    .catch((error) => renderOutput(outputId, error.message || String(error)));
}

function setupNavigation() {
  document.querySelectorAll('nav button').forEach((button) => {
    button.addEventListener('click', () => {
      setActivePage(button.dataset.page);
    });
  });
}

function setupActions() {
  document.getElementById('load-sobe').addEventListener('click', () => handleLoad('/api/sobe', 'output-sobe'));
  document.getElementById('load-usluge').addEventListener('click', () => handleLoad('/api/usluge', 'output-usluge'));
  document.getElementById('load-rezervacije').addEventListener('click', () => handleLoad('/api/rezervacije', 'output-rezervacije'));
  document.getElementById('load-korisnici').addEventListener('click', () => handleLoad('/api/korisnici', 'output-korisnici'));

  document.getElementById('login-form').addEventListener('submit', (event) => {
    handleForm(event, '/api/auth/login', 'output-login');
  });

  document.getElementById('register-form').addEventListener('submit', (event) => {
    handleForm(event, '/api/auth/register', 'output-register');
  });
}

function initRouter() {
  const hash = window.location.hash.slice(1);
  const pageKey = routes[hash] ? hash : 'home';
  setActivePage(pageKey);
}

window.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupActions();
  initRouter();
});