import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true,
  },
  original_filename: {
    type: String,
    required: true,
  },
  file_url: {
    type: String,
    required: true,
  },
  file_public_id: String, // Cloudinary ID for deletion
  file_type: {
    type: String, // pdf, docx, zip, image, code
  },
  file_size: Number, // in bytes
  category: {
    type: String,
    enum: ["Report", "Code", "Documentation", "Other"],
    default: "Other",
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const File = mongoose.model("File", fileSchema);
export default File;