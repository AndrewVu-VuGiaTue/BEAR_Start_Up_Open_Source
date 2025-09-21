const HealthData = require("../models/Health_Data");
const { detectFall } = require("../ai/fallDetection");

// Ingest dữ liệu từ vòng tay/app
const ingest = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId; // cho phép thiết bị gửi kèm userId nếu không auth
    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }

    const { bpm, spo2, accel, battery, source, recordedAt } = req.body;
    const totalG = accel?.totalG ?? (typeof accel?.x === "number" && typeof accel?.y === "number" && typeof accel?.z === "number"
      ? Math.sqrt(accel.x * accel.x + accel.y * accel.y + accel.z * accel.z)
      : undefined);

    const isFallDetected = detectFall(Number(totalG || 0));

    const doc = await HealthData.create({
      user: userId,
      bpm,
      spo2,
      accel: totalG != null ? { totalG, x: accel?.x, y: accel?.y, z: accel?.z } : accel,
      battery,
      isFallDetected,
      source,
      recordedAt: recordedAt ? new Date(recordedAt) : undefined,
    });

    // Realtime: phát sự kiện cho app theo dõi
    const io = req.app.get("io");
    if (io) {
      io.to(String(userId)).emit("health:update", { health: doc });
      if (isFallDetected) io.to(String(userId)).emit("health:fall", { health: doc });
    }

    res.status(201).json({ message: "Ingested", health: doc });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Lấy bản ghi mới nhất cho user
const latest = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?._id;
    if (!userId) return res.status(400).json({ message: "Missing userId" });

    const doc = await HealthData.findOne({ user: userId }).sort({ recordedAt: -1, createdAt: -1 });
    res.json({ health: doc });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Lấy chuỗi thời gian theo khoảng
const timeseries = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?._id;
    const { from, to, limit = 500 } = req.query;
    if (!userId) return res.status(400).json({ message: "Missing userId" });
    const query = { user: userId };
    if (from || to) {
      query.recordedAt = {};
      if (from) query.recordedAt.$gte = new Date(from);
      if (to) query.recordedAt.$lte = new Date(to);
    }
    const docs = await HealthData.find(query).sort({ recordedAt: -1 }).limit(Number(limit));
    res.json({ health: docs });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { ingest, latest, timeseries };

