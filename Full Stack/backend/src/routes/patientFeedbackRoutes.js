const express = require("express");
const {
  listFeedback,
  createFeedback,
} = require("../controllers/patientFeedbackController");
const { requireAuth, requirePermission } = require("../middleware/authMiddleware");
const { PERMISSIONS } = require("../utils/accessControl");

const router = express.Router();

router.route("/")
  .get(requireAuth, requirePermission(PERMISSIONS.PATIENT_FEEDBACK), listFeedback)
  .post(requireAuth, createFeedback);

module.exports = router;
