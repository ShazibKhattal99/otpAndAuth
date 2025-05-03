import jwt from "jsonwebtoken";
import { sendOTP, verifyOTP } from "../../services/whatsapp/otp.service.js";

const requestOTP = async (req, res) => {
  try {
    const { phone, type } = req.body; 
    const result = await sendOTP(phone, type);
    console.log("result", result);
    res
      .status(200)
      .json({ success: true, message: "OTP sent successfully!", data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const verifyOTPHandler = async (req, res) => {
  try {
    const { phone, otp, type } = req.body; 
    const result = await verifyOTP(phone, otp, type);
    console.log(result)
    const accessToken = jwt.sign(
      { phone },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );
    const refreshToken = jwt.sign(
      { phone, message: "Verify successful", accessToken },
      process.env.JWT_REFRESH_SECRET 
    );
    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      accessToken,
      refreshToken,
      data: result,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const signIn = async (req, res) => {
  const { phone, otp } = req.body;
  const type = "signin";
  try {
    const { success, message } = await verifyOTP(phone, otp, type);
    if (!success) {
      return res.status(400).json({ success: false, message });
    }
    const accessToken = jwt.sign(
      { phone },
      process.env.JWT_SECRET, 
      { expiresIn: "10m" }
    );
    const refreshToken = jwt.sign(
      { phone },
      process.env.JWT_REFRESH_SECRET
    );
    res.status(200).json({
      success: true,
      message: "Sign-in successful",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Error signing in:", error);
    res
      .status(500)
      .json({ success: false, message: "An error occurred during sign-in" });
  }
};

export { requestOTP, verifyOTPHandler, signIn };
