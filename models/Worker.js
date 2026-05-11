import mongoose from "mongoose";

const workerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    service: { type: String, required: true },   // e.g., "AC Repair"
    location: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Active", "active", "approved", "Busy", "busy"],
      default: "Pending",
    },
    notification: {
    type: String,
    default: ""
  },
  },
  { timestamps: true }
);

export default mongoose.model("Worker", workerSchema);