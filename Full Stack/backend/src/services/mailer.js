const nodemailer = require("nodemailer");

const createTransporter = () => {
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_APP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
};

const transporter = createTransporter();

const sendMail = async ({ to, subject, text }) => {
  if (!transporter) {
    throw new Error("Mail service not configured. Set MAIL_USER and MAIL_APP_PASSWORD in backend .env");
  }

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to,
    subject,
    text,
  });
};

module.exports = {
  sendMail,
};
