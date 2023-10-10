import express from "express";
import {
  allPayments,
  buySubscription,
  cancelSubscription,
  getRazorpayApiKey,
  verifySubscription,
} from "../controllers/payment.controller.js";
import { authorizedRoles, isLoggedIn } from "../middlewares/auth.middleware.js";

const paymentRoutes = express.Router();

paymentRoutes.route("/razorpay-key").get(isLoggedIn, getRazorpayApiKey);
paymentRoutes.route("/subscribe").post(isLoggedIn, buySubscription);
paymentRoutes.route("/verify").post(isLoggedIn, verifySubscription); // api testing is pending
paymentRoutes.route("/unsubscribe").post(isLoggedIn, cancelSubscription);
paymentRoutes.route("/").get(isLoggedIn, authorizedRoles("ADMIN"), allPayments);

export default paymentRoutes;
