import express from "express";
import {
  login,
  registerStudent,
  forgotPassword,
  resetPassword,
  getProfile,
  verifyOtp
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { uploadCVLocal } from "../middleware/localUpload.js";   // ← changed

const router = express.Router();

/* ================= AUTH ================= */
router.post("/login", login);
router.post("/register", uploadCVLocal.single("cv"), registerStudent);   // ← changed

/* ================= PASSWORD RESET ================= */
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-otp", verifyOtp);

/* ================= PROFILE ================= */
router.get("/profile", protect, getProfile);

export default router;