/**
 * CorexUrl - Backend Server
 * Handles URL registration, JSON proxying, and media streaming for the Corex URL masking service.
 */

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const registerRouter = require("./routes/register");
const proxyJsonRouter = require("./routes/proxyJson");
const streamRouter = require("./routes/stream");

const app = express();
const PORT = process.env.PORT || 23480;

// Middleware Configuration
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "frontend")));

// API Routes
app.use("/corex/register", registerRouter);
app.use("/corex/proxy-json", proxyJsonRouter);
app.use("/corex", streamRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "CorexUrl server is running" });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "The requested endpoint does not exist",
    path: req.path
  });
});

// Error handler for unhandled exceptions
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : "An error occurred"
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`\nCorexUrl server is running`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Production: https://corexanthony.vercel.app`);
  console.log(`\nAPI endpoints ready:`);
  console.log(`   POST /corex/register - Register URLs`);
  console.log(`   POST /corex/proxy-json - Proxy JSON`);
  console.log(`   GET /corex/:id - Stream media\n`);
});

module.exports = app;
