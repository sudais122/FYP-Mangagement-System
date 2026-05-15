import Supervisor from "../Models/supervisor.js";
import Student    from "../Models/student.js";
import Group      from "../Models/group.js";
import { deleteFromS3 } from "../utils/s3Delete.js";
import Admin from "../Models/admin.js";

// ── POST /api/supervisor/upload-avatar ──
export const uploadSupervisorAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const sup = await Supervisor.findById(req.user.id);
    if (!sup) return res.status(404).json({ message: "Supervisor not found" });

    if (sup.avatar_url) await deleteFromS3(sup.avatar_url);

    sup.avatar_url = req.file.location;
    await sup.save();

    res.json({ message: "Avatar updated successfully", avatar_url: sup.avatar_url });
  } catch (err) {
    console.error("Avatar upload error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const uploadAdminAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const admin = await Admin.findById(req.user.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (admin.avatar_url) await deleteFromS3(admin.avatar_url);

    admin.avatar_url = req.file.location;
    await admin.save();

    res.json({ message: "Avatar updated successfully", avatar_url: admin.avatar_url });
  } catch (err) {
    console.error("Admin avatar upload error:", err);
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

    // Verify uploader is leader or member
    const studentId = req.user.id;
    const isLeader  = group.leader?._id.toString() === studentId;
    const isMember  = group.members?.some(m => m._id.toString() === studentId);
    if (!isLeader && !isMember)
      return res.status(403).json({ message: "Not authorized to upload for this group" });

    // If previous proposal exists (currently uploaded), delete from S3 first
    if (group.proposal_url && !group.proposal_file_deleted) {
      await deleteFromS3(group.proposal_url);
    }

    // Determine attempt number
    // If previous was rejected → increment; if first time or replacing pending → keep
    let attemptNumber = group.proposal_attempt || 1;
    if (group.proposal_status === "rejected") {
      attemptNumber = (group.proposal_attempt || 1) + 1;
    }

    group.proposal_url             = req.file.location;
    group.proposal_filename        = req.file.originalname;
    group.proposal_status          = "pending";
    group.proposal_uploaded_by     = studentId;
    group.proposal_uploaded_at     = new Date();
    group.proposal_attempt         = attemptNumber;
    group.proposal_rejected_at     = null;
    group.proposal_rejection_reason = null;
    group.proposal_file_deleted    = false;

    await group.save();
    await group.populate("proposal_uploaded_by", "name student_code email");

    res.json({ message: "Proposal uploaded successfully", group });
  } catch (err) {
    console.error("Proposal upload error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const updateProposalStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    if (!["approved", "rejected"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!group.proposal_url)
      return res.status(400).json({ message: "No proposal to review" });

    if (status === "approved") {
      group.proposal_status = "approved";
      await group.save();
      return res.json({ message: "Proposal approved", group });
    }

    // REJECTION — delete file from S3 and record history
    const fileUrl    = group.proposal_url;
    const filename   = group.proposal_filename;
    const uploadedAt = group.proposal_uploaded_at;
    const attempt    = group.proposal_attempt;

    // Delete from S3
    if (fileUrl) await deleteFromS3(fileUrl);

    // Push current attempt to history
    group.proposal_history.push({
      attempt,
      proposal_url:   fileUrl,
      filename,
      uploaded_at:    uploadedAt,
      rejected_at:    new Date(),
      rejection_reason: reason || "",
      file_deleted:   true,
    });

    // Mark current proposal as rejected — but keep status so student knows to resubmit
    group.proposal_status          = "rejected";
    group.proposal_rejected_at     = new Date();
    group.proposal_rejection_reason = reason || "";
    group.proposal_file_deleted    = true;
    group.proposal_url             = null; 
    group.proposal_filename        = null;

    await group.save();
    res.json({ message: "Proposal rejected — file deleted from S3", group });
  } catch (err) {
    console.error("Proposal status update error:", err);
    res.status(500).json({ message: err.message });
  }
};