import express from "express";
import {
  login,
  registerStudent,
  forgotPassword,
  resetPassword,
  getProfile
} from "../controllers/authController.js";

import { protect } from "../middleware/auth.js";
import { uploadCV } from "../config/cloudinary.js";

const router = express.Router();

/* ================= AUTH ================= */
router.post("/login", login);
router.post("/register", uploadCV.single("cv"), registerStudent);

/* ================= PASSWORD RESET ================= */
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

/* ================= PROFILE ================= */
router.get("/profile", protect, getProfile);

export default router;