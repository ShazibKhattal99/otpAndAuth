const axios = require("axios");
const { generateRandomOTP } = require("../../utils/random.utils");
const OTP = require("../../models/whatsapp/otp.model");
require("dotenv").config();

async function sendOTP(phone, type) {
  if (!["signup", "forgot_password"].includes(type)) {
    throw new Error("Invalid OTP type. Allowed types are 'signup' or 'forgot_password'.");
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
    });
  }

  // Check and update attempts based on the type
  if (type === "signup") {
    if (otpRecord.createdAt >= oneDayAgo && otpRecord.signup_attempts >= process.env.OTP_MAX_ATTEMPTS) {
      throw new Error("Maximum signup OTP attempts reached for today.");
    }

    if (otpRecord.createdAt < oneDayAgo) {
      otpRecord.signup_attempts = 0; // Reset signup attempts if more than 24 hours
    }

    otpRecord.signup_attempts += 1; // Increment signup attempts
  } else if (type === "forgot_password") {
    if (otpRecord.createdAt >= oneDayAgo && otpRecord.forgot_password_attempts >= process.env.OTP_MAX_ATTEMPTS) {
      throw new Error("Maximum forgot password OTP attempts reached for today.");
    }

    if (otpRecord.createdAt < oneDayAgo) {
      otpRecord.forgot_password_attempts = 0; // Reset forgot_password attempts if more than 24 hours
    }

    otpRecord.forgot_password_attempts += 1; // Increment forgot_password attempts
  }

  // Generate a new OTP
  const otp = generateRandomOTP();
  console.log(`Generated OTP for ${type}:`, otp);

  // Update OTP record
  otpRecord.otp = otp;
  otpRecord.createdAt = now; // Update timestamp
  await otpRecord.save();

  // URL to send message via WhatsApp
  const url = `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_ID}/messages`;

  // Prepare the payload with OTP and button (unchanged)
  const payload = {
    messaging_product: "whatsapp",
    to: phone,
    type: "template",
    template: {
      name: "otp",
      language: { code: "en_US" },
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: otp,
            },
          ],
        },
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [
            {
              type: "text",
              text: otp,
            },
          ],
        },
      ],
    },
  };

  // Headers for WhatsApp API request
  const headers = { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` };

  // Send the OTP message with the button
  await axios.post(url, payload, { headers });

  return { phone, otp, type };
}

module.exports = { sendOTP };
