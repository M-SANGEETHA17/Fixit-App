import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    workerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Feedback", feedbackSchema);