import { CourseStatus } from "../constants/CourseStatus.constant.js";
import { UserRole } from "../constants/UserRoles.constant.js";
import Course from "../models/course.model.js";
import {
  destroyFromCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinary.util.js";
import AppError from "../utils/error.util.js";
import fs from "fs/promises";

const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ isActive: true });
    res.status(200).json({
      success: true,
      message: "Courses fetched successfully",
      data: courses,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const getTutorCourses = async (req, res, next) => {
  const { user } = req;
  try {
    const courses = await Course.find({ isActive: true, createdBy: user?._id });
    res.status(200).json({
      success: true,
      message: "Courses fetched successfully",
      data: courses,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const getCourseById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const course = await Course.findById(id);
    if (!course) {
      return next(new AppError("Course not found", 400));
    }

    res.status(200).json({
      success: true,
      message: "Course fetched successfully",
      data: course.lectures,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const createCourse = async (req, res, next) => {
  const { title, category, description, createdBy } = req.body;
  const { role, _id } = req.user;

  if (!title || !category || !description) {
    return next(new AppError("Every fields are mandatory", 400));
  }

  try {
    const course = await Course.create({
      title,
      description,
      category,
      createdBy: role !== UserRole.Admin ? _id : createdBy,
      thumbnail: {
        public_id: "DUMMY",
        secure_url: "DUMMY",
      },
      status:
        role === UserRole.Admin ? CourseStatus.Approved : CourseStatus.Pending,
    });

    if (!course) {
      return next(
        new AppError("We are facing some error while creating the course", 400)
      );
    }

    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.path);

        if (result) {
          course.thumbnail.public_id = result.public_id;
          course.thumbnail.secure_url = result.secure_url;
        }

        fs.rm(`uploads/${req.file.filename}`);
      } catch (error) {
        return next(new AppError(error.message, 400));
      }
    }

    await course.save();

    res.status(200).json({
      success: true,
      message: `Course created successfully${
        role !== UserRole.Admin
          ? ", course will shown after admin approves your course"
          : "."
      }`,
      data: course,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const updateCourse = async (req, res, next) => {
  const { id } = req.params;
  const { user } = req;
  try {
    const course = await Course.findById(id);

    if (!course) {
      return next(new AppError("Course not found", 400));
    }

    if (user.role !== UserRole.Admin && !course.createdBy.equals(user._id)) {
      return next(new AppError("You can not update this course", 401));
    }

    if (req.file) {
      try {
        destroyFromCloudinary(course.thumbnail.public_id);
        const result = await uploadToCloudinary(req.file.path);

        if (result) {
          course.thumbnail.public_id = result.public_id;
          course.thumbnail.secure_url = result.secure_url;
        }

        fs.rm(`uploads/${req.file.filename}`);
      } catch (error) {
        return next(new AppError(error.message, 400));
      }
    }
    course.set(req.body);

    await course.save();

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const deleteCourse = async (req, res, next) => {
  const { id } = req.params;
  try {
    const course = await Course.findById(id);

    if (!course) {
      return next(new AppError("Course not found", 400));
    }
    course.isActive = false;
    course.save();

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
      data: course,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

export {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getTutorCourses,
};
