const express = require("express");
const anomalyController = require("../controllers/anomalyController");

const router = express.Router();

// Diagnostic endpoint
router.get("/diagnostics", anomalyController.getDiagnostics);

// CRUD endpoints
router.post("/", anomalyController.createAnomaly);
router.get("/", anomalyController.getAnomalies);
router.get("/stats", anomalyController.getAnomalyStats);
router.get("/range", anomalyController.getAnomaliesByTimeRange);

module.exports = router;
