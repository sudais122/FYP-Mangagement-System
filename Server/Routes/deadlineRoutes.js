import express from "express";
import {
  createDeadline,
  getAllDeadlines,
  updateDeadline,
  deleteDeadline,
} from "../controllers/deadlineController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAllDeadlines);
router.post("/", protect, adminOnly, createDeadline);
router.put("/:id", protect, adminOnly, updateDeadline);
router.delete("/:id", protect, adminOnly, deleteDeadline);

export default router;
