import express from "express";
import { requestOTP, verifyOTPHandler, signIn } from "../../controllers/whatsapp/otp.controller.js";
import authenticateToken from "../../middleware/authenticateToken.js"; // Middleware for token validation

const router = express.Router();

router.post("/send", requestOTP);
router.post("/verify", verifyOTPHandler);
// router.post("/signin", signIn);
// router.get("/protected", authenticateToken, async (req, res) => {
//   const { phone } = req.user;
//   res.status(200).json({ success: true, message: `Welcome, user with phone: ${phone}!` });
// });

export default router;
