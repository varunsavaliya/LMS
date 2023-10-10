import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";
import cloudinary from "cloudinary";
import fs from "fs";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: true,
};

const register = async (req, res, next) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
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
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
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
          console.log(JSON.stringify(req.file));
        }
      } catch (error) {
        return next(new AppError(error.message, 500));
      }
    }

    await user.save();

    user.password = undefined;

    const token = await user.generateJWTToken();

    res.cookie("token", token, cookieOptions);

    res.status(201).json({
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
    return next(new AppError("All fields are requiired", 400));
  }

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.comparePassword(password)) {
      return next(new AppError("Email or password does not match", 400));
    }

    const token = await user.generateJWTToken();
    console.log(token);
    user.password = undefined;

    res.cookie("token", token, cookieOptions);

    res.status(201).json({
      success: true,
      message: "User loggedin successfully",
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
      user,
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
    console.log(resetToken);

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

    const isPasswordMatched = await user.comparePassword(oldPassword);
    console.log(isPasswordMatched);

    if (!isPasswordMatched) {
      return next(new AppError("Old password is incorrect", 400));
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
      await cloudinary.v2.uploader.destroy(user.avatar.public_id);
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
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
          console.log(JSON.stringify(req.file));
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
};
