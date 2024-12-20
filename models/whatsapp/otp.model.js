const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true }, // Ensure each phone number is unique
  otp: { type: String, required: true },
  signup_attempts: { type: Number, default: 0 }, // Separate attempts for signup
  forgot_password_attempts: { type: Number, default: 0 }, // Separate attempts for forgot_password
  createdAt: { type: Date, default: Date.now },
});

const OTP = mongoose.model("OTP", otpSchema);

module.exports = OTP;
