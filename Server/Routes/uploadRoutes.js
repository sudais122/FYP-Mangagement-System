import express from "express";

import {
  uploadSupervisorAvatar,
  uploadStudentCV,
  uploadGroupProposal,
  uploadAdminAvatar,
  updateProposalStatus
} from "../controllers/uploadController.js";

import { protect } from "../middleware/auth.js";
import { handleUpload } from "../middleware/upload.js";

const router = express.Router();

// UPLOAD ROUTES
router.post(
  "/admin/avatar",
  protect,
  handleUpload("avatar", "avatar"),
  uploadAdminAvatar
);

router.post(
  "/supervisor/avatar",
  protect,
  handleUpload("avatar", "avatar"),
  uploadSupervisorAvatar
);

router.post(
  "/student/cv",
  protect,
  handleUpload("cv", "cv"),
  uploadStudentCV
);

router.post(
  "/group/:groupId/proposal",
  protect,
  handleUpload("proposal", "proposal"),
  uploadGroupProposal
);

// PROPOSAL STATUS UPDATE (ADMIN ONLY)
router.put(
  "/:id/proposal-status",protect,updateProposalStatus
);

export default router;