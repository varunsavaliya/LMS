import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/dbConnection.js";
import userRoutes from "./routes/user.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import courseRouter from "./routes/course.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import miscellaneousRouter from "./routes/miscellaneous.routes.js";
import fs from "fs";
import path from "path";
import lectureRouter from "./routes/lecture.routes.js";
import { isLoggedIn } from "./middlewares/auth.middleware.js";
import statsRoutes from "./routes/stats.routes.js";

dotenv.config();

const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(cookieParser());

var accessLogStream = fs.createWriteStream(path.join("", "access.log"), {
  flags: "a",
});

app.use(morgan("combined", { stream: accessLogStream }));

// app.use(function (req, res, next) {
//   res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");
//   res.setHeader("Access-Control-Allow-Credentials", true);
//   next();
// });

// connection to db
connectDB();

app.use("/api/v1", miscellaneousRouter);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/course", courseRouter);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/stats", statsRoutes);

app.use("/ping", (req, res) => {
  res.send("pong");
});

// routes of modules

app.all("*", (req, res) => {
  res.status(404).send("OPPS!! route not found");
});

app.use(errorMiddleware);

export default app;
