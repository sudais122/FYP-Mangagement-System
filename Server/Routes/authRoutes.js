import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import upload from "../middleware/upload.js"; 

const router = express.Router();

router.post("/register", upload.single("cv"), registerUser);
router.post("/login", loginUser);

export default router;