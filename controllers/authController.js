const User = require("../models/User");
const OtpCode = require("../models/OtpCode");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendOtpCode } = require("../utils/email");

// Đăng ký user
const registerUser = async (req, res) => {
  try {
    console.log("[REGISTER] body:", req.body);
    const { username, email, password } = req.body;

    // Kiểm tra dữ liệu
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    // Kiểm tra user đã tồn tại chưa
    const existUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Tạo user mới
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashed });
    await user.save();

    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Đăng nhập user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra user tồn tại
    const user = await User.findOne({ email });
    const ok = user && (await bcrypt.compare(password, user.password));
    if (!ok) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // tạo JWT cho app
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(200).json({ message: "Login successful", user, token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Gửi OTP xác minh email
const sendVerifyEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email not found" });
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await OtpCode.create({ email, code, purpose: "verify_email", expiresAt });
    await sendOtpCode(email, code, "verify_email");
    res.json({ message: "OTP sent" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Xác minh OTP email
const verifyEmailWithOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    const otp = await OtpCode.findOne({ email, purpose: "verify_email" }).sort({ createdAt: -1 });
    if (!otp || otp.expiresAt < new Date() || otp.code !== code) {
      return res.status(400).json({ message: "Invalid/expired OTP" });
    }
    otp.consumedAt = new Date();
    await otp.save();
    await User.updateOne({ email }, { $set: { isEmailVerified: true } });
    res.json({ message: "Email verified" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Gửi OTP đăng nhập không mật khẩu (tùy chọn)
const sendLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email not found" });
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await OtpCode.create({ email, code, purpose: "login", expiresAt });
    await sendOtpCode(email, code, "login");
    res.json({ message: "OTP sent" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Xác thực OTP đăng nhập -> cấp JWT
const loginWithOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    const otp = await OtpCode.findOne({ email, purpose: "login" }).sort({ createdAt: -1 });
    const user = await User.findOne({ email });
    if (!user || !otp || otp.expiresAt < new Date() || otp.code !== code) {
      return res.status(400).json({ message: "Invalid/expired OTP" });
    }
    otp.consumedAt = new Date();
    await otp.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ message: "Login successful", user, token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { registerUser, loginUser, sendVerifyEmailOtp, verifyEmailWithOtp, sendLoginOtp, loginWithOtp };
