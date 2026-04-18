const asyncHandler = require("../utils/asyncHandler");
const Appointment = require("../models/Appointment");

const listAppointments = asyncHandler(async (req, res) => {
  const list = await Appointment.find().sort({ createdAt: -1 });
  res.json(list);
});

const createAppointment = asyncHandler(async (req, res) => {
  const payload = req.body;
  const appointment = await Appointment.create({
    ...payload,
    created: payload.created || new Date().toISOString(),
  });

  res.status(201).json(appointment);
});

const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const status = String(req.body.status || "");
  const updated = await Appointment.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true },
  );

  if (!updated) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  res.json(updated);
});

module.exports = {
  listAppointments,
  createAppointment,
  updateAppointmentStatus,
};
