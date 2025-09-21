const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendEmail({ to, subject, text, html }) {
  const from = process.env.FROM_EMAIL || "no-reply@bear.health";
  return transporter.sendMail({ from, to, subject, text, html });
}

async function sendOtpCode(to, code, purpose) {
  const subject = `BEAR - Mã xác thực (${purpose === "login" ? "Đăng nhập" : "Xác minh email"})`;
  const text = `Mã xác thực của bạn là: ${code}. Mã sẽ hết hạn sau 10 phút.`;
  const html = `<p>Mã xác thực của bạn là: <b>${code}</b></p><p>Mã sẽ hết hạn sau 10 phút.</p>`;
  return sendEmail({ to, subject, text, html });
}

module.exports = { sendEmail, sendOtpCode };

