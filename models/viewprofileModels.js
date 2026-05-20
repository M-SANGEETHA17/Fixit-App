// models/Worker.js

const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    service: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    experience: {
      type: String,
      default: "0 Years",
    },

    email: {
      type: String,
    },

    profileImage: {
      type: String,
      default:
        "https://cdn-icons-png.flaticon.com/512/149/149071.png",
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
      default:
        "Experienced worker providing professional services.",
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

  {
    timestamps: true,
  }
);

const mongooseLib = require("mongoose");
if (mongooseLib.models && mongooseLib.models.Worker) {
  delete mongooseLib.models.Worker;
}
module.exports = mongoose.model("Worker", workerSchema);