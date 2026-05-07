import express from "express";
import {
  getAllSupervisors,
  getAvailableSupervisors,
  getSupervisorDetail,
  getMyStudents,
  changePassword,
  getMarkTogglesForSupervisor,
  getDepartmentOverview
} from "../controllers/supervisorController.js";
import {
  protect,
  adminOnly,
  supervisorOnly,
} from "../middleware/auth.js";

const router = express.Router();

// ── PUBLIC to ALL logged-in users (students need this for setup) ──
router.get("/available", protect, getAvailableSupervisors);

// ── Supervisor routes ──
router.get("/students",  protect, supervisorOnly, getMyStudents);
router.put("/change-password", protect, supervisorOnly, changePassword);
router.get('/mark-toggles', protect, getMarkTogglesForSupervisor);
router.get("/mark-toggles", protect, supervisorOnly, getMarkTogglesForSupervisor);
router.get('/mark-toggles', protect, getMarkTogglesForSupervisor);

// ── Admin only routes ──
router.get("/",          protect, adminOnly, getAllSupervisors);
router.get("/:id",       protect, adminOnly, getSupervisorDetail);

// Chairman-only routes
router.get("/chairman/overview", protect, getDepartmentOverview);
export default router;