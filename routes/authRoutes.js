const express = require("express");
const { registerUser, loginUser, sendVerifyEmailOtp, verifyEmailWithOtp, sendLoginOtp, loginWithOtp } = require("../controllers/authController");
const router = express.Router();

// POST /api/auth/register
router.post("/register", registerUser);

// POST /api/auth/login (mật khẩu)
router.post("/login", loginUser);

// OTP xác minh email
router.post("/otp/send-verify", sendVerifyEmailOtp);
router.post("/otp/verify-email", verifyEmailWithOtp);

// OTP đăng nhập không mật khẩu
router.post("/otp/send-login", sendLoginOtp);
router.post("/otp/login", loginWithOtp);

module.exports = router;
