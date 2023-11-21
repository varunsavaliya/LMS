import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/dbConnection.js";
import userRoutes from "./routes/user.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import courseRouter from "./routes/course.routes.js";
import lectureRouter from "./routes/lecture.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

dotenv.config();

const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.unsubscribe(
  cors({
    origin: [process.env.FRONTEND_URL],
    credential: true,
  })
);
app.use(cookieParser());
app.use(morgan("dev"));

// connection to db
connectDB();

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/course", courseRouter);
app.use("/api/v1/payment", paymentRoutes);

app.use("/ping", (req, res) => {
  res.send("pong");
});

// routes of modules

app.all("*", (req, res) => {
  res.status(404).send("OPPS!! route not found");
});

app.use(errorMiddleware);

export default app;
