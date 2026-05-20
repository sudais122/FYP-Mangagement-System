import express        from "express";
import multer         from "multer";
import multerS3       from "multer-s3";
import { createS3Client } from "../config/s3.js";
import { protect }    from "../middleware/auth.js";
import Internship     from "../Models/internship.js";

import {
  submitAcceptanceLetter,
  downloadRequestLetter,
  getAllSubmissions,
  getSubmissionById,
  updateSubmissionStatus,
  deleteSubmission,
} from "../controllers/internshipController.js";

const router = express.Router();

let _upload = null;

function getUpload() {
  if (!_upload) {
    _upload = multer({
      storage: multerS3({
        s3:          createS3Client(),
        bucket:      process.env.AWS_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
          const safeName = file.originalname
            .replace(/[^a-zA-Z0-9._-]/g, "_")
            .toLowerCase();
          cb(null, `internships/acceptance/${Date.now()}-${safeName}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        file.mimetype === "application/pdf"
          ? cb(null, true)
          : cb(new Error("Only PDF files are allowed"), false);
      },
    });
  }
  return _upload;
}

/* ── PUBLIC ─────────────────────────────────────── */
router.get("/download-letter", downloadRequestLetter);

router.post(
  "/submit",
  (req, res, next) => getUpload().single("acceptance_letter")(req, res, next),
  submitAcceptanceLetter
);

/* ── STUDENT — view own submission ──────────────── */
router.get("/my", protect, async (req, res) => {
  try {
    const submission = await Internship.findOne({ student: req.user.id })
      .select("full_name discipline status acceptance_letter_url createdAt");
    if (!submission) return res.json({ found: false, submission: null });
    res.json({ found: true, submission });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── ADMIN ──────────────────────────────────────── */
router.get("/admin/all",        protect, getAllSubmissions);
router.get("/admin/:id",        protect, getSubmissionById);
router.put("/admin/:id/status", protect, updateSubmissionStatus);
router.delete("/admin/:id",     protect, deleteSubmission);

export default router;
