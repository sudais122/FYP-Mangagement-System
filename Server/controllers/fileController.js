import File     from "../Models/file.js";
import Student  from "../Models/student.js";

// ── UPLOAD FILE (Student) ──────────────────────────────────────
export const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  try {
    const student = await Student.findById(req.user.id);
    if (!student.group) {
      return res.status(400).json({ message: "You must have a team first" });
    }

    const ext = req.file.originalname.split(".").pop().toLowerCase();
    let file_type = "Other";
    if (ext === "pdf" || ext === "docx" || ext === "doc") file_type = "Report";
    else if (["zip", "rar", "py", "js", "ts", "html", "css", "cpp", "java"].includes(ext)) file_type = "Code";
    else if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) file_type = "Documentation";

    const file = await File.create({
      student:           req.user.id,
      group:             student.group,
      original_filename: req.file.originalname,
      file_url:          req.file.path,
      file_public_id:    req.file.filename,
      file_type,
      file_size:         req.file.size,
      category:          req.body.category || "Other",
    });

    res.status(201).json({ message: "File uploaded", file });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET MY FILES ───────────────────────────────────────────────
export const getMyFiles = async (req, res) => {
  try {
    const files = await File.find({ student: req.user.id })
      .sort({ uploadedAt: -1 });
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── DELETE FILE ────────────────────────────────────────────────
export const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });
    if (file.student.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    // Delete from Cloudinary
    if (file.file_public_id) {
      const imageTypes = ["png", "jpg", "jpeg", "gif", "webp"];
      const ext = file.original_filename.split(".").pop().toLowerCase();
      await cloudinary.uploader.destroy(file.file_public_id, {
        resource_type: imageTypes.includes(ext) ? "image" : "raw",
      });
    }
    await File.findByIdAndDelete(req.params.id);
    res.json({ message: "File deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};