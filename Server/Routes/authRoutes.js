import express from "express";
import upload from "../middleware/upload.js";
import { registerUser } from "../controllers/authController.js";

const router = express.Router();

router.post(
  "/register",
  upload.single("cv"),
  registerUser
);

export default router;