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
  updateSupervisor,
  saveMarks,
  getMaintenanceStatus,
  toggleMaintenanceMode,
  downloadAllProposals,
  downloadInternships,
  toggleChairmanMode,
  getChairmanModePublic,
  getSystemSettings
} from "../controllers/adminController.js";
import { getSupervisorDetail } from "../controllers/supervisorController.js";
import { protect }             from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Dashboard
router.get("/stats", getDashboardStats);

// ── Supervisors
router.get   ("/supervisors",        protect, getAllSupervisors);
router.post  ("/supervisors",        protect, addSupervisor);
router.put   ("/supervisors/:id",    protect, updateSupervisor);
router.delete("/supervisors/:id",    protect, deleteSupervisor);
router.get   ("/supervisors/:id",    protect, getSupervisorDetail);

// ── Students
router.get   ("/students",       protect, getAllStudentsForAdmin);
router.delete("/student/:id",    protect, deleteStudent);

// ── Groups
router.get("/groups", protect, getAllGroups);

// ── Marks
router.get ("/marks/group/:groupId", protect, getGroupMarks);
router.post("/marks",                protect, saveMarks);

// ── Mark toggles
router.get ("/mark-toggles",  protect, getMarkToggles);
router.post("/mark-toggles",  protect, saveMarkToggles);

// ── Maintenance
router.get ("/maintenance",   getMaintenanceStatus);
router.post("/maintenance",   protect, toggleMaintenanceMode);

// ── Chairman Analytics Mode
router.post("/system/chairman-mode",         protect, toggleChairmanMode);  
router.get ("/system/chairman-mode/public",  getChairmanModePublic);        

// ── Downloads
router.get("/download-proposals",   protect, downloadAllProposals);
router.get("/download-internships", protect, downloadInternships);

router.get("/system-settings", protect, getSystemSettings);
export default router;