const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  sendSignupOtp,
  verifySignupOtp,
  register,
  login,
  getCurrentUser,
  requestForgotOtp,
  verifyForgotOtp,
  resetForgotPassword,
  sendEmailLoginOtp,
  verifyEmailLoginOtp,
  listUsers,
  updateUser,
  deleteUser,
} = require("../controllers/authController");
const { requireAuth, requirePermission } = require("../middleware/authMiddleware");
const { PERMISSIONS } = require("../utils/accessControl");

const router = express.Router();

const authWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many OTP attempts. Please try again later." },
});

router.post("/signup/send-otp", authWriteLimiter, sendSignupOtp);
router.post("/signup/verify-otp", otpVerifyLimiter, verifySignupOtp);
router.post("/register", authWriteLimiter, register);
router.post("/login", authWriteLimiter, login);
router.get("/me", requireAuth, getCurrentUser);
router.post("/forgot/request-otp", authWriteLimiter, requestForgotOtp);
router.post("/forgot/verify-otp", otpVerifyLimiter, verifyForgotOtp);
router.post("/forgot/reset-password", authWriteLimiter, resetForgotPassword);
router.post("/email-login/send-otp", authWriteLimiter, sendEmailLoginOtp);
router.post("/email-login/verify-otp", otpVerifyLimiter, verifyEmailLoginOtp);
router.get("/users", requireAuth, requirePermission(PERMISSIONS.LOGIN_MANAGEMENT), listUsers);
router.put("/users/:id", requireAuth, requirePermission(PERMISSIONS.LOGIN_MANAGEMENT), updateUser);
router.delete("/users/:id", requireAuth, requirePermission(PERMISSIONS.LOGIN_MANAGEMENT), deleteUser);

module.exports = router;
