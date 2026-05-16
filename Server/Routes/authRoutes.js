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
import { handleUpload } from "../middleware/upload.js";   

const router = express.Router();

// AUTH
router.post("/login", login);

router.post(
  "/register",
  (req, res, next) => handleUpload("cvs", "cv")(req, res, next),   
  registerStudent
);

// PASSWORD RESET
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-otp", verifyOtp);

// PROFILE
router.get("/profile", protect, getProfile);

export default router;