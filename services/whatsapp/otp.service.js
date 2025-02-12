import axios from 'axios';import { generateRandomOTP } from '../../utils/random.utils.js';
import OTP from '../../models/whatsapp/otp.model.js';

import dotenv from 'dotenv';

dotenv.config();

const validateOtpType = (type) => {
  if (!['signup', 'forgot_password', 'signin'].includes(type)) {
    throw new Error("Invalid OTP type. Allowed types are 'signup', 'forgot_password', or 'signin'.");
  }
};

const sendOTP = async (phone, type) => {
  if (!['signin', 'signup', 'forgot_password'].includes(type)) {
    throw new Error("Invalid OTP type. Allowed types are 'signin', 'signup', or 'forgot_password'.");
  }
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
  // Fetch OTP record for the phone number
  let otpRecord = await OTP.findOne({ phone });
  if (!otpRecord) {
    // If no record exists, create a new one with zero attempts
    otpRecord = new OTP({
      phone,
      signup_attempts: 0,
      forgot_password_attempts: 0,
      signin_attempts: 0, // Ensure this field exists for signin attempts
    });
  }

  if (type === 'signup') {
    if (otpRecord.createdAt >= oneDayAgo && otpRecord.signup_attempts >= process.env.OTP_MAX_ATTEMPTS) {
      throw new Error("Maximum signup OTP attempts reached for today.");
    }
    if (otpRecord.createdAt < oneDayAgo) {
      otpRecord.signup_attempts = 0; // Reset signup attempts if more than 24 hours
    }
    otpRecord.signup_attempts += 1; // Increment signup attempts
  } else if (type === 'forgot_password') {
    if (otpRecord.createdAt >= oneDayAgo && otpRecord.forgot_password_attempts >= process.env.OTP_MAX_ATTEMPTS) {
      throw new Error("Maximum forgot password OTP attempts reached for today.");
    }
    if (otpRecord.createdAt < oneDayAgo) {
      otpRecord.forgot_password_attempts = 0; // Reset forgot_password attempts if more than 24 hours
    }
    otpRecord.forgot_password_attempts += 1; // Increment forgot_password attempts
  } else if (type === 'signin') {
    if (otpRecord.createdAt < oneDayAgo) {
      otpRecord.signin_attempts = 0;
    }
  }
  const otp = generateRandomOTP();
  console.log(`Generated OTP for ${type}:`, otp);
  otpRecord.otp = otp;
  otpRecord.createdAt = now;
  try {
    const url = `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_ID}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'template',
      template: {
        name: 'otp',
        language: { code: 'en_US' },
        components: [
          {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: otp,
              },
            ],
          },
          {
            type: 'button',
            sub_type: 'url',
            index: '0',
            parameters: [
              {
                type: 'text',
                text: otp,
              },
            ],
          },
        ],
      },
    };
    const headers = { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` };
    await axios.post(url, payload, { headers });
    if (type === 'signup') otpRecord.signup_attempts += 1;
    else if (type === 'forgot_password') otpRecord.forgot_password_attempts += 1;
    else if (type === 'signin') otpRecord.signin_attempts += 0;
    await otpRecord.save();
  } catch (error) {
    throw new Error(`Failed to send OTP: ${error.message}`);
  }
  return { phone, otp, type };
};

const verifyOTP = async (phone, otp, type) => {
  validateOtpType(type);
  const otpRecord = await OTP.findOne({ phone });
  if (!otpRecord) throw new Error('No OTP found for this phone number.');
  const now = new Date();
  const otpExpirationTime = new Date(otpRecord.createdAt.getTime() + process.env.OTP_EXPIRATION_TIME * 1000);
  if (now > otpExpirationTime) {
    throw new Error('OTP has expired. Please request a new one.');
  }
  if (otpRecord.otp !== otp) {
    throw new Error('Invalid OTP. Please check and try again.');
  }
  if (type === 'signup') {
    otpRecord.signup_attempts = 0; // Reset signup attempts on successful verification
  } else if (type === 'forgot_password') {
    otpRecord.forgot_password_attempts = 0; // Reset forgot password attempts
  }
  otpRecord.otp = null; 
  await otpRecord.save();

  console.log(`OTP verified successfully for ${phone}`);
  return { success: true, message: 'OTP verified successfully!' };
};

export { sendOTP, verifyOTP };
