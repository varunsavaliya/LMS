import { Router } from "express";
import {
    createLecture,
  deleteLecture,
  getLectureById,
  updateLecture,
} from "../controllers/lecture.controller.js";
import { authorizedRoles, isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const lectureRouter = Router();
lectureRouter.route('/:courseId').post(
  authorizedRoles("ADMIN"),
  upload.single("lecture"),
  createLecture
);

lectureRouter
  .route("/:courseId/:lectureId")
  .get(isLoggedIn, getLectureById)
  .put(isLoggedIn, authorizedRoles("ADMIN"), upload.single("lecture"), updateLecture)
  .delete(isLoggedIn, authorizedRoles("ADMIN"), deleteLecture);

export default lectureRouter;
