const bcrypt = require("bcryptjs");
const asyncHandler = require("../utils/asyncHandler");
const Employee = require("../models/Employee");
const LoginUser = require("../models/LoginUser");
const { sendMail } = require("../services/mailer");
const { createOtp, verifyOtp, checkOtp } = require("../state/otpStore");
const { logSecurityEvent } = require("../utils/auditLogger");
const {
  signAuthToken,
  signPasswordResetToken,
  verifyPasswordResetToken,
} = require("../utils/auth");
const {
  buildEmployeeUser,
  buildPortalUser,
  buildSystemAdminUser,
} = require("../utils/accessControl");

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10}$/;
const BCRYPT_PREFIX = "$2";
const ADMIN_USERNAME = String(process.env.ADMIN_USERNAME || "").trim();
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || "").trim();
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const hasAdminCredentials = Boolean(ADMIN_USERNAME && ADMIN_PASSWORD);

const escapeRegex = (value) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findUserByEmail = (email) => LoginUser.findOne({
  email: { $regex: `^${escapeRegex(email)}$`, $options: "i" },
});

const validatePasswordOrThrow = (password, res) => {
  if (!PASSWORD_PATTERN.test(String(password || ""))) {
    res.status(400);
    throw new Error("Password must contain 1 uppercase, 1 lowercase, 1 number, 1 special character and be exactly 10 characters");
  }
};

const buildAuthResponse = (user) => ({
  success: true,
  token: signAuthToken(user),
  user,
});

const getClientIp = (req) => req.ip || req.headers["x-forwarded-for"] || "unknown";

const verifySignupOtp = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const otp = String(req.body.otp || "").trim();

  if (!email || !otp) {
    res.status(400);
    throw new Error("Email and OTP are required");
  }

  const result = await checkOtp(email, "signup", otp);
  if (!result.ok) {
    logSecurityEvent("signup.otp.verify.failed", { email, ip: getClientIp(req), reason: result.reason });
    res.status(400);
    throw new Error(result.reason === "OTP not found" ? "Please request an OTP first" : result.reason);
  }

  logSecurityEvent("signup.otp.verify.success", { email, ip: getClientIp(req) });

  res.json({ success: true, message: "Email verified successfully" });
});

const sendSignupOtp = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  const emailExists = await findUserByEmail(email);
  if (emailExists) {
    res.status(400);
    throw new Error("Email already registered");
  }

  const otp = await createOtp(email, "signup");
  const subject = "Hospital Sign Up - Email Verification OTP";
  const text = [
    "Hello,",
    "",
    `Your email verification OTP for sign up is: ${otp}`,
    "This OTP is valid for 5 minutes.",
    "",
    "If you did not request this, please ignore this email.",
  ].join("\n");

  await sendMail({ to: email, subject, text });

  logSecurityEvent("signup.otp.sent", { email, ip: getClientIp(req) });

  res.json({ success: true, message: "OTP sent to your email" });
});

const register = asyncHandler(async (req, res) => {
  validatePasswordOrThrow(req.body.password, res);

  const email = String(req.body.email || "").trim().toLowerCase();
  const otp = String(req.body.otp || "").trim();

  if (!otp) {
    res.status(400);
    throw new Error("Email OTP verification is required");
  }

  const verification = await verifyOtp(email, "signup", otp);
  if (!verification.ok) {
    logSecurityEvent("signup.register.blocked", { email, ip: getClientIp(req), reason: verification.reason });
    res.status(400);
    throw new Error(
      verification.reason === "OTP not found"
        ? "Please verify your email first"
        : verification.reason
    );
  }

  const prepared = {
    name: String(req.body.name || "").trim(),
    mobile: String(req.body.mobile || "").trim(),
    email,
    username: String(req.body.username || "").trim(),
    password: await bcrypt.hash(String(req.body.password || ""), 10),
    role: "user",
  };

  const exists = await LoginUser.findOne({ username: prepared.username });
  if (exists) {
    res.status(400);
    throw new Error("Username already exists");
  }

  const emailExists = await findUserByEmail(prepared.email);
  if (emailExists) {
    res.status(400);
    throw new Error("Email already exists");
  }

  const user = await LoginUser.create(prepared);
  logSecurityEvent("signup.register.success", { email, username: prepared.username, ip: getClientIp(req) });
  res.status(201).json({ success: true, user: buildPortalUser(user) });
});

