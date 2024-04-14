import AppError from "../utils/error.util.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { config } from "../config/env.config.js";

const isLoggedIn = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new AppError("Unauthenticated, please login again", 400));
  }

  const userDetail = jwt.verify(token, config.get("jwtSecret"));

  req.user = await User.findById(userDetail.id);

  next();
};

const authorizedRoles =
  (...roles) =>
  (req, res, next) => {
    const currentRole = req.user.role;

    if (!roles.includes(currentRole)) {
      return next(
        new AppError("You do not have permission to access this route", 401)
      );
    }

    next();
  };

const authorizedSubscription = async (req, res, next) => {
  const userRole = req.user.role;
  const subscription = req.user.subscription;
  if (userRole !== "ADMIN" && subscription.status !== "active") {
    return next(new AppError("Please subscribe to access this route", 401));
  }
  next();
};

export { isLoggedIn, authorizedRoles, authorizedSubscription };
