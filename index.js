import app from "./app.js";
import cloudinary from "cloudinary";
import RazorPay from "razorpay";
import { config } from "./config/env.config.js";

const PORT = config.get("port") || 5000;

// cloudinary configurations

cloudinary.v2.config({
  cloud_name: config.get("cloudinaryCloudName"),
  api_key: config.get("cloudinaryAPIKey"),
  api_secret: config.get("cloudinaryAPISecret"),
});

// razorpay instance
export const razorPay = new RazorPay({
  key_id: config.get("razorpayKeyId"),
  key_secret: config.get("razorpaySecret"),
});

app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
