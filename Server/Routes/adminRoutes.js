import express from "express";
import {
  addSupervisor,
  getDashboardStats,
  getAllStudents,
  adminSaveMarks,
  deleteSupervisor,
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get ("/stats",              protect, adminOnly, getDashboardStats);
router.post("/supervisor",         protect, adminOnly, addSupervisor);
router.get ("/students",           protect, adminOnly, getAllStudents);
router.post("/marks",              protect, adminOnly, adminSaveMarks);
router.delete("/supervisor/:id",   protect, adminOnly, deleteSupervisor);

export default router;