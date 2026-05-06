import express from "express";
import {
  approveWorker,
  rejectWorker,
  getAllWorkers,
  getAdminStats
} from "../Controllers/adminController.js";

const router = express.Router();

router.get("/workers", getAllWorkers);
router.put("/approve/:id", approveWorker);
router.put("/reject/:id", rejectWorker);
router.get("/stats", getAdminStats);

export default router;
