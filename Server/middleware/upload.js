import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";


const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "fyp_uploads",
    resource_type: "auto",
    allowed_formats: [
      "pdf",
      "doc",
      "docx",
      "zip"
    ]
  }
});

const upload = multer({
  storage
});
export default upload;