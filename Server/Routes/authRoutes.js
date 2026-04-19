import express from "express";
import { registerUser } from "../controllers/authController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/register", upload.single("cv"), registerUser);

export default router;