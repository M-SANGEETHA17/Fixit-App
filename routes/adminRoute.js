import express from "express";
import {
  approveWorker,
  rejectWorker,
  getAllWorkers,
  getAdminStats,
  getAllUsers,
  updateUserStatus
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/workers", getAllWorkers);
router.get("/users", getAllUsers);
router.put("/users/status/:id", updateUserStatus);
router.put("/approve/:id", approveWorker);
router.put("/reject/:id", rejectWorker);
router.get("/stats", getAdminStats);

export default router;