import Course from "../models/course.model.js";
import AppError from "../utils/error.util.js";
import fs from "fs/promises";
import {
  destroyFromCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinary.util.js";
import { UserRole } from "../constants/UserRoles.constant.js";

const getAllLectures = async (req, res, next) => {
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return next(new AppError("Course not found", 400));
    }

    res.status(200).json({
      success: true,
      message: "Course lectures fetched successfully",
      data: course.lectures,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const getLectureById = async (req, res, next) => {
  const { courseId, lectureId } = req.params;

  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return next(new AppError("Course not found", 400));
    }

    const lecture = course.lectures.find(
      (lec) => lec._id.toString() === lectureId
    );

    if (!lecture) {
      return next(new AppError("Lecture not found", 404));
    }

    res.status(200).json({
      success: true,
      data: lecture,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const createLecture = async (req, res, next) => {
  const { courseId } = req.params;
  const { user } = req;
  const { title, description } = req.body;
  if (!title || !description) {
    return next(new AppError("All fields are required", 400));
  }
  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return next(new AppError("Course not found", 400));
    }

    if (user.role !== UserRole.Admin && !course.createdBy.equals(user._id)) {
      return next(new AppError("You can not add lectures to this course", 401));
    }

    const lectureData = {
      title,
      description,
      lecture: {
        public_id: "DUMMY",
        secure_url: "DUMMY",
      },
    };

    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.path);

        if (result) {
          lectureData.lecture.public_id = result.public_id;
          lectureData.lecture.secure_url = result.secure_url;
        }

        fs.rm(`uploads/${req.file.filename}`);
      } catch (error) {
        return next(new AppError(error.message, 400));
      }
    }

    course.lectures.push(lectureData);

    await course.save();

    res.status(200).json({
      success: true,
      message: "Lecture added successfully!",
      data: course,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const updateLecture = async (req, res, next) => {
  const { courseId, lectureId } = req.params;
  const { title, description } = req.body;

  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return next(new AppError("Course not found", 400));
    }

    const lecture = course.lectures.find(
      (lec) => lec._id.toString() === lectureId
    );

    if (!lecture) {
      return next(new AppError("Lecture not found", 404));
    }

    if (title) {
      lecture.title = title;
    }

    if (description) {
      lecture.description = description;
    }

    if (req.file) {
      try {
       await destroyFromCloudinary(lecture.lecture.public_id);
        const result = await uploadToCloudinary(req.file.path);

        if (result) {
          (lecture.lecture.public_id = result.public_id),
            (lecture.lecture.secure_url = result.secure_url);
        }

        fs.rm(`uploads/${req.file.filename}`);
      } catch (error) {
        return next(new AppError(error.message, 400));
      }
    }

    await course.save();

    res.status(200).json({
      success: true,
      message: "Lecture updated successfully!",
      data: lecture,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const deleteLecture = async (req, res, next) => {
  const { courseId, lectureId } = req.params;

  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return next(new AppError("Course not found", 400));
    }

    const lectureIndex = course.lectures.findIndex(
      (lec) => lec._id.toString() === lectureId
    );

    if (lectureIndex === -1) {
      return next(new AppError("Lecture not found", 404));
    }

    course.lectures.splice(lectureIndex, 1);
    course.save();
    res.status(200).json({
      success: true,
      message: "Lecture deleted successfully",
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

export {
  getAllLectures,
  getLectureById,
  createLecture,
  updateLecture,
  deleteLecture,
};
