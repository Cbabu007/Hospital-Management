const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const humanResourceRoutes = require("./routes/humanResourceRoutes");
const authRoutes = require("./routes/authRoutes");
const inpatientBedRoutes = require("./routes/inpatientBedRoutes");
const patientFeedbackRoutes = require("./routes/patientFeedbackRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const errorHandler = require("./middleware/errorHandler");


const app = express();
app.set("trust proxy", 1);

// Serve uploads folder for images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const devOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
const configuredOrigins = String(process.env.CORS_ORIGIN || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const allowedOrigins = configuredOrigins.length
  ? configuredOrigins
  : (process.env.NODE_ENV === "production" ? [] : devOrigins);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("CORS origin not allowed"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "hospital-backend" });
});

app.use("/api/human-resources", humanResourceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/inpatient-beds", inpatientBedRoutes);
app.use("/api/patient-feedback", patientFeedbackRoutes);
app.use("/api/appointments", appointmentRoutes);

app.use(errorHandler);

module.exports = app;
