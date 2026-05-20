import express from "express";
import Worker from "../models/Worker.js";
import mongoose from "mongoose";

const router = express.Router();

// Helper to resolve fuzzy search service synonyms
const getServiceTerms = (service) => {
  if (!service) return [];
  
  let clean = service.toLowerCase().trim();
  
  // Clean punctuation and double spaces
  clean = clean.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ").replace(/\s+/g, " ").trim();
  const cleanSpaceless = clean.replace(/\s+/g, "");
  
  // Typo Tolerances
  const typos = {
    "repari": "repair",
    "electical": "electrical",
    "electican": "electrician",
    "plumbin": "plumbing",
    "carpentri": "carpentry",
    "clen": "clean",
    "celan": "clean",
    "serivce": "service",
    "servise": "service",
    "electricals": "electrical",
    "plumbers": "plumber",
    "carpenters": "carpenter",
    "cleaners": "cleaner"
  };
  
  for (const [typo, replacement] of Object.entries(typos)) {
    clean = clean.replace(new RegExp(typo, "g"), replacement);
  }
  
  const terms = [clean];
  
  // Synonym & space-insensitive mappings for Tamil Nadu services
  const sLower = clean;
  const sSpaceless = cleanSpaceless;
  
  // 1. Electrician / Electrical Repair / Wiring
  if (sLower.includes("electr") || sLower.includes("wire") || sLower.includes("wiring") || 
      sLower.includes("power") || sLower.includes("fan") || sLower.includes("light") || 
      sLower.includes("switch") || sLower.includes("current") || sSpaceless.includes("electrician") || 
      sSpaceless.includes("electricalrepair") || sSpaceless.includes("wiringwork")) {
    terms.push("Electrician", "electrical", "electrical repair", "Electrical Repair", "Wiring", "Wiring Works");
  }
  
  // 2. Cleaning / Housekeeping
  if (sLower.includes("clean") || sLower.includes("maid") || sLower.includes("housekeep") || 
      sLower.includes("sweeper") || sLower.includes("sofa") || sSpaceless.includes("homecleaning") || 
      sSpaceless.includes("housecleaning")) {
    terms.push("homeclean", "cleaning", "home cleaning", "Home Cleaning", "Cleaning", "Cleaner");
  }
  
  // 3. AC Service / Fridge / Cooling
  if (sLower.includes("ac ") || sLower === "ac" || sLower.includes("air") || sLower.includes("cool") || 
      sLower.includes("fridge") || sLower.includes("refriger") || sSpaceless.includes("acservice") || 
      sSpaceless.includes("acrepair") || sSpaceless.includes("actechnician")) {
    terms.push("AC Repair", "ac", "ac service", "AC Service", "AC Technician");
  }
  
  // 4. Carpenter / Carpentry / Woodwork
  if (sLower.includes("carp") || sLower.includes("wood") || sLower.includes("furnit") || 
      sLower.includes("door") || sLower.includes("window") || sSpaceless.includes("carpentry") || 
      sSpaceless.includes("woodwork") || sSpaceless.includes("carpenterwork")) {
    terms.push("Carpenter", "carpentrywork", "carpentry", "Carpentry", "Wood Work");
  }
  
  // 5. Plumber / Plumbing
  if (sLower.includes("plumb") || sLower.includes("pipe") || sLower.includes("water") || 
      sLower.includes("leak") || sLower.includes("tap") || sLower.includes("basin") || 
      sSpaceless.includes("plumbing") || sSpaceless.includes("plumbingwork")) {
    terms.push("Plumber", "plumbing", "Plumbing", "Plumbing Work");
  }
  
  // 6. Pest Control
  if (sLower.includes("pest") || sLower.includes("bug") || sLower.includes("termite") || 
      sLower.includes("insect") || sLower.includes("rodent") || sLower.includes("rat") || 
      sSpaceless.includes("pestcontrol")) {
    terms.push("Pest Control", "pestcontrol", "Pest Control");
  }
  
  const uniqueTerms = [];
  const seen = new Set();
  for (const term of terms) {
    const tLower = term.toLowerCase();
    if (!seen.has(tLower)) {
      seen.add(tLower);
      uniqueTerms.push(term);
    }
  }
  return uniqueTerms;
};

