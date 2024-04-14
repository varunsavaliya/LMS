import { razorPay } from "../index.js";
import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";
import crypto from "crypto";
import Payment from "../models/payment.model.js";
import { config } from "../config/env.config.js";

export const getRazorpayApiKey = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "Razorpay API key",
    key: config.get("razorpayKeyId"),
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
      plan_id: config.get("razorpayPlanId"),
      customer_notify: 1,
      total_count: 1,
    });

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
      .createHmac("sha256", config.get("razorpaySecret"))
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
  try {
    let subscriptions = await razorPay.subscriptions.all();
    subscriptions = subscriptions.items.filter(
      (subscription) => subscription.status === "completed"
    );
    const allPayments = await Payment.find();
    const paymentsByMonth = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    allPayments.forEach((payment) => {
      const month = payment.createdAt.getMonth();
      if (paymentsByMonth.indexOf(month)) {
        paymentsByMonth[month] += 1;
      } else {
        paymentsByMonth[month] = 1;
      }
    });
    res.status(200).json({
      success: true,
      message: "All payments",
      data: {
        allPayments,
        subscriptions,
        paymentsByMonth,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
