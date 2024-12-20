const express = require("express");
const { requestOTP } = require("../../controllers/whatsapp/otp.controller");

const router = express.Router();
router.post("/otp", requestOTP);

module.exports = router;
