import express from "express";
import {
  saveMarks,
} from "../controllers/marksController.js";
import {
  protect,
  adminOnly,
  adminOrSupervisor,
} from "../middleware/auth.js";

const router = express.Router();

router.post("/save",                   protect, adminOrSupervisor, saveMarks);

export default router;