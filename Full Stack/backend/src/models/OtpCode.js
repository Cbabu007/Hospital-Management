const mongoose = require("mongoose");

const otpCodeSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    type: { type: String, required: true, trim: true },
    otpHash: { type: String, required: true },
    attempts: { type: Number, default: 0, min: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true, collection: "otp_codes" },
);

otpCodeSchema.index({ email: 1, type: 1 }, { unique: true });
otpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("OtpCode", otpCodeSchema);
