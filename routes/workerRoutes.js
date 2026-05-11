import express from "express";
import Worker from "../models/Worker.js";
import mongoose from "mongoose";

const router = express.Router();

// Fix AC workers status
router.get("/fix-ac-workers", async (req, res) => {
  try {
    const result = await Worker.updateMany(
      { service: "AC Service" },
      { $set: { status: "Active" } }
    );

    res.json({
      success: true,
      message: "AC workers updated successfully",
      result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// Register worker
router.post("/register", async (req, res) => {
  try {
    const newWorker = new Worker({
      ...req.body,
      email: req.body.email.trim().toLowerCase(),
      password: req.body.password.trim(),
      status: req.body.status || "Pending",
      notification: req.body.notification || (req.body.status === "Active" ? "Account active" : "Account submitted for approval"),
    });

    await newWorker.save();

    res.status(201).json({
      success: true,
      message: "Registration successful",
      worker: newWorker,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get workers by service
router.get("/by-service/:service", async (req, res) => {
  try {
    const serviceParam = req.params.service;

    // Map common synonyms to support legacy/custom typed worker categories
    let serviceTerms = [serviceParam];
    if (serviceParam.toLowerCase() === "electrical repair") {
      serviceTerms.push("Electrician", "electrical");
    } else if (serviceParam.toLowerCase() === "home cleaning") {
      serviceTerms.push("homeclean", "cleaning");
    } else if (serviceParam.toLowerCase() === "ac service") {
      serviceTerms.push("AC Repair", "ac");
    } else if (serviceParam.toLowerCase() === "carpentry") {
      serviceTerms.push("Carpenter", "carpentrywork");
    } else if (serviceParam.toLowerCase() === "plumbing") {
      serviceTerms.push("Plumber");
    }

    const workers = await Worker.find({
      service: { $in: serviceTerms.map(term => new RegExp("^" + term + "$", "i")) },
      status: { $in: ["Active", "active", "Approved", "approved"] },
    });

    res.json({
      success: true,
      workers,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { city, service } = req.query;

    let serviceTerms = [];
    if (service) {
      serviceTerms.push(service);
      const sLower = service.toLowerCase();
      if (sLower === "electrical repair" || sLower === "electrician" || sLower === "electrical") {
        serviceTerms.push("Electrician", "electrical", "electrical repair");
      } else if (sLower === "home cleaning" || sLower === "cleaner" || sLower === "cleaning") {
        serviceTerms.push("homeclean", "cleaning", "home cleaning");
      } else if (sLower === "ac service" || sLower === "ac repair" || sLower === "ac") {
        serviceTerms.push("AC Repair", "ac", "ac service");
      } else if (sLower === "carpentry" || sLower === "carpenter" || sLower === "carpentrywork") {
        serviceTerms.push("Carpenter", "carpentrywork", "carpentry");
      } else if (sLower === "plumbing" || sLower === "plumber") {
        serviceTerms.push("Plumber", "plumbing");
      } else if (sLower === "pest control" || sLower === "pestcontrol") {
        serviceTerms.push("Pest Control", "pestcontrol");
      }
    }

    const queryObj = {
      status: { $in: ["Active", "active", "Approved", "approved"] }
    };

    if (service && serviceTerms.length > 0) {
      queryObj.service = { $in: serviceTerms.map(term => new RegExp("^" + term + "$", "i")) };
    } else if (service) {
      queryObj.service = new RegExp(service, "i");
    }

    if (city) {
      queryObj.location = new RegExp(city, "i");
    }

    const workers = await Worker.find(queryObj);

    res.json({
      success: true,
      workers,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Search failed",
    });
  }
});

// Global search
router.get("/global-search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json({ success: true, workers: [] });
    }

    let serviceRegex = "";
    let cityRegex = "";
    
    // Check if query is in format "Service from City" or "Service in City"
    const parts = q.split(/ from | in /i);
    if (parts.length === 2) {
      serviceRegex = parts[0].trim();
      cityRegex = parts[1].trim();
    } else {
      cityRegex = q.trim();
    }

    const queryObj = { status: { $in: ["Active", "approved", "active"] } };
    
    if (serviceRegex && cityRegex) {
      queryObj.service = new RegExp(serviceRegex, "i");
      queryObj.location = new RegExp(cityRegex, "i");
    } else if (cityRegex) {
      const regex = new RegExp(cityRegex, "i");
      queryObj.$or = [
        { location: regex },
        { service: regex },
        { name: regex }
      ];
    }

    const workers = await Worker.find(queryObj);

    res.json({
      success: true,
      workers,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Global search failed",
    });
  }
});

// Get pending workers
router.get("/pending", async (req, res) => {
  try {
    const workers = await Worker.find({ status: "Pending" });

    res.json({
      success: true,
      workers,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get worker by ID (or all workers if id = "all")
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ SPECIAL CASE: if frontend requests "/all", return all workers
    if (id === "all") {
      const workers = await Worker.find({});
      return res.json({
        success: true,
        workers,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid worker ID format",
      });
    }

    const worker = await Worker.findById(id);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    res.json({
      success: true,
      worker,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Update worker
router.put("/update/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid worker ID format",
      });
    }

    const updatedWorker = await Worker.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedWorker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    res.json({
      success: true,
      worker: updatedWorker,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Approve worker
router.put("/approve/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid worker ID format",
      });
    }

    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      {
        status: "Active",
        notification: "Your account has been approved ✅",
      },
      { new: true }
    );

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    res.json({
      success: true,
      worker,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Reject worker
router.put("/reject/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid worker ID format",
      });
    }

    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      {
        status: "Rejected",
        notification: "Your request was rejected",
      },
      { new: true }
    );

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    res.json({
      success: true,
      worker,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Delete worker
router.delete("/delete/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid worker ID format",
      });
    }

    const worker = await Worker.findByIdAndDelete(req.params.id);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    res.json({
      success: true,
      message: "Worker deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Worker login
router.post("/login", async (req, res) => {
  console.log("=> POST /api/workers/login hit", req.body);
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log("Missing fields");
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    console.log("Searching for worker with email:", email.trim().toLowerCase());
    const worker = await Worker.findOne({
      email: email.trim().toLowerCase(),
    });

    console.log("Worker found:", worker ? "yes" : "no");
    if (!worker) {
      return res.status(401).json({
        success: false,
        message: "Worker not found",
      });
    }

    const workerPassword = worker.password || "";
    console.log(`Comparing: '${workerPassword}' with '${password}'`);
    if (workerPassword.trim() !== password.trim()) {
      console.log("Password mismatch");
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    if (worker.status === "Pending") {
      return res.status(403).json({
        success: false,
        message: "Waiting for admin approval",
      });
    }

    if (worker.status === "Rejected") {
      return res.status(403).json({
        success: false,
        message: "Rejected by admin",
      });
    }

    console.log("Login successful");
    res.json({
      success: true,
      worker,
    });
  } catch (err) {
    console.error("Worker Login Exception:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


export default router;