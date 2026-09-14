const API_URL = '/api/alerts';

// Fetch and display active alerts from backend
async function fetchAlerts() {
  try {
    const response = await fetch(API_URL);
    const result = await response.json();
    
    const alertsList = document.getElementById('alertsList');
    alertsList.innerHTML = '';

    if (result.data.length === 0) {
      alertsList.innerHTML = '<li>No active hazard alerts reported.</li>';
      return;
    }

    result.data.forEach(alert => {
      const li = document.createElement('li');
      li.className = alert.severity;
      li.innerHTML = `
        <strong>${alert.hazardType}</strong> (${alert.severity} Risk)<br>
        <span>Location: ${alert.location}</span><br>
        <small>Reported: ${new Date(alert.timestamp).toLocaleString()}</small>
      `;
      alertsList.appendChild(li);
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
  }
}

// Handle form submission to create a new alert
document.getElementById('hazardForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const location = document.getElementById('location').value;
  const hazardType = document.getElementById('hazardType').value;
  const severity = document.getElementById('severity').value;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location, hazardType, severity })
    });

    if (response.ok) {
      document.getElementById('location').value = '';
      fetchAlerts(); // Refresh alert list automatically
    }
  } catch (error) {
    console.error('Error submitting report:', error);
  }
});

// Load alerts on initial page launch
fetchAlerts();