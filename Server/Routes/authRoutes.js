import express from "express";
import {
  login,
  registerStudent,
  changePassword,
  getProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/login",    login);
router.post("/register", registerStudent);
router.put ("/change-password", protect, changePassword);
router.get ("/profile",         protect, getProfile);

export default router;