const apiBaseUrl = '';

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

document.getElementById('login-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const body = Object.fromEntries(formData.entries());

  renderOutput('output-login', 'Submitting...');
  fetchJson('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
    .then((data) => renderOutput('output-login', data))
    .catch((error) => renderOutput('output-login', error.message || String(error)));
});