const asyncHandler = require("../utils/asyncHandler");
const Employee = require("../models/Employee");

const listPublicDoctors = asyncHandler(async (req, res) => {
  const doctors = await Employee.find({ type: "Doctor" })
    .select("id type name qualification department experience photoData photoPath username")
    .sort({ createdAt: -1 });

  res.json(doctors);
});

const listEmployees = asyncHandler(async (req, res) => {
  const employees = await Employee.find().sort({ createdAt: -1 });
  res.json(employees);
});

const createEmployee = asyncHandler(async (req, res) => {
  const payload = req.body;

  const existing = await Employee.findOne({ id: payload.id });
  if (existing) {
    res.status(400);
    throw new Error("Employee ID already exists");
  }

  // Handle file uploads
  let photoPath = "";
  let signaturePath = "";
  if (req.files) {
    if (req.files.photo && req.files.photo[0]) {
      photoPath = req.files.photo[0].path.replace(/\\/g, "/");
    }
    if (req.files.sign && req.files.sign[0]) {
      signaturePath = req.files.sign[0].path.replace(/\\/g, "/");
    }
  }

  const employee = await Employee.create({
    ...payload,
    photoPath,
    signaturePath,
  });
  res.status(201).json(employee);
});

const updateEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await Employee.findOneAndUpdate({ id }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    res.status(404);
    throw new Error("Employee not found");
  }

  res.json(updated);
});

const deleteEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await Employee.findOneAndDelete({ id });

  if (!deleted) {
    res.status(404);
    throw new Error("Employee not found");
  }

  res.json({ message: "Employee deleted" });
});

module.exports = {
  listEmployees,
  listPublicDoctors,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
