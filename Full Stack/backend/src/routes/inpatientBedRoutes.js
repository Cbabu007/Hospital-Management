const express = require("express");
const {
  listBookings,
  getNextPatientId,
  createBooking,
  updateBooking,
  deleteBooking,
} = require("../controllers/inpatientBedController");
const { requireAuth, requirePermission } = require("../middleware/authMiddleware");
const { PERMISSIONS } = require("../utils/accessControl");

const router = express.Router();

router.get("/next-patient-id", requireAuth, requirePermission(PERMISSIONS.INPATIENT_BED_MANAGEMENT), getNextPatientId);
router.route("/")
  .get(requireAuth, requirePermission(PERMISSIONS.INPATIENT_BED_MANAGEMENT), listBookings)
  .post(requireAuth, requirePermission(PERMISSIONS.INPATIENT_BED_MANAGEMENT), createBooking);
router.route("/:patientId")
  .put(requireAuth, requirePermission(PERMISSIONS.INPATIENT_BED_MANAGEMENT), updateBooking)
  .delete(requireAuth, requirePermission(PERMISSIONS.INPATIENT_BED_MANAGEMENT), deleteBooking);

module.exports = router;
