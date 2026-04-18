const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true },
    mobile: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    message: { type: String, default: "" },
    doctorName: { type: String, default: "" },
    doctorDept: { type: String, default: "" },
    status: { type: String, enum: ["Conform Book", "Booked", "Cancelled"], default: "Conform Book" },
    created: { type: String, default: "" },
  },
  { timestamps: true, collection: "appointment" },
);

appointmentSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
