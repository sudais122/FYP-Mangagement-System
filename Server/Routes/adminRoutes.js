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
  toggleMaintenanceMode
} from "../controllers/adminController.js";
import { getSupervisorDetail } from "../controllers/supervisorController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();


// Dashboard
router.get("/stats", getDashboardStats);

// Supervisors
router.get("/supervisors",        getAllSupervisors);
router.post("/supervisors",       addSupervisor);
router.put("/supervisors/:id",    updateSupervisor);
router.delete("/supervisors/:id", deleteSupervisor, cleanupOrphanedTeams);
router.get("/supervisors/:id",    getSupervisorDetail);

// Students
router.get("/students",           getAllStudentsForAdmin);
router.delete("/student/:id",     deleteStudent);

// Groups
router.get("/groups",             getAllGroups);

// Marks
router.get("/marks/group/:groupId", getGroupMarks);
router.post("/marks",               saveMarks);    

// Mark toggles
router.get("/mark-toggles",       getMarkToggles);
router.post("/mark-toggles",      saveMarkToggles);

//Miaintance
router.get("/maintenance",  getMaintenanceStatus);           
router.post("/maintenance", protect, toggleMaintenanceMode); 
export default router;