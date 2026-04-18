const crypto = require("crypto");
const OtpCode = require("../models/OtpCode");

const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

const normalizeValue = (value) => String(value || "").trim().toLowerCase();
const hashOtp = (otp) => crypto.createHash("sha256").update(String(otp || "")).digest("hex");

const createOtp = async (email, type) => {
  const normalizedEmail = normalizeValue(email);
  const normalizedType = normalizeValue(type);
  const otp = String(Math.floor(100000 + Math.random() * 900000));

  await OtpCode.findOneAndUpdate(
    { email: normalizedEmail, type: normalizedType },
    {
      otpHash: hashOtp(otp),
      attempts: 0,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return otp;
};

const readOtpRecord = async (email, type) => {
  const normalizedEmail = normalizeValue(email);
  const normalizedType = normalizeValue(type);
  const record = await OtpCode.findOne({ email: normalizedEmail, type: normalizedType });

  if (!record) {
    return { ok: false, reason: "OTP not found" };
  }

  if (Date.now() > new Date(record.expiresAt).getTime()) {
    await OtpCode.deleteOne({ _id: record._id });
    return { ok: false, reason: "OTP expired" };
  }

  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    await OtpCode.deleteOne({ _id: record._id });
    return { ok: false, reason: "Too many invalid attempts. Request a new OTP" };
  }

  return { ok: true, record };
};

const verifyOtp = async (email, type, otp) => {
  const recordResult = await readOtpRecord(email, type);
  if (!recordResult.ok) {
    return recordResult;
  }

  const { record } = recordResult;
  if (record.otpHash !== hashOtp(otp)) {
    await OtpCode.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
    return { ok: false, reason: "Invalid OTP" };
  }

  await OtpCode.deleteOne({ _id: record._id });
  return { ok: true };
};

// Peek-verify without consuming — use before final submit step
const checkOtp = async (email, type, otp) => {
  const recordResult = await readOtpRecord(email, type);
  if (!recordResult.ok) {
    return recordResult;
  }

  const { record } = recordResult;
  if (record.otpHash !== hashOtp(otp)) {
    await OtpCode.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
    return { ok: false, reason: "Invalid OTP" };
  }

  return { ok: true };
};

module.exports = {
  createOtp,
  verifyOtp,
  checkOtp,
};
