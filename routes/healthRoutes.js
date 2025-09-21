const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { ingest, latest, timeseries, healthcheck } = require("../controllers/healthController");

const router = express.Router();

// Thiết bị có thể gửi kèm userId (không auth) hoặc app dùng Bearer token
router.post("/ingest", ingest);

// App lấy dữ liệu: cần auth
router.get("/latest", protect, latest);
router.get("/latest/:userId", protect, latest);
router.get("/timeseries", protect, timeseries);
router.get("/timeseries/:userId", protect, timeseries);

// Healthcheck (public)
router.get("/healthcheck", healthcheck);

module.exports = router;

