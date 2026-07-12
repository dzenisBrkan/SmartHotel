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

document.getElementById('load-admin-dashboard').addEventListener('click', () => {
  renderOutput('output-admin-dashboard', 'Loading...');
  fetchJson('/api/dashboard/admin')
    .then((data) => renderOutput('output-admin-dashboard', data))
    .catch((error) => renderOutput('output-admin-dashboard', error.message || String(error)));
});