const express = require("express");
const router = express.Router();
const {
  createLog,
  getLogs,
  getLogsByEndpoint,
  getLogsByDateRange,
  getLogStats,
  getLogsLastHour,
  normalCartService,
  slowCartService,
  fastCartService,
  normalProductService,
  slowProductService,
  fastProductService
} = require("../controllers/logController");

router.post("/logs", createLog);
router.get("/logs", getLogs);
router.get("/logs/endpoint/:endpoint", getLogsByEndpoint);
router.get("/logs/daterange", getLogsByDateRange);
router.get("/logs/stats", getLogStats);
router.get("/logs/lasthour", getLogsLastHour);

router.post("/cart/normal", normalCartService);
router.post("/cart/slow", slowCartService);
router.post("/cart/fast", fastCartService);

router.post("/products/normal", normalProductService);
router.post("/products/slow", slowProductService);
router.post("/products/fast", fastProductService);

module.exports = router;
