import Proposal from "../Models/proposal.js";
import Student  from "../Models/student.js";
import cloudinary from "../config/cloudinary.js";

// ── SUBMIT PROPOSAL (Student) ──────────────────────────────────
export const submitProposal = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  try {
    const student = await Student.findById(req.user.id);
    if (!student.group) {
      return res.status(400).json({ message: "You must have a team first" });
    }

    // Check if a proposal already exists for this group
    const existing = await Proposal.findOne({ group: student.group });

    if (existing) {
      // Delete old file from Cloudinary
      if (existing.file_public_id) {
        await cloudinary.uploader.destroy(existing.file_public_id, {
          resource_type: "raw",
        });
      }
      // Update existing proposal
      existing.file_url       = req.file.path;
      existing.file_public_id = req.file.filename;
      existing.original_filename = req.file.originalname;
      existing.file_size      = req.file.size;
      existing.status         = "pending";
      existing.version        += 1;
      existing.submittedAt    = new Date();
      await existing.save();
      return res.json({ message: "Proposal re-submitted", proposal: existing });
    }

    // Create new proposal
    const proposal = await Proposal.create({
      group:             student.group,
      student:           req.user.id,
      supervisor:        req.body.supervisor_id,
      file_url:          req.file.path,
      file_public_id:    req.file.filename,
      original_filename: req.file.originalname,
      file_size:         req.file.size,
    });

    res.status(201).json({ message: "Proposal submitted", proposal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET MY PROPOSAL ────────────────────────────────────────────
export const getMyProposal = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student.group) {
      return res.status(404).json({ message: "No group found" });
    }
    const proposal = await Proposal.findOne({ group: student.group })
      .populate("student",    "name student_code")
      .populate("supervisor", "name sup_code");
    if (!proposal) {
      return res.json({ status: "idle", message: "No proposal submitted yet" });
    }
    res.json(proposal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── REVIEW PROPOSAL (Supervisor) ───────────────────────────────
export const reviewProposal = async (req, res) => {
  const { status, rejection_reason } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
  }
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: "Proposal not found" });

    proposal.status           = status;
    proposal.rejection_reason = rejection_reason || "";
    proposal.reviewedAt       = new Date();
    await proposal.save();

    res.json({ message: `Proposal ${status}`, proposal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET ALL PROPOSALS FOR SUPERVISOR ──────────────────────────
export const getProposalsBySupervisor = async (req, res) => {
  try {
    const proposals = await Proposal.find({ supervisor: req.user.id })
      .populate("student",  "name student_code")
      .populate("group",    "team_code project_title");
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};