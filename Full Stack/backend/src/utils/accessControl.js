const PERMISSIONS = {
  HUMAN_RESOURCES: "human-resources",
  LOGIN_MANAGEMENT: "login-management",
  INPATIENT_BED_MANAGEMENT: "inpatient-bed-management",
  PATIENT_FEEDBACK: "patient-feedback",
  APPOINTMENT: "appointment",
};

const ALL_ADMIN_PERMISSIONS = Object.values(PERMISSIONS);

const DESIGNATION_PERMISSION_MAP = {
  "hospital administrator": [PERMISSIONS.HUMAN_RESOURCES],
  receptionist: [
    PERMISSIONS.INPATIENT_BED_MANAGEMENT,
    PERMISSIONS.PATIENT_FEEDBACK,
    PERMISSIONS.APPOINTMENT,
  ],
  "senior nurse": [
    PERMISSIONS.INPATIENT_BED_MANAGEMENT,
    PERMISSIONS.PATIENT_FEEDBACK,
    PERMISSIONS.APPOINTMENT,
  ],
};

const PERMISSION_HOME_PATH = {
  [PERMISSIONS.HUMAN_RESOURCES]: "/admin/human-resources",
  [PERMISSIONS.LOGIN_MANAGEMENT]: "/admin/login-management",
  [PERMISSIONS.INPATIENT_BED_MANAGEMENT]: "/admin/inpatient-bed-management",
  [PERMISSIONS.PATIENT_FEEDBACK]: "/admin/patient-feedback",
  [PERMISSIONS.APPOINTMENT]: "/admin/appointment",
};

const normalizeDesignationKey = (designation) => String(designation || "")
  .trim()
  .toLowerCase()
  .replace(/\s+/g, " ");

const getPermissionsForDesignation = (designation) => {
  const key = normalizeDesignationKey(designation);
  return DESIGNATION_PERMISSION_MAP[key] || [];
};

const getHomePathForPermissions = (permissions, fallback = "/admin") => {
  for (const permission of permissions || []) {
    if (PERMISSION_HOME_PATH[permission]) {
      return PERMISSION_HOME_PATH[permission];
    }
  }

  return fallback;
};

const buildSystemAdminUser = (username) => ({
  id: "system-admin",
  name: "Administrator",
  mobile: "",
  email: "",
  username,
  role: "admin",
  designation: "System Administrator",
  permissions: ALL_ADMIN_PERMISSIONS,
  homePath: "/admin/login-management",
  authSource: "system",
});

const buildPortalUser = (userDoc) => ({
  id: userDoc._id,
  name: userDoc.name,
  mobile: userDoc.mobile,
  email: userDoc.email,
  username: userDoc.username,
  role: "user",
  designation: "",
  permissions: [],
  homePath: "/user",
  authSource: "login-user",
  createdAt: userDoc.createdAt,
  updatedAt: userDoc.updatedAt,
});

const buildEmployeeUser = (employeeDoc) => {
  const permissions = getPermissionsForDesignation(employeeDoc.designation);

  return {
    id: employeeDoc._id,
    employeeId: employeeDoc.id,
    name: employeeDoc.name,
    mobile: employeeDoc.mobile,
    email: employeeDoc.email,
    username: employeeDoc.username,
    role: "staff",
    designation: employeeDoc.designation,
    permissions,
    homePath: getHomePathForPermissions(permissions),
    authSource: "employee",
    createdAt: employeeDoc.createdAt,
    updatedAt: employeeDoc.updatedAt,
  };
};

module.exports = {
  ALL_ADMIN_PERMISSIONS,
  PERMISSIONS,
  buildEmployeeUser,
  buildPortalUser,
  buildSystemAdminUser,
  getHomePathForPermissions,
  getPermissionsForDesignation,
};