import mongoose from "mongoose";

const querySchema = new mongoose.Schema(
  {
    userName: String,
    workerName: String,
    serviceCategory: String,
    query: String,
  },
  { timestamps: true }
);

export default mongoose.model("Query", querySchema);