const express = require("express");
const {
  listAppointments,
  createAppointment,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");
const { requireAuth, requirePermission } = require("../middleware/authMiddleware");
const { PERMISSIONS } = require("../utils/accessControl");

const router = express.Router();

router.route("/")
  .get(requireAuth, requirePermission(PERMISSIONS.APPOINTMENT), listAppointments)
  .post(requireAuth, createAppointment);
router.patch("/:id/status", requireAuth, requirePermission(PERMISSIONS.APPOINTMENT), updateAppointmentStatus);

module.exports = router;
