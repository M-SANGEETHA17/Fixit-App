import express from "express";
import Worker from "../models/Worker.js";
import Feedback from "../models/Feedback.js";

const router = express.Router();

// 🔥 GET SINGLE WORKER FULL PROFILE
router.get("/:id", async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    // Fetch standalone legacy feedbacks registered under the worker's email
    let standaloneFeedbacks = [];
    if (worker.email) {
      try {
        const found = await Feedback.find({
          workerEmail: worker.email.toLowerCase().trim()
        }).lean();

        standaloneFeedbacks = found.map(fb => ({
          userName: fb.customerName,
          message: fb.comment,
          stars: fb.rating || 5,
          image: fb.image || null,
          createdAt: fb.createdAt || new Date()
        }));
      } catch (e) {
        console.log("Error pulling standalone feedbacks:", e);
      }
    }

    // Transform worker to JSON to append the merged list
    const workerObj = worker.toObject();
    
    // Combine embedded list with standalone list, filtering out duplicates robustly
    const clean = (str) => String(str || "").toLowerCase().trim();
    const allFeedbacks = [...(workerObj.feedbacks || [])];
    standaloneFeedbacks.forEach(sf => {
      let existingDup = null;
      const isDup = allFeedbacks.some(ef => {
        const isTextDup = clean(ef.userName) === clean(sf.userName) && clean(ef.message) === clean(sf.message);
        if (isTextDup) {
          existingDup = ef;
          return true;
        }
        const timeDiff = ef.createdAt && sf.createdAt ? Math.abs(new Date(ef.createdAt) - new Date(sf.createdAt)) : null;
        if (clean(ef.userName) === clean(sf.userName) && timeDiff !== null && timeDiff < 60000) {
          existingDup = ef;
          return true;
        }
        return false;
      });

      if (isDup) {
        // Safe Merge: If the standalone feedback has an image, preserve it in the merged output
        if (sf.image && existingDup && !existingDup.image) {
          existingDup.image = sf.image;
        }
      } else {
        allFeedbacks.push(sf);
      }
    });
    
    // Sort chronologically (newest first)
    allFeedbacks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    workerObj.feedbacks = allFeedbacks;
    workerObj.totalReviews = allFeedbacks.length;
    
    if (allFeedbacks.length > 0) {
      const sum = allFeedbacks.reduce((acc, fb) => acc + (Number(fb.stars) || 0), 0);
      workerObj.rating = Number((sum / allFeedbacks.length).toFixed(1));
    } else {
      workerObj.rating = 0;
    }

    res.status(200).json({
      success: true,
      worker: workerObj,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// 🔥 ADD FEEDBACK & AUTO-RECALCULATE STATS
router.post("/:id/feedback", async (req, res) => {
  try {
    const { userName, message, stars, image } = req.body;
    const workerId = req.params.id;

    if (!userName || !message) {
      return res.status(400).json({
        success: false,
        message: "Name and message are required.",
      });
    }

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found.",
      });
    }

    const trimmedUserName = String(userName || "").trim();
    const trimmedMessage = String(message || "").trim();
    const clean = (str) => String(str || "").toLowerCase().trim();

    // Backend Duplicate Protection (60-second threshold)
    const duplicateEmbedded = worker.feedbacks.some(fb => 
      clean(fb.userName) === clean(trimmedUserName) && 
      clean(fb.message) === clean(trimmedMessage) && 
      (new Date() - new Date(fb.createdAt)) < 60000
    );

    if (duplicateEmbedded) {
      console.log("Blocked duplicate feedback in Worker feedbacks array");
      
      // Fetch standalone legacy feedbacks to include in the response
      let standaloneFeedbacks = [];
      if (worker.email) {
        try {
          const found = await Feedback.find({
            workerEmail: worker.email.toLowerCase().trim()
          }).lean();

          standaloneFeedbacks = found.map(fb => ({
            userName: fb.customerName,
            message: fb.comment,
            stars: fb.rating || 5,
            image: fb.image || null,
            createdAt: fb.createdAt || new Date()
          }));
        } catch (e) {
          console.log("Error pulling standalone feedbacks:", e);
        }
      }

      const workerObj = worker.toObject();
      // Combine embedded list with standalone list, filtering out duplicates robustly
      const allFeedbacks = [...(workerObj.feedbacks || [])];
      standaloneFeedbacks.forEach(sf => {
        let existingDup = null;
        const isDup = allFeedbacks.some(ef => {
          const isTextDup = clean(ef.userName) === clean(sf.userName) && clean(ef.message) === clean(sf.message);
          if (isTextDup) {
            existingDup = ef;
            return true;
          }
          const timeDiff = ef.createdAt && sf.createdAt ? Math.abs(new Date(ef.createdAt) - new Date(sf.createdAt)) : null;
          if (clean(ef.userName) === clean(sf.userName) && timeDiff !== null && timeDiff < 60000) {
            existingDup = ef;
            return true;
          }
          return false;
        });

        if (isDup) {
          // Safe Merge: If the standalone feedback has an image, preserve it in the merged output
          if (sf.image && existingDup && !existingDup.image) {
            existingDup.image = sf.image;
          }
        } else {
          allFeedbacks.push(sf);
        }
      });

      allFeedbacks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      workerObj.feedbacks = allFeedbacks;
      workerObj.totalReviews = allFeedbacks.length;
      if (allFeedbacks.length > 0) {
        const sum = allFeedbacks.reduce((acc, fb) => acc + (Number(fb.stars) || 0), 0);
        workerObj.rating = Number((sum / allFeedbacks.length).toFixed(1));
      } else {
        workerObj.rating = 0;
      }

      return res.status(201).json({
        success: true,
        message: "Feedback submitted successfully (duplicate ignored)",
        worker: workerObj,
      });
    }

    // Add new feedback to Worker document (properly normalized)
    const newFeedback = {
      userName: trimmedUserName,
      message: trimmedMessage,
      stars: Number(stars) || 5,
      image: image || null,
      createdAt: new Date()
    };

    worker.feedbacks.push(newFeedback);

    // Recalculate Stats
    worker.totalReviews = worker.feedbacks.length;
    const sumStars = worker.feedbacks.reduce((sum, item) => sum + (item.stars || 0), 0);
    worker.rating = Number((sumStars / worker.totalReviews).toFixed(1));

    await worker.save();

    // ALSO save to standalone Feedback collection as a fail-safe backup (including image!)
    try {
      const duplicateStandalone = await Feedback.findOne({
        workerEmail: worker.email ? worker.email.toLowerCase().trim() : "unknown@fixit.com",
        customerName: trimmedUserName,
        comment: trimmedMessage,
        createdAt: { $gte: new Date(Date.now() - 60000) }
      });

      if (!duplicateStandalone) {
        const standaloneFb = new Feedback({
          workerEmail: worker.email ? worker.email.toLowerCase().trim() : "unknown@fixit.com",
          workerName: worker.name || "Unknown",
          customerName: trimmedUserName,
          rating: Number(stars) || 5,
          comment: trimmedMessage,
          image: image || null,
        });
        await standaloneFb.save();
      } else {
        console.log("Blocked duplicate standalone feedback submission");
      }
    } catch (saveErr) {
      console.log("Error saving fail-safe standalone feedback:", saveErr);
    }

    // Fetch standalone legacy feedbacks to include in the refreshed response
    let standaloneFeedbacks = [];
    if (worker.email) {
      try {
        const found = await Feedback.find({
          workerEmail: worker.email.toLowerCase().trim()
        }).lean();

        standaloneFeedbacks = found.map(fb => ({
          userName: fb.customerName,
          message: fb.comment,
          stars: fb.rating || 5,
          image: fb.image || null,
          createdAt: fb.createdAt || new Date()
        }));
      } catch (e) {
        console.log("Error pulling standalone feedbacks:", e);
      }
    }

    const workerObj = worker.toObject();
    // Combine embedded list with standalone list, filtering out duplicates robustly
    const allFeedbacks = [...(workerObj.feedbacks || [])];
    standaloneFeedbacks.forEach(sf => {
      let existingDup = null;
      const isDup = allFeedbacks.some(ef => {
        const isTextDup = clean(ef.userName) === clean(sf.userName) && clean(ef.message) === clean(sf.message);
        if (isTextDup) {
          existingDup = ef;
          return true;
        }
        const timeDiff = ef.createdAt && sf.createdAt ? Math.abs(new Date(ef.createdAt) - new Date(sf.createdAt)) : null;
        if (clean(ef.userName) === clean(sf.userName) && timeDiff !== null && timeDiff < 60000) {
          existingDup = ef;
          return true;
        }
        return false;
      });

      if (isDup) {
        // Safe Merge: If the standalone feedback has an image, preserve it in the merged output
        if (sf.image && existingDup && !existingDup.image) {
          existingDup.image = sf.image;
        }
      } else {
        allFeedbacks.push(sf);
      }
    });

    allFeedbacks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    workerObj.feedbacks = allFeedbacks;
    workerObj.totalReviews = allFeedbacks.length;
    if (allFeedbacks.length > 0) {
      const sum = allFeedbacks.reduce((acc, fb) => acc + (Number(fb.stars) || 0), 0);
      workerObj.rating = Number((sum / allFeedbacks.length).toFixed(1));
    } else {
      workerObj.rating = 0;
    }

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully!",
      worker: workerObj,
    });

  } catch (err) {
    console.error("Error adding feedback:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

export default router;