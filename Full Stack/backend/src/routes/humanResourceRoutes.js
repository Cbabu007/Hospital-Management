const express = require("express");
const {
  listPublicDoctors,
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/humanResourceController");
const upload = require("../middleware/multerImage");
const { requireAuth, requirePermission } = require("../middleware/authMiddleware");
const { PERMISSIONS } = require("../utils/accessControl");

const router = express.Router();

router.get("/public-doctors", listPublicDoctors);
router.route("/")
  .get(requireAuth, requirePermission(PERMISSIONS.HUMAN_RESOURCES), listEmployees)
  .post(
    requireAuth,
    requirePermission(PERMISSIONS.HUMAN_RESOURCES),
    upload.fields([
      { name: "photo", maxCount: 1 },
      { name: "sign", maxCount: 1 },
    ]),
    createEmployee
  );
router.route("/:id")
  .put(requireAuth, requirePermission(PERMISSIONS.HUMAN_RESOURCES), updateEmployee)
  .delete(requireAuth, requirePermission(PERMISSIONS.HUMAN_RESOURCES), deleteEmployee);

module.exports = router;
