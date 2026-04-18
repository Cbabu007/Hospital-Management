const asyncHandler = require("../utils/asyncHandler");
const PatientFeedback = require("../models/PatientFeedback");

const listFeedback = asyncHandler(async (req, res) => {
  const feedback = await PatientFeedback.find().sort({ createdAt: -1 });
  res.json(feedback);
});

const createFeedback = asyncHandler(async (req, res) => {
  const payload = req.body;
  const feedback = await PatientFeedback.create(payload);
  res.status(201).json(feedback);
});

module.exports = {
  listFeedback,
  createFeedback,
};
