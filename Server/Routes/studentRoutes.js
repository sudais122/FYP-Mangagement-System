import express from "express";
import {
  searchStudent,
  getMyMarks,
  getTeamMarks,
  getMyProfile,
  getMyDashboard
} from "../controllers/studentController.js";
import { protect, studentOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/search",    protect, studentOnly, searchStudent);
router.get("/my-marks",  protect, studentOnly, getMyMarks);
router.get("/team-marks",protect, studentOnly, getTeamMarks);
router.get("/dashboard", protect, getMyDashboard);
router.get("/profile",   protect, studentOnly, getMyProfile);

export default router;