const mongoose = require("mongoose");

const otpCodeSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    code: { type: String, required: true },
    purpose: { type: String, enum: ["verify_email", "login"], required: true },
    expiresAt: { type: Date, required: true },
    consumedAt: { type: Date },
  },
  { timestamps: true }
);

otpCodeSchema.index({ email: 1, purpose: 1, expiresAt: 1 });

module.exports = mongoose.model("OtpCode", otpCodeSchema);

