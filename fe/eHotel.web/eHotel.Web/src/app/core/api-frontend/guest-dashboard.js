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

document.getElementById('load-guest-dashboard').addEventListener('click', () => {
  renderOutput('output-guest-dashboard', 'Loading...');
  fetchJson('/api/dashboard/guest')
    .then((data) => renderOutput('output-guest-dashboard', data))
    .catch((error) => renderOutput('output-guest-dashboard', error.message || String(error)));
});