const mongoose = require("mongoose");

const patientFeedbackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    feedback: { type: String, required: true, trim: true },
    date: { type: String, default: "" },
  },
  { timestamps: true, collection: "patient_feedback" },
);

module.exports = mongoose.model("PatientFeedback", patientFeedbackSchema);
