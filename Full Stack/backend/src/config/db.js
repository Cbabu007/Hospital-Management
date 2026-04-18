const mongoose = require("mongoose");

const REQUIRED_COLLECTIONS = [
  "human_resources",
  "login_management",
  "inpatient_bed_management",
  "patient_feedback",
  "appointment",
  "otp_codes",
];

const ensureCollections = async () => {
  const existing = await mongoose.connection.db.listCollections().toArray();
  const existingNames = new Set(existing.map((item) => item.name));

  const missing = REQUIRED_COLLECTIONS.filter((name) => !existingNames.has(name));
  await Promise.all(missing.map((name) => mongoose.connection.db.createCollection(name)));
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/Hospital";

  try {
    await mongoose.connect(uri, {
      dbName: "Hospital",
    });
    await ensureCollections();
    // eslint-disable-next-line no-console
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("MongoDB connection failed", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
