import axios from 'axios';
import { generateRandomOTP } from '../../utils/random.utils.js';
import OTP from '../../models/whatsapp/otp.model.js';
import dotenv from 'dotenv';

dotenv.config();

const validateOtpType = (type) => {
  if (!['signup', 'forgot_password', 'signin'].includes(type)) {
    throw new Error("Invalid OTP type. Allowed types are 'signup', 'forgot_password', or 'signin'.");
  }
};

const sendOTP = async (phone, type) => {
  validateOtpType(type);

  let otpRecord = await OTP.findOne({ phone });

  if (!otpRecord) {
    otpRecord = new OTP({ phone });
  }

  const otp = generateRandomOTP();
  console.log(`Generated OTP for ${type}:`, otp);

  otpRecord.otp = otp;
  otpRecord.createdAt = new Date();

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
            parameters: [{ type: 'text', text: otp }],
          },
          {
            type: 'button',
            sub_type: 'url',
            index: '0',
            parameters: [{ type: 'text', text: otp }],
          },
        ],
      },
    };

    const headers = { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` };
    await axios.post(url, payload, { headers });

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
  const otpExpirationTime = new Date(
    otpRecord.createdAt.getTime() + process.env.OTP_EXPIRATION_TIME * 1000
  );

  if (now > otpExpirationTime) {
    throw new Error('OTP has expired. Please request a new one.');
  }

  if (otpRecord.otp !== otp) {
    throw new Error('Invalid OTP. Please check and try again.');
  }

  otpRecord.otp = null; // Clear OTP after verification
  await otpRecord.save();

  console.log(`OTP verified successfully for ${phone}`);
  return { success: true, message: 'OTP verified successfully!' };
};

export { sendOTP, verifyOTP };
