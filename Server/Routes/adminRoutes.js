// routes/adminRoutes.js
import express from "express";
import { 
  addSupervisor, 
  getDashboardStats, 
  getAllStudents,
  getAllSupervisors,
  getAllGroups,
  adminSaveMarks,
  deleteSupervisor 
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Dashboard stats
router.get("/stats", protect, adminOnly, getDashboardStats);

// Supervisors
router.post("/supervisors", protect, adminOnly, addSupervisor);
router.get("/supervisors", protect, adminOnly, getAllSupervisors);
router.delete("/supervisors/:id", protect, adminOnly, deleteSupervisor);
router.post("/supervisor", protect, adminOnly, addSupervisor);

// Students
router.get("/students", protect, adminOnly, getAllStudents);

// Groups/Teams
router.get("/groups", protect, adminOnly, getAllGroups);

// Marks
router.put("/marks", protect, adminOnly, adminSaveMarks);

export default router;