import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Use email if registering, user.id if already logged in, fallback to timestamp
    const identifier = req.user?.id 
                    || req.body?.email?.replace(/[^a-zA-Z0-9]/g, "_") 
                    || "anon";
    
    return {
      folder: "fyp-system/cvs",
      resource_type: "raw",
      allowed_formats: ["pdf", "doc", "docx"],
      public_id: `cv_${identifier}_${Date.now()}`,
    };
  },
});

export const uploadCV = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only PDF and DOCX files are allowed"), false);
  },
});

export default cloudinary;