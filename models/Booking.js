import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    serviceType: { type: String, required: true },
    location: { type: String, required: true },     // ✅ changed from 'address'
    bookingDate: { type: String },
    bookingTime: { type: String },

    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      default: null,
    },

    assignedAt: { type: Date, default: null },

    status: {
      type: String,
      enum: ["Pending", "Assigned", "Accepted", "Rejected", "Completed"],
      default: "Pending",
    },

    notifications: {
      workerNotified: { type: Boolean, default: false },
      adminNotified: { type: Boolean, default: false },
    },

    geoLocation: {
      lat: Number,
      lng: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);