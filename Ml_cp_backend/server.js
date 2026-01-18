const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/database");
const logRoutes = require("./src/routes/logRoutes");
const anomalyRoutes = require("./src/routes/anomalyRoutes"); // add this
const parsedLogRoutes = require("./src/routes/parsedLogRoutes");
const logWatcher = require("./src/services/logWatcher");
const mlService = require("./src/services/mlService"); // add this

const logger = require("./src/middleware/logger");

const app = express();

// Connect to MongoDB and start ML Service
connectDB().then(async () => {
  try {
    // Start ML Service (Python FastAPI)
    try {
      await mlService.start();
      console.log("✅ ML Service initialized");
    } catch (mlErr) {
      console.error("❌ Failed to initialize ML Service:", mlErr.message);
      console.warn("⚠️ Continuing without ML Service...");
    }

    await logWatcher.watch();
    console.log(
      "LogWatcher status:",
      logWatcher.isConnected() ? "Connected" : "Not Connected",
    );
  } catch (error) {
    console.error("Failed to initialize services:", error);
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Log every request
// app.use((req, res, next) => {
//   logger.info({
//     message: 'Incoming Request',
//     method: req.method,
//     url: req.url,
//     ip: req.ip
//   });
//   next();
// });

// Routes
app.use("/api", logRoutes);
app.use("/api/anomalies", anomalyRoutes); // add this
app.use("/api", parsedLogRoutes);

const PORT = process.env.PORT || 3000;

// Update server shutdown handling
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

process.on("SIGTERM", () => {
  console.log("🛑 Shutting down gracefully...");
  logWatcher.close();
  mlService.stop(); // Stop ML Service
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("🛑 Shutting down gracefully...");
  logWatcher.close();
  mlService.stop(); // Stop ML Service
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});
