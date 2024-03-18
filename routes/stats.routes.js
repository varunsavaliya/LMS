import express from "express";
import { authorizedRoles, isLoggedIn } from "../middlewares/auth.middleware.js";
import { getUsersStats } from "../controllers/stats.controller.js";

const statsRoutes = express.Router();

statsRoutes.get("/users", isLoggedIn, authorizedRoles("ADMIN"), getUsersStats);

export default statsRoutes;
