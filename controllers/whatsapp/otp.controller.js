const { sendOTP } = require("../../services/whatsapp/otp.service");

async function requestOTP(req, res) {
  const { phone, type } = req.body;

  try {
    if (!phone) return res.status(400).json({ message: "Phone number is required." });
    const response = await sendOTP(phone,type);
    console.log(response)
    return res.json({ message: "OTP sent successfully.", data: response });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

module.exports = { requestOTP };
