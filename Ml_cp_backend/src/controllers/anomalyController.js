const Anomaly = require("../models/Anomaly");
const axios = require("axios");
const env = require("dotenv").config();

const SLACK_WEBHOOK_URL = process.env.slack_url;
// Helper function to detect anomaly type
function detectAnomalyType(data) {
  // SQL Injection anomaly has 'query' and 'parsedLogsResponse' fields
  if (data.query && data.parsedLogsResponse) {
    return "SQL_INJECTION";
  }
  // Response time anomaly has log_response_time and reconstruction_error
  if (data.log_response_time && typeof data.reconstruction_error === "number") {
    return "RESPONSE_TIME";
  }
  return "UNKNOWN";
}

// Helper function to build Slack message based on anomaly type
function buildSlackMessage(anomalyType, anomalyData) {
  if (anomalyType === "SQL_INJECTION") {
    const query = anomalyData.query || "Unknown";
    const detectedAt = anomalyData.detectedAt || new Date().toISOString();
    const message =
      anomalyData.parsedLogsResponse?.message ||
      "⚠️ SQL injection attempt detected";

    return {
      text: `🚨 *SQL INJECTION ANOMALY DETECTED*\n\nQuery: \`${query}\`\nMessage: ${message}\nDetected At: ${detectedAt}`,
    };
  } else if (anomalyType === "RESPONSE_TIME") {
    const approxResponseTime = Math.expm1(anomalyData.log_response_time || 0);
    const reconstructionError = (anomalyData.reconstruction_error || 0).toFixed(
      2
    );
    const endpointEnc = anomalyData.endpoint_enc || "unknown";
    const timestamp = anomalyData.timestamp || new Date().toISOString();
    const normalizedLatency = (anomalyData.normalized_latency || 0).toFixed(2);

    return {
      text: `🚨 *RESPONSE TIME ANOMALY DETECTED*\n\nEndpoint: ${endpointEnc}\nResponse Time: ${approxResponseTime.toFixed(
        2
      )}ms\nNormalized Latency: ${normalizedLatency}ms\nReconstruction Error: ${reconstructionError}\nTimestamp: ${timestamp}`,
    };
  }

  // Fallback for unknown types
  return {
    text: `⚠️ *UNKNOWN ANOMALY TYPE*\n\nData: ${JSON.stringify(
      anomalyData,
      null,
      2
    )}`,
  };
}

// Save flagged anomaly
exports.createAnomaly = async (req, res) => {
  try {
    // 1️⃣ Save anomaly to DB
    const anomaly = await Anomaly.create(req.body);
    console.log("Anomaly saved:", anomaly);

    // 2️⃣ Detect anomaly type
    const anomalyType = detectAnomalyType(req.body);
    console.log(`Detected anomaly type: ${anomalyType}`);

    // 3️⃣ Build appropriate Slack message
    const slackMessage = buildSlackMessage(anomalyType, req.body);

    try {
      console.log("Sending to Slack...");
      const slackResponse = await axios.post(SLACK_WEBHOOK_URL, slackMessage, {
        timeout: 5000,
      });

      console.log("✅ Slack notification sent successfully");
    } catch (err) {
      console.error("❌ Slack webhook failed:", err.message);
      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Status:", err.response.status);
      }
    }

    // 4️⃣ Send API response
    res.status(201).json({
      success: true,
      data: anomaly,
      anomalyType,
    });
  } catch (error) {
    console.error("Error creating anomaly:", error.message);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all anomalies
exports.getAnomalies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const anomalies = await Anomaly.find()
      .sort({ flagged_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Anomaly.countDocuments();

    res.status(200).json({
      success: true,
      count: anomalies.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: anomalies,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get anomalies by time range
exports.getAnomaliesByTimeRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const anomalies = await Anomaly.find({
      flagged_at: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).sort({ flagged_at: -1 });

    res.status(200).json({
      success: true,
      count: anomalies.length,
      data: anomalies,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get anomaly statistics
exports.getAnomalyStats = async (req, res) => {
  try {
    const stats = await Anomaly.aggregate([
      {
        $group: {
          _id: null,
          totalAnomalies: { $sum: 1 },
          avgReconstructionError: { $avg: "$reconstruction_error" },
          avgLatency: { $avg: "$normalized_latency" },
          maxReconstructionError: { $max: "$reconstruction_error" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalAnomalies: 0,
        avgReconstructionError: 0,
        avgLatency: 0,
        maxReconstructionError: 0,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Diagnostic: Check anomalies count and DB info
exports.getDiagnostics = async (req, res) => {
  try {
    const count = await Anomaly.countDocuments();
    const sample = await Anomaly.findOne();

    // Get connection info from mongoose
    const connection = Anomaly.collection.conn.name || "unknown";
    const collectionName = Anomaly.collection.name;
    const dbName = Anomaly.collection.conn.db.databaseName;

    res.status(200).json({
      success: true,
      database: dbName,
      collection: collectionName,
      connectionName: connection,
      totalAnomalies: count,
      sampleAnomaly: sample,
      message: `Anomalies are stored in database: "${dbName}" → collection: "${collectionName}"`,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      hint: "Anomalies should be in the database specified in your MONGO_URI (check connectDB config)",
    });
  }
};
