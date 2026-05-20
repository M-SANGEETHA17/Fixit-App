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
    isOnline: {
      type: Boolean,
      default: true,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    notification: {
      type: String,
      default: ""
    },
    experience: {
      type: String,
      default: "0 Years",
    },
    profileImage: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },
    completedTasks: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    about: {
      type: String,
      default: "Experienced worker providing professional services.",
    },
    feedbacks: [
      {
        userName: String,
        message: String,
        stars: {
          type: Number,
          default: 5,
        },
        image: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

if (mongoose.models && mongoose.models.Worker) {
  delete mongoose.models.Worker;
}
export default mongoose.model("Worker", workerSchema);