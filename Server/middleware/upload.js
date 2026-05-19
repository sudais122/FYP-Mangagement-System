import multer   from "multer";
import multerS3 from "multer-s3";
import path     from "path";
import Group    from "../Models/group.js";
import { createS3Client } from "../config/s3.js";

const FILE_SIZE_LIMITS = {
  avatar:   3  * 1024 * 1024,
  cv:       5  * 1024 * 1024,
  proposal: 20 * 1024 * 1024,
};

const proposalFileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed for proposals"), false);
  }
};

function makeUploader(folder, fieldName) {
  const BUCKET = process.env.AWS_BUCKET_NAME;
  if (!BUCKET) throw new Error("AWS_BUCKET_NAME is not set in .env");

  const s3 = createS3Client();

  return multer({
    storage: multerS3({
      s3,
      bucket:      BUCKET,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: async (req, file, cb) => {
        try {
          if (folder === "proposal") {
            const groupId = req.params.groupId || req.params.id;

            // ── fetch team_code + attempt + status ──
            const group = await Group.findById(groupId)
              .select("team_code proposal_attempt proposal_status");

            const code      = group?.team_code || `TEAM-${Date.now()}`;
            const attempt   = (group?.proposal_status === "rejected")
              ? (group.proposal_attempt || 1) + 1
              : (group?.proposal_attempt || 1);
            const timestamp = Date.now();

            // ── unique key per attempt ──
            // e.g. proposals/TEAM-20260001-attempt1-1716000000000.pdf
            cb(null, `proposals/${code}-attempt${attempt}-${timestamp}.pdf`);
            return;
          }

          // ── other uploads ──
          const ext  = path.extname(file.originalname).toLowerCase();
          const name = `${folder}/${Date.now()}-${req.user?.id || "anon"}${ext}`;
          cb(null, name);

        } catch (err) {
          cb(err);
        }
      },
    }),
    limits: {
      fileSize: FILE_SIZE_LIMITS[folder] || 10 * 1024 * 1024,
    },
    fileFilter: folder === "proposal" ? proposalFileFilter : undefined,
  }).single(fieldName);
}

export function handleUpload(folder, fieldName) {
  return (req, res, next) => {
    const uploader = makeUploader(folder, fieldName);
    uploader(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      }
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  };
}