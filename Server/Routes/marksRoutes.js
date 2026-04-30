import express from "express";
import {
  saveMarks,
  getStudentMarks,
  getGroupMarks,
  getAllMarks,
} from "../controllers/marksController.js";
import {
  protect,
  adminOnly,
  adminOrSupervisor,
} from "../middleware/auth.js";

const router = express.Router();

router.post("/save",                   protect, adminOrSupervisor, saveMarks);
router.get ("/student/:studentId",     protect,                    getStudentMarks);
router.get ("/group/:groupId",         protect,                    getGroupMarks);
router.get ("/all",                    protect, adminOnly,         getAllMarks);

export default router;