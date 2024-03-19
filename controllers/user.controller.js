import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";
import fs from "fs";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import {
  destroyFromCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinary.util.js";

const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: false,
  secure: true,
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const register = async (req, res, next) => {
  const { fullName, email, password, role } = req.body;

  if (!fullName || !email || !password || !role) {
    return next(new AppError("All fields are required", 400));
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new AppError("User already exists", 400));
    }

    const user = await User.create({
      fullName,
      email,
      password,
      role,
      avatar: {
        public_id: email,
        secure_url: "",
      },
    });

    if (!user) {
      return next(
        new AppError("User registration failed! please try again", 400)
      );
    }

    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.path, {
          width: 250,
          height: 250,
          gravity: "face",
          crop: "fill",
        });

        if (result) {
          user.avatar.public_id = result.public_id;
          user.avatar.secure_url = result.secure_url;

          // remove file from server
          fs.unlinkSync(`uploads/${req.file.filename}`);
        }
      } catch (error) {
        return next(new AppError(error.message, 500));
      }
    }

    await user.save();

    user.password = undefined;

    const token = await user.generateJWTToken();

    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("All fields are required", 400));
  }

  try {
    const user = await User.findOne({ email }).select("+password");
    let isPassCorrect;
    if (user) isPassCorrect = await user.comparePassword(password);
    if (!user || !isPassCorrect) {
      return next(new AppError("Email or password does not match", 400));
    }

    const token = await user.generateJWTToken();
    user.password = undefined;

    res.cookie("token", token, cookieOptions);

    res.status(201).json({
      success: true,
      message: "User logged in successfully",
      user,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const logout = (req, res) => {
  res.cookie("token", null, {
    secure: true,
    maxAge: 0,
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
};

const getProfile = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);

    res.status(200).json({
      success: true,
      message: "User details",
      data: user,
    });
  } catch (error) {
    return next(new AppError("Failed to fetch user detail", 500));
  }
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError("Email is required", 400));
  }
  let user;
  try {
    user = await User.findOne({ email });
    if (!user) {
      return next(new AppError("Email is not registered", 400));
    }

    const resetToken = await user.generatePasswordResetToken();

    await user.save();

    const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const subject = "Reset your password";
    const message = `You can reset your password by clicking on this link -> ${resetPasswordURL}`;

    await sendEmail(email, subject, message);

    res.status(200).json({
      success: true,
      message: `Reset password link has been sent to ${email}`,
    });
  } catch (error) {
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;

    await user.save();
    return next(new AppError(error.message, 400));
  }
};

const resetPassword = async (req, res, next) => {
  const { resetPasswordToken } = req.params;

  const { password } = req.body;

  try {
    const forgotPasswordToken = crypto
      .createHash("sha256")
      .update(resetPasswordToken)
      .digest("hex");

    const user = await User.findOne({
      forgotPasswordToken,
      forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return next(
        new AppError("Token is invalid or expired, please try again", 400)
      );
    }

    user.password = password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const changePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!oldPassword || !newPassword) {
    return next(new AppError("All fields are required", 400));
  }

  try {
    const user = await User.findById(userId).select("+password");

    if (!user) {
      return next(new AppError("User does not exists", 400));
    }

    const isOldPasswordMatched = await user.comparePassword(oldPassword);
    const isNewPasswordMatched = await user.comparePassword(newPassword);

    if (!isOldPasswordMatched) {
      return next(new AppError("Old password is incorrect", 400));
    }

    if (isNewPasswordMatched) {
      return next(new AppError("New password is same as old password", 400));
    }

    user.password = newPassword;

    await user.save();

    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const updateProfile = async (req, res, next) => {
  const { fullName } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return next(new AppError("User does not exists", 400));
    }

    if (fullName) {
      user.fullName = fullName;
    }

    if (req.file) {
      try {
        if (user?.avatar?.public_id)
          destroyFromCloudinary(user.avatar.public_id);
        const result = await uploadToCloudinary(req.file.path, {
          width: 250,
          height: 250,
          gravity: "face",
          crop: "fill",
        });

        if (result) {
          user.avatar.public_id = result.public_id;
          user.avatar.secure_url = result.secure_url;

          // remove file from server
          fs.unlinkSync(`uploads/${req.file.filename}`);
        }
      } catch (error) {
        return next(new AppError(error.message, 500));
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "User details updated successfully",
    });
  } catch (error) {
    return new AppError(error.message, 500);
  }
};

export {
  register,
  login,
  logout,
  getProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
  getAllUsers,
};
