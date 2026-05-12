import Group   from "../Models/group.js";
import Student from "../Models/student.js";
import { sendEmail } from "../utils/sendEmail.js";
import { proposalApprovedTemplate } from "../utils/emailTemplates/proposalStatus.js";
import { proposalRejectedTemplate  } from "../utils/emailTemplates/proposalStatus.js";
import path    from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── UPLOAD PROPOSAL ───────────────────────────────────────────
export const uploadProposal = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Proposal file is required" });
    }

    const studentId = req.user.id;
    const student   = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const group = await Group.findById(student.group)
      .populate("leader",  "name student_code email")
      .populate("members", "name student_code email");

    if (!group) return res.status(404).json({ message: "You are not in a team" });

    // Save proposal info
    group.proposal_url         = `/uploads/proposals/${req.file.filename}`;
    group.proposal_public_id   = req.file.filename;
    group.proposal_status      = "pending";
    group.proposal_uploaded_by = studentId;
    group.proposal_uploaded_at = new Date();
    group.proposal_rejection_reason = null;

    await group.save();

    // Re-fetch with uploader populated
    const updatedGroup = await Group.findById(group._id)
      .populate("proposal_uploaded_by", "name student_code email");

    res.json({
      message: "Proposal uploaded successfully",
      group: {
        proposal_url:         updatedGroup.proposal_url,
        proposal_status:      updatedGroup.proposal_status,
        proposal_uploaded_at: updatedGroup.proposal_uploaded_at,
        proposal_uploaded_by: updatedGroup.proposal_uploaded_by,
      }
    });

  } catch (err) {
    console.error("Upload proposal error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── UPDATE PROPOSAL STATUS (Admin only) ───────────────────────
export const updateProposalStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const { groupId } = req.params;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const group = await Group.findById(groupId)
      .populate("leader",  "name email student_code")
      .populate("members", "name email student_code");

    if (!group) return res.status(404).json({ message: "Group not found" });

    group.proposal_status = status;
    if (status === "rejected" && reason) {
      group.proposal_rejection_reason = reason;
    } else {
      group.proposal_rejection_reason = null;
    }

    await group.save();

    // Collect all members + leader emails
    const allMembers = [
      group.leader,
      ...(group.members || [])
    ].filter(Boolean);

    // Send email to each member
    for (const member of allMembers) {
      const { subject, html } = status === "approved"
        ? proposalApprovedTemplate({
            studentName:  member.name,
            groupCode:    group.group_code,
            projectTitle: group.project_title
          })
        : proposalRejectedTemplate({
            studentName:  member.name,
            groupCode:    group.group_code,
            projectTitle: group.project_title,
            reason:       reason || ""
          });

      sendEmail({ to: member.email, subject, html }).then(r => {
        if (!r.success) console.warn(`Email failed for ${member.email}:`, r.error);
      });
    }

    res.json({
      message: `Proposal ${status}`,
      group: {
        _id:             group._id,
        proposal_status: group.proposal_status,
        proposal_rejection_reason: group.proposal_rejection_reason
      }
    });

  } catch (err) {
    console.error("Update proposal status error:", err);
    res.status(500).json({ message: err.message });
  }
};