const login = asyncHandler(async (req, res) => {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");

  if (hasAdminCredentials && username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    logSecurityEvent("auth.login.success", { username, role: "admin", ip: getClientIp(req) });
    res.json(buildAuthResponse(buildSystemAdminUser(ADMIN_USERNAME)));
    return;
  }

  const employee = await Employee.findOne({ username });
  if (employee?.username) {
    let employeePasswordMatches = false;

    if (String(employee.password || "").startsWith(BCRYPT_PREFIX)) {
      employeePasswordMatches = await bcrypt.compare(password, employee.password);
    } else {
      employeePasswordMatches = password === employee.password;

      if (employeePasswordMatches) {
        employee.password = await bcrypt.hash(password, 10);
        await employee.save();
      }
    }

    if (!employeePasswordMatches) {
      logSecurityEvent("auth.login.failed", { username, source: "employee", ip: getClientIp(req) });
      res.status(401);
      throw new Error("Invalid username or password");
    }

    const staffUser = buildEmployeeUser(employee);
    if (!staffUser.permissions.length) {
      logSecurityEvent("auth.login.denied", { username, source: "employee", reason: "no_permissions", ip: getClientIp(req) });
      res.status(403);
      throw new Error("This designation has no portal access configured");
    }

    logSecurityEvent("auth.login.success", { username, role: "staff", ip: getClientIp(req) });
    res.json(buildAuthResponse(staffUser));
    return;
  }

  const user = await LoginUser.findOne({ username });
  if (!user) {
    logSecurityEvent("auth.login.failed", { username, source: "login-user", ip: getClientIp(req) });
    res.status(401);
    throw new Error("Invalid username or password");
  }

  let passwordMatches = false;
  if (String(user.password || "").startsWith(BCRYPT_PREFIX)) {
    passwordMatches = await bcrypt.compare(password, user.password);
  } else {
    passwordMatches = password === user.password;

    if (passwordMatches) {
      user.password = await bcrypt.hash(password, 10);
      await user.save();
    }
  }

  if (!passwordMatches) {
    logSecurityEvent("auth.login.failed", { username, source: "login-user", ip: getClientIp(req) });
    res.status(401);
    throw new Error("Invalid username or password");
  }

  logSecurityEvent("auth.login.success", { username, role: "user", ip: getClientIp(req) });
  res.json(buildAuthResponse(buildPortalUser(user)));
});

const validateForgotType = (type) => type === "username" || type === "password";

const requestForgotOtp = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const type = String(req.body.type || "").trim().toLowerCase();

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  if (!validateForgotType(type)) {
    res.status(400);
    throw new Error("Invalid forgot type");
  }

  const user = await findUserByEmail(email);
  if (!user) {
    res.json({
      success: true,
      message: "If the account exists, an OTP has been sent to your email",
    });
    return;
  }

  const otp = await createOtp(email, type);
  const subject = "Hospital Login Verification OTP";
  const text = [
    `Hello ${user.name || "User"},`,
    "",
    `Your OTP for forgot ${type} verification is: ${otp}`,
    "This OTP is valid for 5 minutes.",
    "",
    "If you did not request this, please ignore this email.",
  ].join("\n");

  await sendMail({ to: email, subject, text });

  logSecurityEvent("forgot.otp.sent", { email, type, ip: getClientIp(req) });

  res.json({
    success: true,
    message: "If the account exists, an OTP has been sent to your email",
  });
});

const verifyForgotOtp = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const type = String(req.body.type || "").trim().toLowerCase();
  const otp = String(req.body.otp || "").trim();

  if (!email || !otp) {
    res.status(400);
    throw new Error("Email and OTP are required");
  }

  if (!validateForgotType(type)) {
    res.status(400);
    throw new Error("Invalid forgot type");
  }

  const verification = await verifyOtp(email, type, otp);
  if (!verification.ok) {
    logSecurityEvent("forgot.otp.verify.failed", { email, type, ip: getClientIp(req), reason: verification.reason });
    res.status(400);
    throw new Error(verification.reason);
  }

  logSecurityEvent("forgot.otp.verify.success", { email, type, ip: getClientIp(req) });

  const user = await findUserByEmail(email);
  if (!user) {
    res.status(400);
    throw new Error("Invalid OTP or request");
  }

  if (type === "password") {
    res.json({
      success: true,
      message: "OTP verified. You can now reset your password.",
      resetToken: signPasswordResetToken(buildPortalUser(user)),
    });
    return;
  }

  const subject = "Hospital Login Recovery Details";
  const detailText = `Your Username is: ${user.username}`;

  const text = [
    `Hello ${user.name || "User"},`,
    "",
    "Your verification is successful.",
    detailText,
    "",
    "Please keep your credentials safe.",
    "- Hospital Login Management",
  ].join("\n");

  await sendMail({ to: email, subject, text });

  res.json({
    success: true,
    message: `Verification successful. Your ${type} has been sent to your email.`,
  });
});

const resetForgotPassword = asyncHandler(async (req, res) => {
  const resetToken = String(req.body.resetToken || "").trim();
  const newPassword = String(req.body.newPassword || "");

  if (!resetToken) {
    res.status(400);
    throw new Error("Reset token is required");
  }

  validatePasswordOrThrow(newPassword, res);

  let payload;
  try {
    payload = verifyPasswordResetToken(resetToken);
  } catch {
    res.status(401);
    throw new Error("Invalid or expired reset token");
  }

  const user = await LoginUser.findById(payload.sub);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ success: true, message: "Password reset successful. Please log in with your new password." });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

