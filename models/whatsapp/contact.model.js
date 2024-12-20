const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  name: { type: String },
});

module.exports = mongoose.model("WhatsAppContact", contactSchema);
