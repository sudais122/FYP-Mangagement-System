import express from "express";
import { 
  addSupervisor, 
  getDashboardStats, 
  getAllStudentsForAdmin,
  getAllSupervisors,
  getAllGroups,
  adminSaveMarks,
  getGroupMarks,  
  deleteSupervisor,
  cleanupOrphanedTeams,
  deleteStudent,
  getMarkToggles,
  saveMarkToggles,
  updateSupervisor
} from "../controllers/adminController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Dashboard
router.get("/stats", protect, adminOnly, getDashboardStats);

// Supervisors
router.post("/supervisors", protect, adminOnly, addSupervisor);
router.get("/supervisors", protect, adminOnly, getAllSupervisors);
router.delete("/supervisors/:id", protect, adminOnly, deleteSupervisor, cleanupOrphanedTeams);
router.post("/supervisor",  protect, adminOnly, addSupervisor); 
router.put("/supervisors/:id", protect, adminOnly, updateSupervisor);
// Students
router.get("/students", protect, adminOnly, getAllStudentsForAdmin);
router.get("/marks/group/:groupId", protect, adminOnly, getGroupMarks); 
router.delete("/student/:id", protect, adminOnly, deleteStudent);

// Groups
router.get("/groups", protect, adminOnly, getAllGroups);

// Marks
router.put("/marks", protect, adminOnly, adminSaveMarks);

// Mark toggles
router.get("/mark-toggles", protect, adminOnly, getMarkToggles);
router.post("/mark-toggles", protect, adminOnly, saveMarkToggles);

export default router;