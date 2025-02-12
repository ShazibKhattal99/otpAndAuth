import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  otp: { type: String, required: false },  // Make this optional if you want it to be cleared
  createdAt: { type: Date, default: Date.now },
  signup_attempts: { type: Number, default: 0 },
  signin_attempts: { type: Number, default: 0 },
  forgot_password_attempts: { type: Number, default: 0 }
});

// Exporting the model directly
const OTP = mongoose.model('OTP', otpSchema);
export default OTP;
