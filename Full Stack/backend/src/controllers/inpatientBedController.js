const asyncHandler = require("../utils/asyncHandler");
const BedBooking = require("../models/BedBooking");

const extractNumber = (value, prefix) => {
  if (typeof value !== "string" || !value.startsWith(prefix)) {
    return 0;
  }

  const parsed = Number.parseInt(value.slice(prefix.length), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const listBookings = asyncHandler(async (req, res) => {
  const bookings = await BedBooking.find().sort({ createdAt: -1 });
  res.json(bookings);
});

const getNextPatientId = asyncHandler(async (req, res) => {
  const lastBooking = await BedBooking.findOne().sort({ createdAt: -1 }).lean();
  const fromLast = extractNumber(lastBooking?.patientId, "PAT");
  const allBookings = await BedBooking.find({}, { patientId: 1 }).lean();
  const maxInCollection = allBookings.reduce((maxValue, item) => {
    return Math.max(maxValue, extractNumber(item.patientId, "PAT"));
  }, 100000);

  const next = Math.max(fromLast, maxInCollection, 100000) + 1;
  res.json({ nextPatientId: `PAT${next}` });
});

const createBooking = asyncHandler(async (req, res) => {
  const payload = req.body;

  const existingPatient = await BedBooking.findOne({ patientId: payload.patientId });
  if (existingPatient) {
    res.status(400);
    throw new Error("Patient ID already exists");
  }

  const roomConflict = await BedBooking.findOne({
    bedType: payload.bedType,
    roomNo: Number(payload.roomNo),
  });

  if (roomConflict) {
    res.status(400);
    throw new Error("Room already booked");
  }

  const booking = await BedBooking.create({
    ...payload,
    roomNo: Number(payload.roomNo),
    createdAtClient: payload.createdAt || "",
  });

  res.status(201).json(booking);
});

const updateBooking = asyncHandler(async (req, res) => {
  const patientId = req.params.patientId;
  const payload = req.body;

  const roomConflict = await BedBooking.findOne({
    patientId: { $ne: patientId },
    bedType: payload.bedType,
    roomNo: Number(payload.roomNo),
  });

  if (roomConflict) {
    res.status(400);
    throw new Error("Room already booked");
  }

  const updated = await BedBooking.findOneAndUpdate(
    { patientId },
    { ...payload, roomNo: Number(payload.roomNo) },
    { new: true, runValidators: true },
  );

  if (!updated) {
    res.status(404);
    throw new Error("Booking not found");
  }

  res.json(updated);
});

const deleteBooking = asyncHandler(async (req, res) => {
  const deleted = await BedBooking.findOneAndDelete({ patientId: req.params.patientId });

  if (!deleted) {
    res.status(404);
    throw new Error("Booking not found");
  }

  res.json({ message: "Booking deleted" });
});

module.exports = {
  listBookings,
  getNextPatientId,
  createBooking,
  updateBooking,
  deleteBooking,
};
