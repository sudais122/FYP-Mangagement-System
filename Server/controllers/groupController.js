import Group from "../Models/group.js";
import Student from "../Models/student.js";
import Marks from "../Models/marks.js";
import cloudinary from "../config/cloudinary.js";

// ── TEAM ID GENERATOR ─────────────────────────────
const generateTeamId = async () => {
  const groupCount = await Group.countDocuments();
  const sequentialNumber = (groupCount + 1).toString().padStart(4, '0');
  const year = new Date().getFullYear();
  return `TEAM-${year}${sequentialNumber}`;  // ← REMOVE "2026", use ${year}
};

// ── CREATE TEAM ───────────────────────────────────
export const createGroup = async (req, res) => {
  const { project_title, category, member_codes, supervisor_id } = req.body;
  const leaderId = req.user.id;

  if (!project_title) {
    return res.status(400).json({ message: "Project title is required" });
  }

  try {
    const leader = await Student.findById(leaderId);

    if (!leader) {
      return res.status(404).json({ message: "Leader not found" });
    }

    if (leader.group) {
      return res.status(400).json({ message: "You already belong to a team" });
    }

    // ── RESOLVE MEMBERS ───────────────────────────
    let memberIds = [];

    if (member_codes?.length > 0) {
      if (member_codes.length > 2) {
        return res.status(400).json({ message: "Maximum 2 members allowed" });
      }

      for (const code of member_codes) {
        const member = await Student.findOne({ student_code: code });

        if (!member) {
          return res.status(404).json({ message: `Student ${code} not found` });
        }

        if (member.group) {
          return res.status(400).json({ message: `${member.name} already in a team` });
        }

        memberIds.push(member._id);
      }
    }

    // ── CREATE GROUP ──────────────────────────────
    const group = await Group.create({
      group_code:  await generateTeamId(),
      project_title,
      category,
      leader: leaderId,
      members: memberIds,
      supervisor: supervisor_id || null,
      academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    });

    // ── UPDATE LEADER ─────────────────────────────
    await Student.findByIdAndUpdate(leaderId, {
      group: group._id,
      team_role: "Leader",
    });

    // ── UPDATE MEMBERS ────────────────────────────
    for (const mid of memberIds) {
      await Student.findByIdAndUpdate(mid, {
        group: group._id,
        team_role: "Member",
      });
    }

    // ── INIT MARKS ────────────────────────────────
    const allStudents = [leaderId, ...memberIds];

    for (const sid of allStudents) {
  await Marks.findOneAndUpdate(
    { student: sid, group: group._id },
    { student: sid, group: group._id, supervisor: supervisor_id },
    { upsert: true, new: true }
  );
}

    // ── RESPONSE ───────────────────────────────────
    const populated = await Group.findById(group._id)
      .populate("leader",   "name student_code")
      .populate("members",  "name student_code")
      .populate("supervisor", "name sup_code email designation research_areas office office_hours");

    res.status(201).json({
      message: "Group created successfully",
      group: populated,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET NEXT TEAM ID ───────────────────────────────
export const getNextTeamId = async (req, res) => {
  try {
    const groupCount = await Group.countDocuments();
    const sequentialNumber = (groupCount + 1).toString().padStart(4, '0');
    const year = new Date().getFullYear();
    const nextId = `TEAM-${year}${sequentialNumber}`;
    
    res.json({ team_id: nextId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET MY GROUP ───────────────────────────────────────────────
export const getMyGroup = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student || !student.group) {
      return res.status(404).json({ hasGroup: false, message: "No team found" });
    }

    const group = await Group.findById(student.group)
      .populate("leader", "name student_code email")
      .populate("members", "name student_code email")
      .populate("supervisor", "name sup_code email office office_hours research_areas")
      .populate("proposal_uploaded_by", "name student_code");  // ← add this

    res.json({ hasGroup: true, group });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// UPLOAD/REPLACE TEAM PROPOSAL 
export const uploadProposal = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const student = await Student.findById(req.user.id);
    if (!student || !student.group) {
      // Clean up the just-uploaded file
      await cloudinary.uploader.destroy(req.file.filename, { resource_type: "raw" });
      return res.status(400).json({ message: "You are not in a team" });
    }

    const group = await Group.findById(student.group);
    if (!group) {
      await cloudinary.uploader.destroy(req.file.filename, { resource_type: "raw" });
      return res.status(404).json({ message: "Team not found" });
    }

    // Verify the uploader is actually a member of this team
    const isLeader  = group.leader.toString() === student._id.toString();
    const isMember  = group.members.some(m => m.toString() === student._id.toString());
    if (!isLeader && !isMember) {
      await cloudinary.uploader.destroy(req.file.filename, { resource_type: "raw" });
      return res.status(403).json({ message: "You are not a member of this team" });
    }

    // Delete old proposal if it exists
    if (group.proposal_public_id) {
      await cloudinary.uploader.destroy(group.proposal_public_id, { resource_type: "raw" });
    }

    // Save new one
    group.proposal_url         = req.file.path;
    group.proposal_public_id   = req.file.filename;
    group.proposal_filename    = req.file.originalname;
    group.proposal_uploaded_by = student._id;
    group.proposal_uploaded_at = new Date();
    group.proposal_status      = "pending";
    await group.save();

    const populated = await Group.findById(group._id)
      .populate("proposal_uploaded_by", "name student_code");

    res.json({
      message: "Proposal uploaded successfully",
      proposal: {
        url:          populated.proposal_url,
        filename:     populated.proposal_filename,
        status:       populated.proposal_status,
        uploaded_by:  populated.proposal_uploaded_by,
        uploaded_at:  populated.proposal_uploaded_at,
      },
    });
  } catch (error) {
    console.error("Proposal upload error:", error);
    if (req.file?.filename) {
      await cloudinary.uploader.destroy(req.file.filename, { resource_type: "raw" });
    }
    res.status(500).json({ message: error.message });
  }
};
// ── GET ALL GROUPS (Supervisor — only theirs) ──────────────────
export const getGroupsBySupervisor = async (req, res) => {
  try {
    const groups = await Group.find({ supervisor: req.user.id })
      .populate("leader",  "name student_code email whatsapp")   
      .populate("members", "name student_code email whatsapp");   
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD MEMBER TO EXISTING GROUP
// ── ADD MEMBER TO EXISTING GROUP (Leader only) ─────────────
export const addMemberToGroup = async (req, res) => {
  const { student_code } = req.body;
  const groupId  = req.params.id;
  const leaderId = req.user.id;

  if (!student_code) {
    return res.status(400).json({ message: "Student code is required" });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Only the team leader can add members
    if (group.leader.toString() !== leaderId) {
      return res.status(403).json({ message: "Only the team leader can add members" });
    }

    // Max 3 students total (1 leader + 2 members)
    if (group.members.length >= 2) {
      return res.status(400).json({ message: "Team is already full (max 2 additional members)" });
    }

    // Find the new student
    const newMember = await Student.findOne({ student_code });
    if (!newMember) {
      return res.status(404).json({ message: `Student ${student_code} not found` });
    }

    // Check they're not already in a team
    if (newMember.group) {
      return res.status(400).json({ message: `${newMember.name} is already in another team` });
    }

    // Don't add the leader as a member of their own team
    if (newMember._id.toString() === leaderId) {
      return res.status(400).json({ message: "You cannot add yourself as a member" });
    }

    // Add to group
    group.members.push(newMember._id);
    await group.save();

    // Update student record
    await Student.findByIdAndUpdate(newMember._id, {
      group: group._id,
      team_role: "Member",
    });

    // Initialize marks record
    await Marks.findOneAndUpdate(
      { student: newMember._id, group: group._id },
      { student: newMember._id, group: group._id, supervisor: group.supervisor },
      { upsert: true, new: true }
    );

    // Return populated group
    const populated = await Group.findById(group._id)
      .populate("leader",     "name student_code email whatsapp")
      .populate("members",    "name student_code email whatsapp")
      .populate("supervisor", "name sup_code email designation");

    res.json({
      message: `${newMember.name} added to team successfully`,
      group: populated,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ── GET ALL GROUPS (Admin) ─────────────────────────────────────
export const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate("leader", "name student_code")
      .populate("members", "name student_code")
      .populate("supervisor", "name sup_code");

    res.json(groups);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ── GET SINGLE GROUP ───────────────────────────────────────────
export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("leader", "name student_code email")
      .populate("members", "name student_code email")
      .populate("supervisor", "name sup_code email");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json(group);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ── REASSIGN SUPERVISOR (Admin only) ──────────────────────────
export const reassignSupervisor = async (req, res) => {
  const { supervisor_id } = req.body;

  try {
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      { supervisor: supervisor_id },
      { new: true }
    ).populate("supervisor", "name sup_code");

    res.json({
      message: "Supervisor reassigned successfully",
      group
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};