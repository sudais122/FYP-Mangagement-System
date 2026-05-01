import Group from "../Models/group.js";
import Student from "../Models/student.js";
import Marks from "../Models/marks.js";

// ── TEAM ID GENERATOR ─────────────────────────────
const generateTeamId = () => {
  return "TEAM-" + Date.now().toString().slice(-8);
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
      team_id: generateTeamId(),
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

    await Marks.insertMany(
      allStudents.map((sid) => ({
        student: sid,
        group: group._id,
        supervisor: supervisor_id,
      }))
    );

    // ── RESPONSE ───────────────────────────────────
    const populated = await Group.findById(group._id)
      .populate("leader", "name student_code")
      .populate("members", "name student_code")
      .populate("supervisor", "name sup_code");

    res.status(201).json({
      message: "Group created successfully",
      group: populated,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ── GET MY GROUP ───────────────────────────────────────────────
export const getMyGroup = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);

    if (!student || !student.group) {
      return res.status(404).json({
        hasGroup: false,
        message: "No team found"
      });
    }

    const group = await Group.findById(student.group)
      .populate("leader", "name student_code email")
      .populate("members", "name student_code email")
      .populate("supervisor", "name sup_code email office office_hours research_areas");

    res.json({
      hasGroup: true,
      group
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET ALL GROUPS (Supervisor — only theirs) ──────────────────
export const getGroupsBySupervisor = async (req, res) => {
  try {
    const groups = await Group.find({ supervisor: req.user.id })
      .populate("leader", "name student_code")
      .populate("members", "name student_code");

    res.json(groups);

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