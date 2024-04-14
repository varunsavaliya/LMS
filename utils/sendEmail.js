import nodemailer from "nodemailer";
import { config } from "../config/env.config.js";

const sendEmail = async function (email, subject, message) {
  let transporter = nodemailer.createTransport({
    host: config.get("smtpHost"),
    port: config.get("smtpPort"),
    secure: false, // true for port 465, false for others
    auth: {
      user: config.get("smtpUsername"),
      pass: config.get("smtpPassword"),
    },
  });

  await transporter.sendMail({
    from: config.get("smtpFromEmail"),
    to: email,
    subject: subject,
    html: message,
  });
};

export default sendEmail;
