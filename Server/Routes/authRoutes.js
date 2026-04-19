import express from "express";
import { 
  registerUser, 
  loginUser, 
  forgotPassword, 
  resetPassword,
  verifyOtp
} from "../controllers/authController.js";

import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/register", upload.single("cv"), registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-otp", verifyOtp);

export default router;