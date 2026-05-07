import Supervisor from "../Models/supervisor.js";
import Group      from "../Models/group.js";
import Student    from "../Models/student.js";
import Settings from "../Models/Settings.js";
import Marks      from "../Models/marks.js";

// ── GET ALL SUPERVISORS (Admin) ────────────────────────────────
export const getAllSupervisors = async (req, res) => {
  try {
    const supervisors = await Supervisor.find()
      .select("name email sup_code designation whatsapp office is_chairman role")  // ← include is_chairman
      .lean();

    // Add team count for each supervisor
    const Group = (await import("../Models/group.js")).default;
    const result = await Promise.all(
      supervisors.map(async (s) => {
        const teamCount = await Group.countDocuments({ supervisor: s._id });
        return { ...s, teamCount };
      })
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all available supervisors
export const getAvailableSupervisors = async (req, res) => {
  try {
    const supervisors = await Supervisor.find()
      .select("name email designation research_areas office office_hours sup_code max_groups")
      .sort({ name: 1 });

    // Count how many groups each supervisor already has
    const result = await Promise.all(
      supervisors.map(async (sup) => {
        const teamCount = await Group.countDocuments({ supervisor: sup._id });
        const available = teamCount < (sup.max_groups || 5);
        return {
          id:             sup._id,
          sup_code:       sup.sup_code,
          name:           sup.name,
          email:          sup.email,
          designation:    sup.designation || "Assistant Professor",
          research_areas: sup.research_areas || [],
          office:         sup.office || "",
          office_hours:   sup.office_hours || "",
          teamCount,
          available,
        };
      })
    );

    res.json({ success: true, supervisors: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── CREATE SUPERVISOR (Admin) ──────────────────────────────────
export const createSupervisor = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const exists = await Supervisor.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Supervisor with this email already exists" });
    }

    // Auto-generate sup_code: SUP-20260001, SUP-20260002...
    const last = await Supervisor.findOne().sort({ createdAt: -1 });
    let nextNum = 1;
    if (last && last.sup_code) {
      const lastNum = parseInt(last.sup_code.replace("SUP-2026", ""));
      nextNum = lastNum + 1;
    }
    const sup_code = `SUP-2026${String(nextNum).padStart(4, "0")}`;

    const supervisor = await Supervisor.create({
      name,
      email,
      password,
      sup_code,
      force_password_change: true,
    });

    res.status(201).json({
      message: "Supervisor created successfully",
      supervisor: {
        _id: supervisor._id,
        name: supervisor.name,
        email: supervisor.email,
        sup_code: supervisor.sup_code,
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Force sup to cahnge his pasword after ist login
export const changePassword = async (req, res) => {
  const { newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword) {
    return res.status(400).json({ message: "Both fields are required" });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }

  try {
    const supervisor = await Supervisor.findById(req.user.id);
    supervisor.password = newPassword; // pre-save hook will hash it
    supervisor.force_password_change = false; // ← clear the flag
    await supervisor.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ── GET SUPERVISOR DETAIL WITH TEAMS ──────────────────────────
export const getSupervisorDetail = async (req, res) => {
  try {
    const supervisor = await Supervisor.findById(req.params.id).select("-password");
    if (!supervisor) return res.status(404).json({ message: "Supervisor not found" });

    const groups = await Group.find({ supervisor: req.params.id })
      .populate("leader",  "name student_code email whatsapp")    // ✅ added email + whatsapp
      .populate("members", "name student_code email whatsapp");   // ✅ added email + whatsapp

    const groupsWithMarks = await Promise.all(
      groups.map(async (group) => {
        const allStudents = [group.leader, ...group.members];
        const marksData = await Promise.all(
          allStudents.map(async (student) => {
            if (!student) return null;
            const marks = await Marks.findOne({
              student: student._id,
              group:   group._id,
            });
            return { student, marks };
          })
        );
        return { ...group.toObject(), marksData };
      })
    );

    res.json({ supervisor, groups: groupsWithMarks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGroupsBySupervisor = async (req, res) => {
  try {
    const supervisorId = req.user._id;

    const groups = await Group.find({ supervisor: supervisorId })
      .populate('leader', 'name email student_code whatsapp')   
      .populate('members', 'name email student_code whatsapp')  
      .populate('supervisor', 'name email sup_code designation');

    return res.status(200).json({ groups });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
// ── GET MY STUDENTS (Supervisor) ───────────────────────────────
export const getMyStudents = async (req, res) => {
  try {
    const groups = await Group.find({ supervisor: req.user.id })
      .populate("leader",  "name student_code email")
      .populate("members", "name student_code email");

    const students = [];
    for (const group of groups) {
      const allMembers = [group.leader, ...group.members].filter(Boolean);
      for (const member of allMembers) {
        const marks = await Marks.findOne({ student: member._id, group: group._id });
        students.push({
          ...member.toObject(),
          group: { _id: group._id, team_code: group.team_code, project_title: group.project_title },
          total_marks: marks ? marks.total : 0,
        });
      }
    }
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supervisor reads same settings
export const getMarkTogglesForSupervisor = async (req, res) => {
  try {
    const settings = await Settings.findOne({ type: "marks" });

    const toggles = settings?.toggles
      ? Object.fromEntries(settings.toggles)
      : {};

    res.json({ toggles });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DEPARTMENT OVERVIEW (Chairman only) ─────────────
export const getDepartmentOverview = async (req, res) => {
  try {
    // Verify caller is chairman
    const callerSupervisor = await Supervisor.findById(req.user.id);
    if (!callerSupervisor || !callerSupervisor.is_chairman) {
      return res.status(403).json({ message: "Chairman access required" });
    }

    // Run all counts in parallel for speed
    const [totalStudents, totalSupervisors, totalTeams, allMarks, groups] = await Promise.all([
      Student.countDocuments(),
      Supervisor.countDocuments(),
      Group.countDocuments(),
      Marks.find().lean(),
      Group.find().select("proposal_url proposal_status").lean(),
    ]);

    // Average score across all students
    const totalScore = allMarks.reduce((sum, m) => sum + (m.total || 0), 0);
    const avgScore = allMarks.length ? Math.round(totalScore / allMarks.length) : 0;

    // Proposal status breakdown
    const proposalStats = {
      total:         groups.length,
      submitted:     groups.filter(g => g.proposal_url).length,
      approved:      groups.filter(g => g.proposal_status === "approved").length,
      pending:       groups.filter(g => g.proposal_status === "pending").length,
      rejected:      groups.filter(g => g.proposal_status === "rejected").length,
      not_submitted: groups.filter(g => !g.proposal_url).length,
    };

    res.json({
      totalStudents,
      totalSupervisors,
      totalTeams,
      avgScore,
      proposalStats,
    });
  } catch (err) {
    console.error("Department overview error:", err);
    res.status(500).json({ message: err.message });
  }
};