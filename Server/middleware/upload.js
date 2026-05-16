import multer    from "multer";
import multerS3  from "multer-s3";
import path      from "path";
import { createS3Client } from "../config/s3.js";

const FILE_SIZE_LIMITS = {
  avatar:   3  * 1024 * 1024,
  cv:       5  * 1024 * 1024,
  proposal: 20 * 1024 * 1024,
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
      key: (req, file, cb) => {
        const ext  = path.extname(file.originalname).toLowerCase();
        const name = `${folder}/${Date.now()}-${req.user?.id || "anon"}${ext}`;
        cb(null, name);
      },
    }),
    limits: {
      fileSize: FILE_SIZE_LIMITS[folder] || 10 * 1024 * 1024,
    },
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