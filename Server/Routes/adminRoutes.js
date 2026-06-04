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
import { getSupervisorDetail }        from "../controllers/supervisorController.js";
import { protect, adminOnly }         from "../middleware/auth.js";

const router = express.Router();

// ── Dashboard
router.get("/stats", getDashboardStats);

// ── Supervisors
router.get   ("/supervisors",     protect, adminOnly, getAllSupervisors);
router.post  ("/supervisors",     protect, adminOnly, addSupervisor);
router.put   ("/supervisors/:id", protect, adminOnly, updateSupervisor);
router.delete("/supervisors/:id", protect, adminOnly, deleteSupervisor);
router.get   ("/supervisors/:id", protect, adminOnly, getSupervisorDetail);

// ── Students
router.get   ("/students",    protect, adminOnly, getAllStudentsForAdmin);
router.delete("/student/:id", protect, adminOnly, deleteStudent);

// ── Groups
router.get("/groups", protect, adminOnly, getAllGroups);

// ── Marks
router.get ("/marks/group/:groupId", protect, adminOnly, getGroupMarks);
router.post("/marks",                protect, adminOnly, adminSaveMarks);

// ── Mark toggles
router.get ("/mark-toggles", protect, adminOnly, getMarkToggles);
router.post("/mark-toggles", protect, adminOnly, saveMarkToggles);

// ── Maintenance
router.get ("/maintenance", getMaintenanceStatus);
router.post("/maintenance", protect, adminOnly, toggleMaintenanceMode);

// ── Chairman Analytics Mode
router.post("/system/chairman-mode",        protect, adminOnly, toggleChairmanMode);
router.get ("/system/chairman-mode/public", getChairmanModePublic);

// ── Downloads
router.get("/download-proposals",   protect, adminOnly, downloadAllProposals);
router.get("/download-internships", protect, adminOnly, downloadInternships);

// ── System settings
router.get("/system-settings", protect, adminOnly, getSystemSettings);

export default router;