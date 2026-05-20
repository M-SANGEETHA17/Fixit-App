import express from "express";
import Worker from "../models/Worker.js";
import Booking from "../models/Booking.js";

const router = express.Router();

// ─── Service Synonym Map ────────────────────────────────────────────────────
// Maps the user-friendly label from the frontend to every DB value that a
// worker might have stored in their `service` field.
const SERVICE_SYNONYMS = {
  "electrical":     ["Electrical Repair", "Electrician", "electrical", "Electrical"],
  "electrical repair": ["Electrical Repair", "Electrician", "electrical", "Electrical"],
  "plumbing":       ["Plumbing", "Plumber", "plumbing"],
  "ac repair":      ["AC Repair", "AC Service", "ac", "AC"],
  "ac service":     ["AC Repair", "AC Service", "ac", "AC"],
  "home cleaning":  ["Home Cleaning", "homeclean", "cleaning", "Cleaning"],
  "carpentry":      ["Carpentry", "Carpenter", "carpentrywork"],
  "pest control":   ["Pest Control", "pestcontrol", "Pest Control"],
};

/**
 * Resolves a user-selected issue label into all known DB service terms.
 * Falls back to the original string if no synonym entry exists.
 */
function resolveServiceTerms(issue) {
  const key = (issue || "").toLowerCase().trim();
  return SERVICE_SYNONYMS[key] ?? [issue];
}

/**
 * POST /api/sos/create
 *
 * Body:
 *   {
 *     userName   : string   — user's name (for booking record)
 *     userPhone  : string   — user's phone (for booking record)
 *     userCity   : string   — user's city  (for location-based matching)
 *     issue      : string   — selected service (e.g. "Electrical", "Plumbing")
 *     userAddress: string   — full address string (optional, stored in booking)
 *   }
 *
 * Success Response:
 *   { success: true, message, worker: { name, phone, service, rating }, bookingId }
 *
 * Error Responses:
 *   400 — missing required fields
 *   404 — no available worker found
 *   500 — internal server error
 */
router.post("/create", async (req, res) => {
  const { userName, userPhone, userCity, issue, userAddress } = req.body;

  // ── 1. Input Validation ─────────────────────────────────────────────────
  if (!userName || !userPhone || !issue) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: userName, userPhone, and issue are required.",
    });
  }

  try {
    const serviceTerms = resolveServiceTerms(issue);
    const serviceRegexList = serviceTerms.map((t) => new RegExp(`^${t}$`, "i"));

    // ── 2. Base Worker Query (skill + active + online) ────────────────────
    const baseQuery = {
      service: { $in: serviceRegexList },
      status:  { $in: ["Active", "active", "Approved", "approved"] },
      isOnline: true,
    };

    // ── 3a. Try: City-matched workers first ───────────────────────────────
    let workers = [];
    if (userCity && userCity.trim() !== "") {
      workers = await Worker.find({
        ...baseQuery,
        location: new RegExp(userCity.trim(), "i"),
      }).sort({ rating: -1, completedTasks: -1 });
    }

    // ── 3b. Fallback: Any online worker with matching skill (nationwide) ───
    if (workers.length === 0) {
      workers = await Worker.find(baseQuery).sort({ rating: -1, completedTasks: -1 });
    }

    // ── 4. No Worker Found ────────────────────────────────────────────────
    if (workers.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No available ${issue} worker found at this time. Please try again shortly or call us directly.`,
      });
    }

    // ── 5. Pick Best Worker (highest rating + most completed tasks) ────────
    const assignedWorker = workers[0];

    // ── 6. Create Booking Record ─────────────────────────────────────────
    // We use the fields the Booking schema actually requires (name, phone, location)
    const booking = await Booking.create({
      name:        userName,
      phone:       userPhone,
      serviceType: issue,
      location:    userAddress || userCity || "Not specified",
      bookingDate: new Date().toLocaleDateString("en-IN"),
      bookingTime: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      workerId:    assignedWorker._id,
      assignedAt:  new Date(),
      status:      "Assigned",
      notifications: {
        workerNotified: false,
        adminNotified:  false,
      },
    });

    // ── 7. Notify Worker (store in their notification field) ──────────────
    await Worker.findByIdAndUpdate(assignedWorker._id, {
      $set: {
        notification: `🆘 EMERGENCY: ${issue} request from ${userName} (${userPhone}) in ${userCity || "your area"}. Booking ID: ${booking._id}`,
      },
    });

    // ── 8. Success Response ───────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      message: "SOS triggered successfully. A worker has been assigned.",
      worker: {
        name:           assignedWorker.name,
        phone:          assignedWorker.phone,
        service:        assignedWorker.service,
        location:       assignedWorker.location,
        rating:         assignedWorker.rating,
        experience:     assignedWorker.experience,
        profileImage:   assignedWorker.profileImage,
        completedTasks: assignedWorker.completedTasks,
      },
      bookingId: booking._id,
    });

  } catch (err) {
    console.error("[SOS ERROR]", err);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred. Please try again.",
      detail:  process.env.NODE_ENV !== "production" ? err.message : undefined,
    });
  }
});

export default router;