import { Router } from "express";
import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getCourseById,
  getTutorCourses,
  updateCourse,
} from "../controllers/course.controller.js";
import {
  authorizedRoles,
  authorizedSubscription,
  isLoggedIn,
} from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import lectureRouter from "./lecture.routes.js";
import { UserRole } from "../constants/UserRoles.constant.js";

const courseRouter = Router();

courseRouter.get(
  "/mycourses",
  isLoggedIn,
  authorizedRoles(UserRole.Tutor),
  getTutorCourses
);
courseRouter
  .route("/")
  .get(getAllCourses)
  .post(
    isLoggedIn,
    authorizedRoles(UserRole.Admin, UserRole.Tutor),
    upload.single("thumbnail"),
    createCourse
  );
courseRouter
  .route("/:id")
  .get(isLoggedIn, authorizedSubscription, getCourseById)
  .put(
    isLoggedIn,
    authorizedRoles(UserRole.Admin, UserRole.Tutor),
    upload.single("thumbnail"),
    updateCourse
  )
  .delete(
    isLoggedIn,
    authorizedRoles(UserRole.Admin, UserRole.Tutor),
    deleteCourse
  );

courseRouter.use("/lectures", isLoggedIn, lectureRouter);

export default courseRouter;
