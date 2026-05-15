import express from "express";
import {
  uploadSupervisorAvatar,
  uploadStudentCV,
  uploadGroupProposal,
} from "../controllers/uploadController.js";
import { protect } from "../middleware/auth.js";
import { handleUpload } from "../middleware/upload.js";

const router = express.Router();

router.post("/supervisor/avatar",      protect, handleUpload("avatar",   "avatar"),   uploadSupervisorAvatar);
router.post("/student/cv",             protect, handleUpload("cv",       "cv"),       uploadStudentCV);
router.post("/group/:groupId/proposal",protect, handleUpload("proposal", "proposal"), uploadGroupProposal);

export default router;