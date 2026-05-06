import express from "express";
import Feedback from "../models/Feedback.js";

const router = express.Router();


// Submit feedback
router.post("/", async (req, res) => {
  try {
    const { workerEmail, customerName, rating, comment } = req.body;

    if (!workerEmail || !customerName || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    const newFeedback = new Feedback({
      workerEmail,
      customerName,
      rating,
      comment,
    });

    await newFeedback.save();

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


// Get feedback by worker email
router.get("/:email", async (req, res) => {
  try {
    const workerEmail = req.params.email;

    const feedbacks = await Feedback.find({
      workerEmail: workerEmail.toLowerCase(),
    });

    res.json({
      success: true,
      feedbacks,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;