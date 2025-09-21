const mongoose = require("mongoose");

const accelSchema = new mongoose.Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    z: { type: Number, required: true },
    totalG: { type: Number, required: true },
  },
  { _id: false }
);

const batterySchema = new mongoose.Schema(
  {
    voltage: { type: Number },
    percent: { type: Number },
  },
  { _id: false }
);

const healthDataSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bpm: { type: Number },
    spo2: { type: Number },
    accel: { type: accelSchema },
    battery: { type: batterySchema },
    isFallDetected: { type: Boolean, default: false },
    source: { type: String, enum: ["device", "app", "test"], default: "device" },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Health_Data", healthDataSchema);
