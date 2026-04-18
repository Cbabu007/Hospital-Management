const Employee = require("../models/Employee");
const LoginUser = require("../models/LoginUser");
const { verifyAuthToken } = require("../utils/auth");
const {
  buildEmployeeUser,
  buildPortalUser,
  buildSystemAdminUser,
} = require("../utils/accessControl");

const extractBearerToken = (headerValue) => {
  const value = String(headerValue || "").trim();
  if (!value.startsWith("Bearer ")) {
    return "";
  }

  return value.slice(7).trim();
};

const requireAuth = async (req, res, next) => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    res.status(401).json({ message: "Authorization token is required" });
    return;
  }

  let payload;
  try {
    payload = verifyAuthToken(token);
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }

  if (payload.source === "system" || payload.sub === "system-admin") {
    req.user = buildSystemAdminUser(payload.username);
    next();
    return;
  }

  if (payload.source === "employee") {
    const employee = await Employee.findById(payload.sub);
    if (!employee) {
      res.status(401).json({ message: "User no longer exists" });
      return;
    }

    req.user = buildEmployeeUser(employee);
    next();
    return;
  }

  const user = await LoginUser.findById(payload.sub);
  if (!user) {
    res.status(401).json({ message: "User no longer exists" });
    return;
  }

  req.user = buildPortalUser(user);

  next();
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  if (!roles.includes(req.user.role)) {
    res.status(403).json({ message: "You are not allowed to access this resource" });
    return;
  }

  next();
};

const requirePermission = (...permissions) => (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const currentPermissions = Array.isArray(req.user.permissions) ? req.user.permissions : [];
  if (!permissions.some((permission) => currentPermissions.includes(permission))) {
    res.status(403).json({ message: "You are not allowed to access this resource" });
    return;
  }

  next();
};

module.exports = {
  requireAuth,
  requirePermission,
  requireRole,
};