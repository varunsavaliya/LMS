import User from "../models/user.model.js";

export const getUsersStats = async (req, res, next) => {
  try {
    const users = await User.find();
    const allUsersCount = users.filter(u => u.role !== 'ADMIN').length;
    const subscribedCount = users.filter((u) => u.subscription?.status).length;
    res.status(201).json({
      success: true,
      message: "User logged in successfully",
      data: {
        allUsersCount,
        subscribedCount,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
