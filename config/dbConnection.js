import mongoose from "mongoose";
import { config } from "./env.config.js";

mongoose.set("strictQuery", false);

const connectDB = async () => {
  try {
    const { connection } = await mongoose.connect(config.get("mongoUri"));
    if (connection) console.log(`connected to mongoDB: ${connection.host}`);
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

export default connectDB;
