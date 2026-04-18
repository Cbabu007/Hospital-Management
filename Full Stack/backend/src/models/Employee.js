const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    type: { type: String, enum: ["Doctor", "Others"], required: true },
    name: { type: String, trim: true, default: "" },
    gender: { type: String, default: "" },
    dob: { type: String, default: "" },
    age: { type: String, default: "" },
    qualification: { type: String, default: "" },
    regNumber: { type: String, default: "" },
    experience: { type: String, default: "" },
    department: { type: String, default: "" },
    designation: { type: String, default: "" },
    fee: { type: String, default: "" },
    mobile: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    altMobile: { type: String, default: "" },
    email: { type: String, default: "" },
    addressNo: { type: String, default: "" },
    street: { type: String, default: "" },
    nearBy: { type: String, default: "" },
    city: { type: String, default: "" },
    district: { type: String, default: "" },
    state: { type: String, default: "" },
    nationality: { type: String, default: "" },
    pincode: { type: String, default: "" },
    photoPath: { type: String, default: "" },
    signaturePath: { type: String, default: "" },
    photoData: { type: String, default: "" },
    signatureData: { type: String, default: "" },
    username: { type: String, default: "" },
    password: { type: String, default: "" },
  },
  { timestamps: true, collection: "human_resources" },
);

employeeSchema.index({ type: 1, id: 1 });

module.exports = mongoose.model("Employee", employeeSchema);
