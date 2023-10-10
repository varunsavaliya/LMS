import { razorPay } from "../index.js";
import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";
import crypto from "crypto";
import Payment from "../models/payment.model.js";

export const getRazorpayApiKey = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "Razorpay API key",
    key: process.env.RAZORPAY_KEY_ID,
  });
};

export const buySubscription = async (req, res, next) => {
  const { id } = req.user;

  try {
    const user = await User.findById(id);
    if (!user) {
      return next(new AppError("Unauthorized, please login again", 400));
    }

    if (user.role === "ADMIN") {
      return next(new AppError("Admin can not purchase a subscription", 400));
    }

    const subscription = await razorPay.subscriptions.create({
      plan_id: process.env.RAZORPAY_PLAN_ID,
      customer_notify: 1,
      total_count: 1,
    });

    console.log(JSON.stringify(subscription));
    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status;

    await user.save();

    res.status(200).json({
      success: true,
      message: "subscribed successfully",
      subscription_id: subscription.id,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

export const verifySubscription = async (req, res, next) => {
  const { id } = req.user;
  const { razorpay_payment_id, razorpay_signature, razorpay_subscription_id } =
    req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return next(new AppError("Unauthorized, please login again", 400));
    }

    const subscriptionId = user.subscription.id;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_payment_id}|${subscriptionId}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return next(new AppError("Payment not verified, please try again", 500));
    }

    await Payment.create({
      razorpay_payment_id,
      razorpay_signature,
      razorpay_subscription_id,
    });

    user.subscription.status = "active";
    await user.save();

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

export const cancelSubscription = async (req, res, next) => {
  const { id } = req.user;

  try {
    const user = await User.findById(id);
    if (!user) {
      return next(new AppError("Unauthorized, please login again", 400));
    }

    const subscriptionId = user.subscription.id;

    const subscription = await razorPay.subscriptions.cancel(subscriptionId);

    user.subscription.status = subscription.status;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

export const allPayments = async (req, res, next) => {
  const { count } = req.body;
  try {
    const subscriptions = await razorPay.subscriptions.all({
      count: count | 10,
    });
    const payments = await Payment.find();
    res.status(200).json({
      success: true,
      message: "All payments",
      payments,
      subscriptions,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
