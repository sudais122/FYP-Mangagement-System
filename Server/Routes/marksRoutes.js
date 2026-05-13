import express from "express";
import {
  saveMarks,
  getGroupMarks,
  getStudentMarks,
  getAllMarks,
} from "../controllers/marksController.js";
import {
  protect,
  adminOnly,
  adminOrSupervisor,
} from "../middleware/auth.js";

const router = express.Router();

router.post("/save",              protect, adminOrSupervisor, saveMarks);
router.get("/group/:groupId",     protect, adminOrSupervisor, getGroupMarks);
router.get("/student/:studentId", protect, adminOrSupervisor, getStudentMarks);
router.get("/",                   protect, adminOnly,         getAllMarks);

export default router;