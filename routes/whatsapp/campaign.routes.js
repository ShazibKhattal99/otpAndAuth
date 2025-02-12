import express from "express";
import { sendBulkMessages } from "../../controllers/whatsapp/campaign.controller.js";

const router = express.Router();
router.post("/campaign", sendBulkMessages);

module.exports = router;
