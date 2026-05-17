import express from "express";
import {
  uploadSupervisorAvatar,
  uploadStudentCV,
  uploadGroupProposal,
  uploadAdminAvatar,
  updateProposalStatus
} from "../controllers/uploadController.js";

import { proposalUploadLimiter } from "../middleware/rateLimiter.js";
import { protect }               from "../middleware/auth.js";
import { handleUpload }          from "../middleware/upload.js";

const router = express.Router();

router.post("/admin/avatar",
  protect,
  handleUpload("avatar", "avatar"),
  uploadAdminAvatar
);

router.post("/supervisor/avatar",
  protect,
  handleUpload("avatar", "avatar"),
  uploadSupervisorAvatar
);

router.post("/student/cv",
  protect,
  handleUpload("cv", "cv"),
  uploadStudentCV
);

router.post("/group/:groupId/proposal",
  protect,
  proposalUploadLimiter,
  handleUpload("proposal", "proposal"),
  uploadGroupProposal
);

router.put("/:id/proposal-status",
  protect,
  updateProposalStatus
);

export default router;