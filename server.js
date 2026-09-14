const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory alert storage (will connect to AWS services later)
let alerts = [
  {
    id: 1,
    location: "Zone A - Central",
    hazardType: "Localized Flooding",
    severity: "High",
    timestamp: new Date().toISOString()
  }
];

// API Endpoint: Fetch alerts (Used by Web UI & Alexa Skill)
app.get('/api/alerts', (req, res) => {
  res.json({ success: true, count: alerts.length, data: alerts });
});

// API Endpoint: Submit new hazard report
app.post('/api/alerts', (req, res) => {
  const { location, hazardType, severity } = req.body;
  if (!location || !hazardType) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const newAlert = {
    id: alerts.length + 1,
    location,
    hazardType,
    severity: severity || "Medium",
    timestamp: new Date().toISOString()
  };

  alerts.push(newAlert);
  res.status(201).json({ success: true, data: newAlert });
});

app.listen(PORT, () => {
  console.log(`EcoAlert server running on http://localhost:${PORT}`);
});