const jwt = require("jsonwebtoken");

const AUTH_TOKEN_TTL = process.env.JWT_EXPIRES_IN || "7d";
const RESET_TOKEN_TTL = process.env.JWT_RESET_EXPIRES_IN || "10m";

const getJwtSecret = () => {
  const secret = String(process.env.JWT_SECRET || "").trim();
  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }

  return secret;
};

const signAuthToken = (user) => jwt.sign(
  {
    sub: String(user.id),
    role: user.role,
    username: user.username,
    source: user.authSource,
    type: "auth",
  },
  getJwtSecret(),
  { expiresIn: AUTH_TOKEN_TTL },
);

const signPasswordResetToken = (user) => jwt.sign(
  {
    sub: String(user.id),
    role: user.role,
    username: user.username,
    type: "password-reset",
  },
  getJwtSecret(),
  { expiresIn: RESET_TOKEN_TTL },
);

const verifyAuthToken = (token) => {
  const payload = jwt.verify(token, getJwtSecret());

  if (payload.type !== "auth") {
    throw new Error("Invalid token type");
  }

  return payload;
};

const verifyPasswordResetToken = (token) => {
  const payload = jwt.verify(token, getJwtSecret());

  if (payload.type !== "password-reset") {
    throw new Error("Invalid token type");
  }

  return payload;
};

module.exports = {
  signAuthToken,
  signPasswordResetToken,
  verifyAuthToken,
  verifyPasswordResetToken,
};