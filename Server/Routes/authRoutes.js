import express from "express";
import {
  login,
  registerStudent,
  forgotPassword,
  resetPassword,
  getProfile,
  verifyOtp,
} from "../controllers/authController.js";
import { protect }                  from "../middleware/auth.js";
import { handleRegistrationUpload } from "../middleware/upload.js";
import multer                       from "multer";
import {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
} from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/login", loginLimiter, login);

// ── Registration with CV + optional certificates ──
router.post("/register",
  registerLimiter,
  (req, res, next) => {
    const uploader = handleRegistrationUpload();
    uploader(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      }
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  registerStudent
);

router.post("/forgot-password",  forgotPasswordLimiter, forgotPassword);
router.post("/verify-otp",       forgotPasswordLimiter, verifyOtp);
router.post("/reset-password",   forgotPasswordLimiter, resetPassword);
router.get("/profile",           protect, getProfile);

export default router;