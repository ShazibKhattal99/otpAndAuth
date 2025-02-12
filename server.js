import express from "express";
import dotenv from 'dotenv';
import connectDB from "./config/db.js";
import otpRoutes from "./routes/whatsapp/otp.routes.js";
import cors from 'cors';
//import campaignRoutes from "./routes/whatsapp/campaign.routes.js";
dotenv.config();
const app = express();
app.use(cors());
app.options('*', cors());
app.use(express.json());
connectDB();

app.use("/api/whatsapp/otp", otpRoutes);
// app.use("/api/whatsapp/campaign", campaignRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));