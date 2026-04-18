const safeJson = (value) => {
  try {
    return JSON.stringify(value);
  } catch {
    return "{\"message\":\"Unable to serialize audit event\"}";
  }
};

const logSecurityEvent = (event, details = {}) => {
  const payload = {
    level: "info",
    category: "security",
    event,
    timestamp: new Date().toISOString(),
    ...details,
  };

  // Centralized structured log line for SIEM/log aggregation tooling.
  // eslint-disable-next-line no-console
  console.log(safeJson(payload));
};

module.exports = {
  logSecurityEvent,
};
