import express from "express";
import {
  changePassword,
  forgotPassword,
  getAllUsers,
  getProfile,
  login,
  logout,
  register,
  resetPassword,
  updateProfile,
} from "../controllers/user.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const userRoutes = express.Router();

userRoutes.get("/users", getAllUsers);
userRoutes.post("/register", upload.single("avatar"), register);
userRoutes.post("/login", login);
userRoutes.get("/logout", logout);
userRoutes.get("/me", isLoggedIn, getProfile);
userRoutes.post("/forgot-password", forgotPassword);
userRoutes.post("/reset-password/:resetPasswordToken", resetPassword);
userRoutes.post("/change-password", isLoggedIn, changePassword);
userRoutes.post(
  "/update-me",
  isLoggedIn,
  upload.single("avatar"),
  updateProfile
);

export default userRoutes;
