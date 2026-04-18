const MIN_JWT_SECRET_LENGTH = 32;
const MIN_ADMIN_PASSWORD_LENGTH = 12;

const hasUpper = (value) => /[A-Z]/.test(value);
const hasLower = (value) => /[a-z]/.test(value);
const hasDigit = (value) => /\d/.test(value);
const hasSymbol = (value) => /[^A-Za-z0-9]/.test(value);

const validateEnv = () => {
  const requiredVars = ["MONGODB_URI", "JWT_SECRET", "CORS_ORIGIN"];
  const missing = requiredVars.filter((key) => !String(process.env[key] || "").trim());

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  const jwtSecret = String(process.env.JWT_SECRET || "").trim();
  if (jwtSecret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(`JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters long`);
  }

  const adminUsername = String(process.env.ADMIN_USERNAME || "").trim();
  const adminPassword = String(process.env.ADMIN_PASSWORD || "").trim();

  if ((adminUsername && !adminPassword) || (!adminUsername && adminPassword)) {
    throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD must be set together");
  }

  if (adminPassword) {
    if (adminPassword.length < MIN_ADMIN_PASSWORD_LENGTH) {
      throw new Error(`ADMIN_PASSWORD must be at least ${MIN_ADMIN_PASSWORD_LENGTH} characters long`);
    }

    if (!hasUpper(adminPassword) || !hasLower(adminPassword) || !hasDigit(adminPassword) || !hasSymbol(adminPassword)) {
      throw new Error("ADMIN_PASSWORD must include uppercase, lowercase, number, and special character");
    }
  }
};

module.exports = {
  validateEnv,
};
