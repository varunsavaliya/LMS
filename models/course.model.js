import { Schema, model } from "mongoose";
import { CourseStatus } from "../constants/CourseStatus.constant.js";

const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minLength: [8, "Description must be at least 8 characters"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    thumbnail: {
      public_id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
    lectures: [
      {
        title: {
          type: String,
        },
        description: {
          type: String,
        },
        lecture: {
          public_id: {
            type: String,
            required: true,
          },
          secure_url: {
            type: String,
            required: true,
          },
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: [
        CourseStatus.Approved,
        CourseStatus.Pending,
        CourseStatus.Declined,
      ],
      default: CourseStatus.Pending,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  {
    timestamps: true,
  }
);

const Course = model("Course", courseSchema);

export default Course;
