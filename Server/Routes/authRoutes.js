import express from "express";
import {
  login,
  registerStudent,
  forgotPassword,
  resetPassword,
  getProfile,
  verifyOtp
} from "../controllers/authController.js";
import { protect }      from "../middleware/auth.js";
import { handleUpload } from "../middleware/upload.js";
import {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
} from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/login",
  loginLimiter,
  login
);

router.post("/register",
  registerLimiter,
  (req, res, next) => handleUpload("cvs", "cv")(req, res, next),
  registerStudent
);

router.post("/forgot-password",  forgotPasswordLimiter, forgotPassword);
router.post("/verify-otp",       forgotPasswordLimiter, verifyOtp);
router.post("/reset-password",   forgotPasswordLimiter, resetPassword);

router.get("/profile", protect, getProfile);

export default router;