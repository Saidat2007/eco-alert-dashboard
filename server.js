require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Local In-Memory Fallback Storage
let localAlerts = [];

// AWS DynamoDB Setup
const hasAwsCredentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;
let docClient = null;

if (hasAwsCredentials) {
  const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  docClient = DynamoDBDocumentClient.from(client);
  console.log('AWS DynamoDB connected successfully.');
} else {
  console.log('AWS credentials missing. Running in Local In-Memory Mode.');
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. GET /api/alerts - Fetch all hazard alerts
app.get('/api/alerts', async (req, res) => {
  try {
    if (hasAwsCredentials && docClient) {
      const command = new ScanCommand({
        TableName: process.env.DYNAMODB_TABLE || 'EcoAlerts',
      });
      const data = await docClient.send(command);
      return res.json(data.Items || []);
    }

    // Fallback: Return local in-memory alerts
    res.json(localAlerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// 2. POST /api/alerts - Create a new hazard report
app.post('/api/alerts', async (req, res) => {
  try {
    const { location, hazardType, severity } = req.body;

    if (!location || !hazardType) {
      return res.status(400).json({ error: 'Location and hazard type are required.' });
    }

    const newAlert = {
      id: Date.now().toString(),
      location,
      hazardType,
      severity: severity || 'Medium',
      createdAt: new Date().toISOString(),
    };

    if (hasAwsCredentials && docClient) {
      const command = new PutCommand({
        TableName: process.env.DYNAMODB_TABLE || 'EcoAlerts',
        Item: newAlert,
      });
      await docClient.send(command);
      console.log('Saved to DynamoDB:', newAlert);
      return res.status(201).json(newAlert);
    }

    // Fallback: Save to local array
    localAlerts.unshift(newAlert);
    console.log('Saved to Local Storage:', newAlert);
    res.status(201).json(newAlert);

  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Failed to create hazard report' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});