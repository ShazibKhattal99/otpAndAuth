const express = require("express");
const connectDB = require("./config/db");
const otpRoutes = require("./routes/whatsapp/otp.routes");
const campaignRoutes = require("./routes/whatsapp/campaign.routes");

require("dotenv").config();
const app = express();

app.use(express.json());
connectDB();

app.use("/api/whatsapp", otpRoutes);
app.use("/api/whatsapp", campaignRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));