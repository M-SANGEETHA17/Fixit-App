import express from "express";
import Booking from "../models/Booking.js";
import Worker from "../models/Worker.js";
import mongoose from "mongoose";
import axios from "axios";

const router = express.Router();

// Find an available worker (if no specific workerId is given)
const findWorker = async (serviceType) => {
  const workers = await Worker.find({
    service: serviceType,
    status: { $regex: /^(approved|active)$/i },
  });
  if (!workers.length) return null;
  return workers[0]; // simple: first available
};

// Optional WhatsApp (placeholder)
const sendWhatsApp = async (phone, message) => {
  try {
    console.log("Sending WhatsApp to:", phone);
    // Replace with real API later
    await axios.post("https://api.whatsapp.com/send", null, {
      params: { phone, text: message },
    });
  } catch (err) {
    console.log("WhatsApp error:", err.message);
  }
};

// CREATE BOOKING (supports manual workerId or auto-assign)
router.post("/create", async (req, res) => {
  try {
    const { name, phone, serviceType, location, workerId } = req.body;

    if (!name || !phone || !serviceType || !location) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    let worker = null;
    if (workerId && mongoose.Types.ObjectId.isValid(workerId)) {
      worker = await Worker.findById(workerId);
      if (!worker || !["approved", "active"].includes(worker.status?.toLowerCase())) {
        worker = null;
      }
    }
    if (!worker) {
      worker = await findWorker(serviceType);
    }

    const booking = new Booking({
      name,
      phone,
      serviceType,
      location,
      workerId: worker ? worker._id : null,
      status: worker ? "Assigned" : "Pending",
      assignedAt: worker ? new Date() : null,
    });

    await booking.save();

    if (worker) {
      await sendWhatsApp(
        worker.phone,
        `New Job Assigned: ${serviceType} at ${location}`
      );
    }

    res.json({
      success: true,
      booking,
      message: worker
        ? "Worker assigned automatically"
        : "No worker available, pending admin action",
    });
  } catch (err) {
    console.log("BOOKING ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET ALL BOOKINGS
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }).populate("workerId");
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// GET BOOKINGS FOR A SPECIFIC WORKER (status = Assigned)
router.get("/worker/:workerId", async (req, res) => {
  try {
    const { workerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(workerId)) {
      return res.status(400).json({ success: false, message: "Invalid workerId" });
    }
    const requests = await Booking.find({ workerId }).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ACCEPT BOOKING
router.put("/accept/:id", async (req, res) => {
  try {
    await Booking.findByIdAndUpdate(req.params.id, { status: "Accepted" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// REJECT BOOKING
router.put("/reject/:id", async (req, res) => {
  try {
    await Booking.findByIdAndUpdate(req.params.id, { status: "Rejected" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// COMPLETE BOOKING
router.put("/complete/:id", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "Completed" },
      { new: true }
    );
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;