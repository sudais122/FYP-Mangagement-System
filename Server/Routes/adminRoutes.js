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
  getSystemSettings,
  getAvailableBatches,
  exportStudentsExcel,
  exportSupervisorsExcel
} from "../controllers/adminController.js";
import { getSupervisorDetail } from "../controllers/supervisorController.js";
import { protect, adminOnly }  from "../middleware/auth.js";

const router = express.Router();

// ── Dashboard
router.get("/stats", protect, adminOnly, getDashboardStats);

// ── Supervisors
router.get   ("/supervisors",     protect, adminOnly, getAllSupervisors);
router.post  ("/supervisors",     protect, adminOnly, addSupervisor);
router.put   ("/supervisors/:id", protect, adminOnly, updateSupervisor);
router.delete("/supervisors/:id", protect, adminOnly, deleteSupervisor);
router.get   ("/supervisors/:id", protect, adminOnly, getSupervisorDetail);

// ── Students
router.get   ("/students",    protect, adminOnly, getAllStudentsForAdmin);
router.delete("/student/:id", protect, adminOnly, deleteStudent);

// ── Groups — frontend should call /api/admin/groups
router.get("/groups", protect, adminOnly, getAllGroups);

// ── Marks
router.get ("/marks/group/:groupId", protect, adminOnly, getGroupMarks);
router.post("/marks",                protect, adminOnly, adminSaveMarks);

// ── Mark Toggles
router.get ("/mark-toggles", protect, adminOnly, getMarkToggles);
router.post("/mark-toggles", protect, adminOnly, saveMarkToggles);

// ── Maintenance
router.get ("/maintenance", getMaintenanceStatus);
router.post("/maintenance", protect, adminOnly, toggleMaintenanceMode);

// ── Chairman Mode
router.post("/system/chairman-mode",        protect, adminOnly, toggleChairmanMode);
router.get ("/system/chairman-mode/public", getChairmanModePublic);

// ── Downloads
router.get("/download-proposals",   protect, adminOnly, downloadAllProposals);
router.get("/download-internships", protect, adminOnly, downloadInternships);

// ── System Settings
router.get("/system-settings", protect, adminOnly, getSystemSettings);

// ── Batch & Export
router.get("/batches",         protect, adminOnly, getAvailableBatches);
router.get("/export/students", protect, adminOnly, exportStudentsExcel);
router.get("/export/supervisors",   protect, adminOnly, exportSupervisorsExcel);  


export default router;