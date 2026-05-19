import multer from "multer";
import path   from "path";
import fs     from "fs";
import Group  from "../Models/group.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../uploads/proposals");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    async (req, file, cb) => {
    try {
      const groupId = req.params.groupId || req.params.id;
      const group   = await Group.findById(groupId).select("team_code");
      const code    = group?.team_code || `TEAM-${Date.now()}`;
      cb(null, `${code}.pdf`);
    } catch (err) {
      cb(err);
    }
  }
});

// ── PDF only ──
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

export const uploadProposal = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }
});