const express = require("express");
const { sendBulkMessages } = require("../../controllers/whatsapp/campaign.controller");

const router = express.Router();
router.post("/campaign", sendBulkMessages);

module.exports = router;
