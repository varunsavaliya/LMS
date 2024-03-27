import Contact from "../models/contact.model.js";
import AppError from "../utils/error.util.js";

export const contact = async (req, res, next) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return next(new AppError("All fields are required", 400));
  }

  try {
    const contactDetails = await Contact.create({ name, email, message });

    if (!contactDetails) {
      return next(
        new AppError("Message submission failed! please try again", 400)
      );
    }

    res.status(201).json({
      success: true,
      message: "Message submitted successfully",
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
