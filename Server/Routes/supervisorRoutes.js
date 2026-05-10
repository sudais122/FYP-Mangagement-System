import express from "express";
import {
  getAllSupervisors,
  getAvailableSupervisors,
  getSupervisorDetail,
  getMyStudents,
  changePassword,
  getMarkTogglesForSupervisor,
  getDepartmentOverview,
  getWorkloadPerSupervisor,
  getAllStudentsForChairman,
  getAllTeamsForChairman,
  getGroupMarks
} from "../controllers/supervisorController.js";
import { protect, adminOnly, supervisorOnly } from "../middleware/auth.js";

const router = express.Router();

// ── PUBLIC to ALL logged-in users ──
router.get("/available", protect, getAvailableSupervisors);

// ── Supervisor routes ──
router.get("/students",  protect, supervisorOnly, getMyStudents);
router.put("/change-password", protect, supervisorOnly, changePassword);
router.get("/mark-toggles", protect, supervisorOnly, getMarkTogglesForSupervisor);

// ── Chairman-only routes ──
router.get("/chairman/overview",   protect, supervisorOnly, getDepartmentOverview);
router.get("/chairman/workload",   protect, supervisorOnly, getWorkloadPerSupervisor);
router.get("/chairman/students",   protect, supervisorOnly, getAllStudentsForChairman);
router.get("/chairman/teams",      protect, supervisorOnly, getAllTeamsForChairman);
router.get("/my-groups", protect, getGroupMarks);
router.get("/marks/group/:groupId", protect, getGroupMarks);
// ── Admin-only routes ──
router.get("/",     protect, adminOnly, getAllSupervisors);
router.get("/:id",  protect, adminOnly, getSupervisorDetail);

export default router;