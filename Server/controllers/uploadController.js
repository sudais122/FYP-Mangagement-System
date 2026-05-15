import Supervisor from "../Models/supervisor.js";
import Student    from "../Models/student.js";
import Group      from "../Models/group.js";
import { deleteFromS3 } from "../utils/s3Delete.js";

// ── POST /api/supervisor/upload-avatar ──
export const uploadSupervisorAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const sup = await Supervisor.findById(req.user.id);
    if (!sup) return res.status(404).json({ message: "Supervisor not found" });

    // Delete old avatar from S3 if exists
    if (sup.avatar_url) await deleteFromS3(sup.avatar_url);

    sup.avatar_url = req.file.location; // full S3 URL
    await sup.save();

    res.json({ message: "Avatar updated successfully", avatar_url: sup.avatar_url });
  } catch (err) {
    console.error("Avatar upload error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/students/upload-cv ──
export const uploadStudentCV = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Delete old CV from S3
    if (student.cv_url) await deleteFromS3(student.cv_url);

    student.cv_url = req.file.location;
    await student.save();

    res.json({ message: "CV uploaded successfully", cv_url: student.cv_url });
  } catch (err) {
    console.error("CV upload error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/groups/:groupId/proposal ──
export const uploadGroupProposal = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const group = await Group.findById(req.params.groupId)
      .populate("leader members");
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Only leader or members can upload
    const studentId    = req.user.id;
    const isLeader     = group.leader?._id.toString() === studentId;
    const isMember     = group.members?.some(m => m._id.toString() === studentId);
    if (!isLeader && !isMember)
      return res.status(403).json({ message: "Not authorized to upload for this group" });

    // Delete old proposal from S3
    if (group.proposal_url) await deleteFromS3(group.proposal_url);

    group.proposal_url         = req.file.location;
    group.proposal_status      = "pending";
    group.proposal_uploaded_by = studentId;
    group.proposal_uploaded_at = new Date();
    group.proposal_filename    = req.file.originalname;
    await group.save();

    // Re-populate for response
    await group.populate("proposal_uploaded_by", "name student_code email");

    res.json({ message: "Proposal uploaded successfully", group });
  } catch (err) {
    console.error("Proposal upload error:", err);
    res.status(500).json({ message: err.message });
  }
};