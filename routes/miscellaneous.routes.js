import { Router } from "express";
import { contact } from "../controllers/miscellaneous.controller.js";

const miscellaneousRouter = Router();

miscellaneousRouter.post("/contact", contact);

export default miscellaneousRouter