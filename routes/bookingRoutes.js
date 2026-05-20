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
    const { name, phone, serviceType, location, workerId, bookingDate, bookingTime } = req.body;

    if (!name || !phone || !serviceType || !location || !bookingDate || !bookingTime) {
      return res.status(400).json({
        success: false,
        message: "All fields required including Date and Time",
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

    console.group("📥 [Backend] Received Booking Request");
    console.log("Location String:", location);
    if (req.body.geoLocation) {
      console.log("GeoCoordinates Received:", req.body.geoLocation);
    } else {
      console.log("No GeoCoordinates attached in payload.");
    }
    console.groupEnd();

    const booking = new Booking({
      name,
      phone,
      serviceType,
      location,
      bookingDate,
      bookingTime,
      workerId: worker ? worker._id : null,
      status: worker ? "Assigned" : "Pending",
      assignedAt: worker ? new Date() : null,
      geoLocation: req.body.geoLocation || undefined,
    });

    await booking.save();

    if (worker) {
      await sendWhatsApp(
        worker.phone,
        `New Job Assigned: ${serviceType} on ${bookingDate} at ${bookingTime} at ${location}`
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

// GET RECENT BOOKINGS FOR A USER (by name or phone)
router.get("/user", async (req, res) => {
  try {
    const { name, phone } = req.query;
    if (!name && !phone) {
      return res.status(400).json({ success: false, message: "Name or phone query parameter required" });
    }

    const conditions = [];
    if (phone && phone.trim()) {
      const pVal = phone.trim();
      conditions.push({ phone: pVal });
      const pClean = pVal.replace(/^\+91/, "");
      if (pClean !== pVal) {
        conditions.push({ phone: pClean });
      } else {
        conditions.push({ phone: `+91${pVal}` });
      }
    }
    if (name && name.trim()) {
      const nVal = name.trim();
      conditions.push({ name: nVal });
      conditions.push({ name: { $regex: new RegExp("^" + nVal + "$", "i") } });
    }

    const query = conditions.length > 0 ? { $or: conditions } : {};

    // Find bookings, populate worker, limit to recent ones
    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .populate("workerId")
      .lean();

    // Map unique assigned workers
    const uniqueWorkersMap = new Map();
    bookings.forEach(b => {
      if (b.workerId && !uniqueWorkersMap.has(String(b.workerId._id))) {
        uniqueWorkersMap.set(String(b.workerId._id), {
          _id: b.workerId._id,
          name: b.workerId.name,
          phone: b.workerId.phone,
          service: b.workerId.service || b.serviceType,
          profileImage: b.workerId.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          location: b.workerId.location,
          isOnline: b.workerId.isOnline,
          rating: b.workerId.rating || 0
        });
      }
    });

    const recentWorkers = Array.from(uniqueWorkersMap.values()).slice(0, 7);

    res.json({
      success: true,
      recentWorkers
    });
  } catch (err) {
    console.error("Error fetching user's recent bookings:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
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