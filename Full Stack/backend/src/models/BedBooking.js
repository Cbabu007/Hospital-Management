const mongoose = require("mongoose");

const bedBookingSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, unique: true, trim: true },
    patientName: { type: String, required: true, trim: true },
    dateOfBirth: { type: String, default: "" },
    age: { type: String, default: "" },
    fatherName: { type: String, default: "" },
    takeCare: { type: String, default: "" },
    department: { type: String, default: "" },
    doctor: { type: String, default: "" },
    bedType: { type: String, required: true },
    roomNo: { type: Number, required: true },
    createdAtClient: { type: String, default: "" },
  },
  { timestamps: true, collection: "inpatient_bed_management" },
);

bedBookingSchema.index({ bedType: 1, roomNo: 1 });

module.exports = mongoose.model("BedBooking", bedBookingSchema);
