require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const { validateEnv } = require("./config/env");

const PORT = process.env.PORT || 5000;

const start = async () => {
  validateEnv();
  await connectDB();

  app.listen(PORT, '0.0.0.0', () => {
    // eslint-disable-next-line no-console
    console.log(`Backend running on http://0.0.0.0:${PORT} (LAN accessible)`);
  });
};

start();
