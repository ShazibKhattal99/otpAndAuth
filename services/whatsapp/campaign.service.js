const axios = require("axios");
const Contact = require("../../models/whatsapp/contact.model");
require("dotenv").config();

async function sendCampaign(templateName, messageParams) {
  const contacts = await Contact.find();

  const url = `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_ID}/messages`;
  const headers = { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` };

  const sendPromises = contacts.map((contact) => {
    const payload = {
      messaging_product: "whatsapp",
      to: contact.phone,
      type: "template",
      template: {
        name: templateName,
        language: { code: "en_US" },
        components: [
          { type: "body", parameters: messageParams.map((text) => ({ type: "text", text })) },
        ],
      },
    };
    return axios.post(url, payload, { headers });
  });

  await Promise.all(sendPromises);
  return { message: "Campaign sent successfully!" };
}

module.exports = { sendCampaign };
