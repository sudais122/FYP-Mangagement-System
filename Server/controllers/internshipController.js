import Internship from "../Models/internship.js";
import { createS3Client }       from "../config/s3.js";
import { DeleteObjectCommand }  from "@aws-sdk/client-s3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Helper: extract S3 key from full URL ───────────────────────
function extractS3Key(url) {
  try {
    const parsed = new URL(url);
    return decodeURIComponent(parsed.pathname.slice(1));
  } catch {
    return null;
  }
}

// ── Helper: delete file from S3 ────────────────────────────────
async function deleteS3File(url) {
  const key = extractS3Key(url);
  if (!key) return;
  try {
    await s3.send(new DeleteObjectCommand({
      Bucket: "fyp-management-system",
      Key:    key,
    }));
  } catch (err) {
    console.warn("S3 delete warning:", err.message);
  }
}

/* ════════════════════════════════════════════════════════════════
   PUBLIC — No login required
════════════════════════════════════════════════════════════════ */

// POST /api/internship/submit
export const submitAcceptanceLetter = async (req, res) => {
  try {
    const { full_name, cnic, discipline } = req.body;

    // ── Validation ──
    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ message: "Full name is required" });
    }
    if (!cnic || !/^\d{13}$/.test(cnic.trim())) {
      return res.status(400).json({ message: "CNIC must be exactly 13 digits without dashes" });
    }
    if (!discipline) {
      return res.status(400).json({ message: "Please select your discipline" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Acceptance letter file is required" });
    }

    // ── Save to DB ──
    const record = await Internship.create({
      full_name:                     full_name.trim(),
      cnic:                          cnic.trim(),
      discipline,
      acceptance_letter_url:         req.file.location,       
      acceptance_letter_filename:    req.file.key.split("/").pop(), 
      acceptance_letter_uploaded_at: new Date(),
      status:                        "submitted",
    });

    res.status(201).json({
      message: "Acceptance letter submitted successfully",
      data: {
        id:         record._id,
        full_name:  record.full_name,
        discipline: record.discipline,
        status:     record.status,
        submitted:  record.createdAt,
      },
    });

  } catch (err) {
    // Mongoose validation errors
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages[0] });
    }
    console.error("Submit acceptance letter error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/internship/download-letter
// Public route — generates and downloads the Word request letter
export const downloadRequestLetter = async (req, res) => {
  try {
    const filePath = path.join(__dirname, "../../Server/static/Internship_Letter.docx");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=AWKUM_Internship_Request_Letter.docx"
    );

    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("File send error:", err);
        res.status(500).json({ message: "Failed to send file" });
      }
    });

  } catch (err) {
    console.error("Download letter error:", err);
    res.status(500).json({ message: err.message });
  }
};
/* ════════════════════════════════════════════════════════════════
   ADMIN — Requires admin auth
════════════════════════════════════════════════════════════════ */

// GET /api/internship/admin/all
// Admin — get all internship submissions
export const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Internship.find()
      .sort({ createdAt: -1 })
      .populate("student", "name email student_code");

    res.json({
      total: submissions.length,
      data:  submissions,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/internship/admin/:id
// Admin — get one submission
export const getSubmissionById = async (req, res) => {
  try {
    const record = await Internship.findById(req.params.id)
      .populate("student", "name email student_code");

    if (!record) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/internship/admin/:id/status
// Admin — update submission status + add remarks
export const updateSubmissionStatus = async (req, res) => {
  try {
    const { status, admin_remarks } = req.body;

    const validStatuses = ["submitted", "under_review", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const record = await Internship.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status,
          ...(admin_remarks && { admin_remarks }),
        },
      },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.json({
      message: `Status updated to ${status}`,
      data:    record,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/internship/admin/:id
// Admin — delete a submission and remove file from S3
export const deleteSubmission = async (req, res) => {
  try {
    const record = await Internship.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Delete file from S3
    if (record.acceptance_letter_url) {
      await deleteS3File(record.acceptance_letter_url);
    }

    await Internship.findByIdAndDelete(req.params.id);

    res.json({ message: "Submission deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};