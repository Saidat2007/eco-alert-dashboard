document.addEventListener('DOMContentLoaded', () => {
  const hazardForm = document.getElementById('hazardForm');
  const alertsList = document.getElementById('alertsList');

  // Fetch and display active hazards
  async function loadAlerts() {
    try {
      const response = await fetch('/api/alerts');
      const alerts = await response.json();

      alertsList.innerHTML = '';

      if (alerts.length === 0) {
        alertsList.innerHTML = '<p style="color: #a0aec0; font-size: 0.9rem;">No active hazards reported yet.</p>';
        return;
      }

      alerts.forEach(alertItem => {
        const item = document.createElement('div');
        const severityClass = (alertItem.severity || 'Medium').toLowerCase();
        item.className = `alert-card ${severityClass}`;

        const dateStr = new Date(alertItem.createdAt || Date.now()).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          month: 'short',
          day: 'numeric'
        });

        item.innerHTML = `
          <div class="alert-header">
            <span class="alert-title">${alertItem.hazardType}</span>
            <span class="badge badge-${severityClass}">${alertItem.severity} Risk</span>
          </div>
          <div class="alert-details">
            <strong>Location:</strong> ${alertItem.location}
          </div>
          ${alertItem.description ? `<div class="alert-details" style="margin-top: 4px; color: #4a5568; font-style: italic;">"${alertItem.description}"</div>` : ''}
          <div class="alert-meta">
            <span>Contact: ${alertItem.contact || 'Anonymous'}</span>
            <span>${dateStr}</span>
          </div>
        `;
        alertsList.appendChild(item);
      });
    } catch (error) {
      console.error('Error fetching alerts:', error);
      alertsList.innerHTML = '<p style="color: #e53e3e; font-size: 0.9rem;">Failed to load active alerts.</p>';
    }
  }

  // Handle Form Submission
  hazardForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newReport = {
      location: document.getElementById('location').value,
      hazardType: document.getElementById('hazardType').value,
      severity: document.getElementById('severity').value,
      description: document.getElementById('description').value,
      contact: document.getElementById('contact').value
    };

    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReport)
      });

      if (response.ok) {
        hazardForm.reset();
        loadAlerts();
      } else {
        alert('Failed to submit report. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error submitting report.');
    }
  });

  loadAlerts();
});