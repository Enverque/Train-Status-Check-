import express from "express";
import axios from "axios";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 8000;

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientDistPath = path.join(__dirname, '../client/dist');

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:8000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin || 'Direct request');
  next();
});

app.use(express.json());
app.use(express.static(clientDistPath));

// Enhanced Train API endpoint
app.get('/api/train/:trainNo', async (req, res) => {
  console.log('\n===== TRAIN REQUEST DETAILS =====');
  console.log('Headers:', req.headers);
  console.log('Params:', req.params);

  try {
    const trainNo = req.params.trainNo;
    
    if (!trainNo || isNaN(trainNo)) {
      console.error('Invalid train number received');
      return res.status(400).json({ 
        error: 'Invalid train number',
        message: 'Please provide a valid numeric train number'
      });
    }

    const apiUrl = `https://rappid.in/apis/train.php?train_no=${trainNo}`;
    console.log('Fetching from external API:', apiUrl);

    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'TrainScheduleApp/1.0',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      timeout: 10000
    });

    console.log('External API response:', {
      status: response.status,
      data: response.data
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Proxy-Success', 'true');
    res.status(200).json(response.data);

  } catch (error) {
    console.error('\n===== API ERROR =====');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    }

    const statusCode = error.response?.status || 500;
    res.status(statusCode).json({
      error: 'Failed to fetch train data',
      message: error.message,
      ...(error.response && { details: error.response.data })
    });
  }
});

// Serve frontend
app.get(/^(?!\/api).*/, (req, res) => {
  console.log(`Serving index.html for ${req.url}`);
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('\n===== SERVER ERROR =====');
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\nServer running on http://localhost:${PORT}`);
  console.log(`API Endpoint: http://localhost:${PORT}/api/train/:trainNo`);
  console.log(`CORS Allowed Origins: http://localhost:5173, http://127.0.0.1:5173\n`);
});