// Simple Levenshtein distance helper
const getLevenshteinDistance = (a, b) => {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

const knownCities = [
  "Chennai", "Sattur", "Coimbatore", "Madurai", "Trichy", "Salem", 
  "Tirunelveli", "Palayamkottai", "Kovilpatti", "Sivakasi", 
  "Virudhunagar", "Thoothukudi", "Tuticorin", "Palani", "Dindigul",
  "Nagercoil", "Kanyakumari", "Erode", "Vellore", "Thanjavur", 
  "Hosur", "Karur", "Rajapalayam", "Sankaranayinarkoil", "Tenkasi"
];

const resolveFuzzyCity = (cityInput) => {
  if (!cityInput) return "";
  const input = cityInput.trim().toLowerCase();
  if (input === "nearby" || input === "near by") return "Nearby";
  
  // Direct matches
  for (const city of knownCities) {
    if (city.toLowerCase() === input) return city;
  }
  
  // Clean punctuation and common suffixes
  let cleanInput = input.replace(/\s+district$/i, "").replace(/\s+town$/i, "").replace(/\s+village$/i, "").trim();
  
  // Check for common typo mappings
  const commonCityTypos = {
    "satur": "Sattur",
    "sathur": "Sattur",
    "madruai": "Madurai",
    "madura": "Madurai",
    "chenai": "Chennai",
    "coimbator": "Coimbatore",
    "kovilpati": "Kovilpatti",
    "kovilpatty": "Kovilpatti",
    "tirunelvely": "Tirunelveli",
    "trichy": "Trichy",
    "trichi": "Trichy",
    "tuticorin": "Thoothukudi",
    "thoothukudi": "Thoothukudi",
    "sivakasi": "Sivakasi",
    "sivakashi": "Sivakasi",
    "virudhunagar": "Virudhunagar",
    "virudunagar": "Virudhunagar",
    "palayamkotai": "Palayamkottai",
    "palayankottai": "Palayamkottai"
  };
  
  if (commonCityTypos[cleanInput]) {
    return commonCityTypos[cleanInput];
  }
  
  // Calculate Levenshtein distance for fuzzy matching
  let bestMatch = cityInput;
  let minDistance = 3; // allow up to 2 changes
  
  for (const city of knownCities) {
    const cLower = city.toLowerCase();
    const dist = getLevenshteinDistance(cleanInput, cLower);
    if (dist < minDistance) {
      minDistance = dist;
      bestMatch = city;
    }
  }
  
  return bestMatch;
};

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
    const serviceTerms = getServiceTerms(serviceParam);

    const workers = await Worker.find({
      service: { $in: serviceTerms.map(term => new RegExp("^" + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$", "i")) },
      status: { $in: ["Active", "active", "Approved", "approved"] },
    }).sort({ isOnline: -1 });

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
    let { city, service } = req.query;

    const resolvedCity = city ? resolveFuzzyCity(city) : "";

    const queryObj = {
      status: { $in: ["Active", "active", "Approved", "approved"] }
    };

    if (service) {
      const escapedService = service.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const serviceTerms = getServiceTerms(service);
      const orConditions = [];

      if (serviceTerms.length > 0) {
        orConditions.push({
          service: { $in: serviceTerms.map(term => new RegExp("^" + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$", "i")) }
        });
      } else {
        orConditions.push({
          service: new RegExp(escapedService, "i")
        });
      }

      // Also match worker name for shop/worker name search
      orConditions.push({
        name: new RegExp(escapedService, "i")
      });

      queryObj.$or = orConditions;
    }

    if (resolvedCity) {
      // Create a regex to match resolved city or the original searched city
      const cityPattern = [resolvedCity, city].filter(Boolean).map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join("|");
      queryObj.location = new RegExp(cityPattern, "i");
    }

    const workers = await Worker.find(queryObj);

    // Dynamic Relevance Scoring on the backend!
    const scoredWorkers = workers.map(worker => {
      let score = 0;
      
      // 1. Exact City Match Boost
      if (resolvedCity) {
        const wLoc = (worker.location || "").toLowerCase();
        if (wLoc.includes(resolvedCity.toLowerCase())) {
          score += 5;
        } else if (city && wLoc.includes(city.toLowerCase())) {
          score += 3;
        }
      }
      
      // 2. Online Boost
      if (worker.isOnline === true) {
        score += 3;
      }
      
      // 3. Service/Name exact match boost
      if (service) {
        const sLower = service.toLowerCase();
        if ((worker.service || "").toLowerCase() === sLower) {
          score += 4;
        }
        if ((worker.name || "").toLowerCase().includes(sLower)) {
          score += 2;
        }
      }
      
      // 4. Rating contribution
      const rating = parseFloat(worker.rating) || 0;
      score += rating / 10;
      
      return { worker, score };
    });

    // Sort by relevance score descending
    scoredWorkers.sort((a, b) => b.score - a.score);

    res.json({
      success: true,
      workers: scoredWorkers.map(sw => sw.worker),
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

    const workers = await Worker.find(queryObj).sort({ isOnline: -1 });

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

// Toggle Online Status
router.put("/toggle-status/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid worker ID" });
    }

    const { isOnline } = req.body;

    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      { isOnline },
      { new: true }
    );

    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }

    res.json({
      success: true,
      worker,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
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

    // Only allow explicitly authorized statuses
    const activeStatuses = ["active", "approved", "Active", "Approved"];
    if (!worker.status || !activeStatuses.includes(worker.status)) {
      const isRejected = worker.status === "Rejected" || worker.status?.toLowerCase() === "rejected";
      const msg = isRejected 
        ? "Your account has been deactivated by admin." 
        : "Waiting for admin approval.";
      
      return res.status(403).json({
        success: false,
        message: msg,
      });
    }

    console.log("Login successful");
    
    // Update worker status and last active time
    worker.isOnline = true;
    worker.lastActive = Date.now();
    await worker.save();

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