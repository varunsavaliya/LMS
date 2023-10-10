import { Router } from "express";
import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
} from "../controllers/course.controller.js";
import {
  authorizedRoles,
  authorizedSubscription,
  isLoggedIn,
} from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import lectureRouter from "./lecture.routes.js";

const courseRouter = Router();

courseRouter
  .route("/")
  .get(getAllCourses)
  .post(
    isLoggedIn,
    authorizedRoles("ADMIN"),
    upload.single("thumbnail"),
    createCourse
  );
courseRouter
  .route("/:id")
  .get(isLoggedIn, authorizedSubscription, getCourseById)
  .put(isLoggedIn, authorizedRoles("ADMIN"), updateCourse)
  .delete(isLoggedIn, authorizedRoles("ADMIN"), deleteCourse);

courseRouter.use("/lecture", isLoggedIn, lectureRouter);

export default courseRouter;
