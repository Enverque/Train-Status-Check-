import express from "express";
import axios from "axios";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { pathToRegexp } from 'path-to-regexp';

const app = express();
const PORT = process.env.PORT || 8000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const clientDistPath = path.join(__dirname, '../client/dist');

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000'
    : 'https://your-production-domain.com',
  methods: ['GET'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// API Route - Fixed parameter syntax
app.get("/api/train/:trainNo", async (req, res) => {
  try {
    const { trainNo } = req.params;
    const response = await axios.get(
      `https://rappid.in/apis/train.php?train_no=${trainNo}`,
      { headers: { 'Accept': 'application/json' } }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching train data:", error);
    res.status(500).json({ 
      error: "Failed to fetch train data",
      details: error.message 
    });
  }
});

// Serve static files
app.use(express.static(clientDistPath));

// Fallback route - must come after static files and API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});