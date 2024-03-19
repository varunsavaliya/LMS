import bcrypt from "bcryptjs";
import { Schema, model } from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UserRole } from "../constants/UserRoles.constant.js";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Name is required"],
      maxLength: [50, "Name should be smaller than 50 characters"],
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email already exists"],
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*$/,
        "please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      minLength: [8, "password must be at least 8 character"],
    },
    avatar: {
      public_id: {
        type: String,
      },
      secure_url: {
        type: String,
      },
    },
    role: {
      type: String,
      enum: [UserRole.User, UserRole.Admin, UserRole.Tutor],
      default: UserRole.User,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: String,
    subscription: {
      id: String,
      status: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

userSchema.methods = {
  generateJWTToken: async function () {
    return await jwt.sign(
      {
        id: this._id,
        email: this.email,
        subscription: this.subscription,
        role: this.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRY,
      }
    );
  },
  comparePassword: async function (plainTextPassword) {
    return await bcrypt.compare(plainTextPassword, this.password);
  },
  generatePasswordResetToken: async function () {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.forgotPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000;

    return resetToken;
  },
};

const User = model("User", userSchema);

export default User;