const listUsers = asyncHandler(async (req, res) => {
  const users = await LoginUser.find().sort({ createdAt: -1 });
  res.json(users.map(buildPortalUser));
});

const updateUser = asyncHandler(async (req, res) => {
  const payload = {};
  const allowedFields = ["name", "mobile", "email", "username", "password"];

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      payload[field] = req.body[field];
    }
  });

  if (typeof payload.name === "string") {
    payload.name = payload.name.trim();
  }

  if (typeof payload.mobile === "string") {
    payload.mobile = payload.mobile.trim();
  }

  if (typeof payload.email === "string") {
    payload.email = payload.email.trim().toLowerCase();
  }

  if (typeof payload.username === "string") {
    payload.username = payload.username.trim();
  }

  if (Object.prototype.hasOwnProperty.call(payload, "password")) {
    validatePasswordOrThrow(payload.password, res);
    payload.password = await bcrypt.hash(String(payload.password), 10);
  }

  const updated = await LoginUser.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(buildPortalUser(updated));
});

const deleteUser = asyncHandler(async (req, res) => {
  const deleted = await LoginUser.findByIdAndDelete(req.params.id);

  if (!deleted) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({ message: "User deleted" });
});

const findEmployeeByEmail = (email) => Employee.findOne({
  email: { $regex: `^${escapeRegex(email)}$`, $options: "i" },
});

const sendEmailLoginOtp = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  let recipientName = "User";

  if (ADMIN_EMAIL && ADMIN_USERNAME && email === ADMIN_EMAIL) {
    recipientName = "Administrator";
  } else {
    const employee = await findEmployeeByEmail(email);
    if (employee) {
      recipientName = employee.name || "Staff";
    } else {
      const loginUser = await findUserByEmail(email);
      if (!loginUser) {
        res.status(404).json({
          success: false,
          message: "You are a new user, please sign up",
        });
        return;
      }
      recipientName = loginUser.name || "User";
    }
  }

  const otp = await createOtp(email, "email-login");
  const subject = "Hospital Portal - Email Login OTP";
  const text = [
    `Hello ${recipientName},`,
    "",
    `Your OTP for email login is: ${otp}`,
    "This OTP is valid for 5 minutes.",
    "",
    "If you did not request this, please ignore this email.",
  ].join("\n");

  await sendMail({ to: email, subject, text });

  logSecurityEvent("email-login.otp.sent", { email, ip: getClientIp(req) });

  res.json({ success: true, message: "If the account exists, an OTP has been sent to your email" });
});

const verifyEmailLoginOtp = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const otp = String(req.body.otp || "").trim();

  if (!email || !otp) {
    res.status(400);
    throw new Error("Email and OTP are required");
  }

  const verification = await verifyOtp(email, "email-login", otp);
  if (!verification.ok) {
    logSecurityEvent("email-login.otp.verify.failed", { email, ip: getClientIp(req), reason: verification.reason });
    res.status(400);
    throw new Error(
      verification.reason === "OTP not found"
        ? "Please request an OTP first"
        : verification.reason
    );
  }

  if (ADMIN_EMAIL && ADMIN_USERNAME && email === ADMIN_EMAIL) {
    logSecurityEvent("email-login.success", { email, role: "admin", ip: getClientIp(req) });
    res.json(buildAuthResponse(buildSystemAdminUser(ADMIN_USERNAME)));
    return;
  }

  // Check LoginUser collection first — if role is "user", use portal logic
  const loginUser = await findUserByEmail(email);
  if (loginUser && loginUser.role === "user") {
    logSecurityEvent("email-login.success", { email, role: "user", ip: getClientIp(req) });
    res.json(buildAuthResponse(buildPortalUser(loginUser)));
    return;
  }

  const employee = await findEmployeeByEmail(email);
  if (employee) {
    const staffUser = buildEmployeeUser(employee);
    if (!staffUser.permissions.length) {
      logSecurityEvent("email-login.denied", { email, source: "employee", reason: "no_permissions", ip: getClientIp(req) });
      res.status(403);
      throw new Error("This designation has no portal access configured");
    }
    logSecurityEvent("email-login.success", { email, role: "staff", ip: getClientIp(req) });
    res.json(buildAuthResponse(staffUser));
    return;
  }

  // Fallback: any remaining LoginUser (e.g. role != "user")
  if (loginUser) {
    logSecurityEvent("email-login.success", { email, role: "user", ip: getClientIp(req) });
    res.json(buildAuthResponse(buildPortalUser(loginUser)));
    return;
  }

  res.status(400);
  throw new Error("Invalid OTP or account");
});

module.exports = {
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
};
