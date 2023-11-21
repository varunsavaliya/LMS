import app from "./app.js";
import cloudinary from "cloudinary";
import RazorPay from "razorpay";

const PORT = process.env.PORT || 5000;

// cloudinary configurations

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// razorpay instance
export const razorPay = new RazorPay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
