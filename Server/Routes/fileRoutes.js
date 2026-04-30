import express from "express";
import {
  uploadFile,
  getMyFiles,
  deleteFile,
} from "../controllers/fileController.js";
import { protect, studentOnly } from "../middleware/auth.js";
import { uploadFile as uploadMiddleware } from "../middleware/upload.js";

const router = express.Router();

router.post("/upload", protect, studentOnly, uploadMiddleware, uploadFile);
router.get ("/my",     protect, studentOnly, getMyFiles);
router.delete("/:id",  protect, studentOnly, deleteFile);

export default router;