const { sendCampaign } = require("../../services/whatsapp/campaign.service");

async function sendBulkMessages(req, res) {
  const { templateName, messageParams } = req.body;

  try {
    const response = await sendCampaign(templateName, messageParams);
    return res.json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = { sendBulkMessages };
