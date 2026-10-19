import express from "express";
import axios from "axios";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Load Server/.env locally (Node 20.12+). On Render, env vars come from the dashboard.
try {
  process.loadEnvFile();
} catch {
  // No .env file found, which is fine in production
}

const app = express();
const PORT = process.env.PORT || 8000;

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.join(__dirname, "../client/dist");
const hasClientBuild = fs.existsSync(path.join(clientDistPath, "index.html"));

// Allowed origins: local dev + your deployed frontend
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:8000",
  "https://trainstatuscheck.vercel.app",
  process.env.FRONTEND_URL, // optional extra origin, set on Render if needed
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Origin:", req.headers.origin || "Direct request");
  next();
});

app.use(express.json());
if (hasClientBuild) {
  app.use(express.static(clientDistPath));
}

// Health check (useful for Render)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Train API endpoint
app.get("/api/train/:trainNo", async (req, res) => {
  console.log("\n===== TRAIN REQUEST =====");
  console.log("Params:", req.params);

  try {
    const trainNo = req.params.trainNo;

    if (!trainNo || isNaN(trainNo)) {
      return res.status(400).json({
        error: "Invalid train number",
        message: "Please provide a valid numeric train number",
      });
    }

    const apiUrl = `https://rappid.in/apis/train.php?train_no=${trainNo}`;
    console.log("Fetching from external API:", apiUrl);

    const response = await axios.get(apiUrl, {
      headers: {
        "User-Agent": "TrainScheduleApp/1.0",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      timeout: 10000,
    });

    res.setHeader("X-Proxy-Success", "true");
    res.status(200).json(response.data);
  } catch (error) {
    console.error("\n===== TRAIN API ERROR =====");
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Response Data:", error.response.data);
    }

    const statusCode = error.response?.status || 500;
    res.status(statusCode).json({
      error: "Failed to fetch train data",
      message: error.message,
      ...(error.response && { details: error.response.data }),
    });
  }
});

// PNR API endpoint (key stays on the server, never in the browser)
app.get("/api/pnr/:pnr", async (req, res) => {
  console.log("\n===== PNR REQUEST =====");

  try {
    const pnr = req.params.pnr;

    if (!/^\d{10}$/.test(pnr)) {
      return res.status(400).json({
        error: "Invalid PNR",
        message: "PNR must be a 10-digit number",
      });
    }

    const { RAPIDAPI_KEY, RAPIDAPI_HOST, RAPIDAPI_PNR_URL } = process.env;

    if (!RAPIDAPI_KEY || !RAPIDAPI_HOST || !RAPIDAPI_PNR_URL) {
      console.error("Missing RAPIDAPI_KEY, RAPIDAPI_HOST or RAPIDAPI_PNR_URL");
      return res.status(500).json({
        error: "Server not configured",
        message: "PNR service credentials are missing on the server",
      });
    }

    const response = await axios.get(RAPIDAPI_PNR_URL, {
      params: { pnr }, // change "pnr" if your RapidAPI endpoint uses another parameter name
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
      timeout: 10000,
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("\n===== PNR API ERROR =====");
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Response Data:", error.response.data);
    }

    const statusCode = error.response?.status || 500;
    res.status(statusCode).json({
      error: "Failed to fetch PNR data",
      message: error.message,
      ...(error.response && { details: error.response.data }),
    });
  }
});

// Serve frontend (only when a client build exists, e.g. local production run)
if (hasClientBuild) {
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("\n===== SERVER ERROR =====");
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\nServer running on http://localhost:${PORT}`);
  console.log(`Train endpoint: http://localhost:${PORT}/api/train/:trainNo`);
  console.log(`PNR endpoint:   http://localhost:${PORT}/api/pnr/:pnr`);
  console.log(`CORS allowed origins: ${allowedOrigins.join(", ")}\n`);
});