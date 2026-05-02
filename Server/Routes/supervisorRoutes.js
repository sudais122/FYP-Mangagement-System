import express from "express";
import {
  getAllSupervisors,
  getSupervisorDetail,
  getMyStudents,
  createSupervisor
} from "../controllers/supervisorController.js";
import {
  protect,
  adminOnly,
  supervisorOnly,
} from "../middleware/auth.js";

const router = express.Router();

router.get ("/",          protect, adminOnly,      getAllSupervisors);
router.post("/", protect, adminOnly, createSupervisor);
router.get ("/students",  protect, supervisorOnly, getMyStudents);
router.get ("/:id",       protect, adminOnly,      getSupervisorDetail);

export default router;
