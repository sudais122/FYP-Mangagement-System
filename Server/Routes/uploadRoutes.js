import express           from "express";
import { getPresignedUrl } from "../utils/s3GetSignedUrl.js";
import {
  uploadSupervisorAvatar,
  uploadStudentCV,
  uploadGroupProposal,
  uploadAdminAvatar,
  updateProposalStatus,
} from "../controllers/uploadController.js";
import { proposalUploadLimiter } from "../middleware/rateLimiter.js";
import { protect }               from "../middleware/auth.js";
import { handleUpload }          from "../middleware/upload.js";

const router = express.Router();

// ── Avatar uploads ─────────────────────────────────────────────
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

// ── CV upload ──────────────────────────────────────────────────
router.post("/student/cv",
  protect,
  handleUpload("cv", "cv"),
  uploadStudentCV
);

// ── Proposal upload ────────────────────────────────────────────
router.post("/group/:groupId/proposal",
  protect,
  proposalUploadLimiter,
  handleUpload("proposal", "proposal"),
  uploadGroupProposal
);

// ── Proposal status ────────────────────────────────────────────
router.put("/:id/proposal-status",
  protect,
  updateProposalStatus
);

router.get("/signed-url", protect, async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ message: "url is required" });
    const signedUrl = await getPresignedUrl(url, 300);
    res.json({ signedUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;