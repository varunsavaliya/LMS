import { Router } from "express";
import {
  createLecture,
  deleteLecture,
  getAllLectures,
  getLectureById,
  updateLecture,
} from "../controllers/lecture.controller.js";
import { authorizedRoles, isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const lectureRouter = Router();
lectureRouter
  .route("/:courseId")
  .get(getAllLectures)
  .post(authorizedRoles("ADMIN"), upload.single("lecture"), createLecture);

lectureRouter
  .route("/:courseId/:lectureId")
  .get(getLectureById)
  .put(authorizedRoles("ADMIN"), upload.single("lecture"), updateLecture)
  .delete(authorizedRoles("ADMIN"), deleteLecture);

export default lectureRouter;
