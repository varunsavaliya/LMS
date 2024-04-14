import dotenv from "dotenv";

dotenv.config();

const _config = {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiry: process.env.JWT_EXPIRY,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryAPIKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryAPISecret: process.env.CLOUDINARY_API_SECRET,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT,
  smtpUsername: process.env.SMTP_USERNAME,
  smtpPassword: process.env.SMTP_PASSWORD,
  smtpFromEmail: process.env.SMTP_FROM_EMAIL,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpaySecret: process.env.RAZORPAY_SECRET,
  razorpayPlanId: process.env.RAZORPAY_PLAN_ID,
  frontendUrl: process.env.FRONTEND_URL,
  contactUsEmail: process.env.CONTACT_US_EMAIL,
};

export const config = {
  get: (name) => {
    const value = _config[name];
    if (!value) {
      console.log(`Unable to find ${name} in environments.`);
      process.exit(1);
    }
    return value;
  },
};
