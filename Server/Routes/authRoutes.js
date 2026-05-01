import express from "express";
import {
  login,
  registerStudent,
  forgotPassword,
  resetPassword,
  getProfile
} from "../controllers/authController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

/* ================= AUTH ================= */
router.post("/login", login);
router.post("/register", registerStudent);

/* ================= PASSWORD RESET (NEW SYSTEM) ================= */
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

/* ================= PROFILE ================= */
router.get("/profile", protect, getProfile);

export default router;