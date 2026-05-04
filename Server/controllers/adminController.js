import Admin      from "../Models/admin.js";
import Supervisor from "../Models/supervisor.js";
import Student    from "../Models/student.js";
import Group      from "../Models/group.js";
import Marks      from "../Models/marks.js";
import generatePassword from "../utils/generatePassword.js";

// ── ADD SUPERVISOR ─────────────────────────────────────────────
export const addSupervisor = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const exists = await Supervisor.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Supervisor with this email already exists" });
    }

    const supervisor = await Supervisor.create({
      name,
      email,
      password,
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
// ── GET DASHBOARD STATS ────────────────────────────────────────
export const getDashboardStats = async (req, res) => {
  try {
    const [students, supervisors, groups, marks] = await Promise.all([
      Student.countDocuments(),
      Supervisor.countDocuments(),
      Group.countDocuments(),
      Marks.find(),
    ]);

    const totalMarks    = marks.reduce((sum, m) => sum + m.total, 0);
    const avgScore      = marks.length ? Math.round(totalMarks / marks.length) : 0;
    const topScore      = marks.length ? Math.max(...marks.map((m) => m.total)) : 0;
    const pendingMarks  = marks.filter((m) => m.total === 0).length;
    const completedPct  = marks.length
      ? Math.round((marks.filter((m) => m.total > 0).length / marks.length) * 100)
      : 0;

    res.json({
      success: true,
      stats: {
        students,
        supervisors,
        teams: groups, // Changed "groups" to "teams" for frontend consistency
        marks: {
          avgScore,
          topScore,
          pendingMarks,
          completedPct,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// ── GET ALL STUDENTS ───────────────────────────────────────────
export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .select("-password")
      .populate({
        path: "group",
        select: "group_code project_title supervisor",
        populate: { path: "supervisor", select: "name sup_code" },
      });

    // Attach total marks for each student
    const Marks = (await import("../Models/marks.js")).default;
    const result = await Promise.all(
      students.map(async (s) => {
        const marks = await Marks.findOne({ student: s._id });
        return { ...s.toObject(), total_marks: marks?.total || 0 };
      })
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET ALL SUPERVISORS ────────────────────────────────────────
export const getAllSupervisors = async (req, res) => {
  try {
    const supervisors = await Supervisor.find()
      .select("-password")
      .populate({
        path: "groups",
        select: "team_code project_title"
      });
    
    res.json({
      success: true,
      supervisors
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// ── GET ALL GROUPS/TEAMS ───────────────────────────────────────
export const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate("leader",     "name student_code")
      .populate("members",    "name student_code email")
      .populate("supervisor", "name sup_code email");

    res.json(groups); // plain array
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete orphaned teams
export const cleanupOrphanedTeams = async (req, res) => {
  try {
    const groups = await Group.find();
    let deletedCount = 0;

    for (const group of groups) {
      // Check if leader still exists
      const leaderExists = group.leader
        ? await Student.findById(group.leader)
        : null;

      // Check if any member still exists
      let anyMemberExists = false;
      if (group.members && group.members.length > 0) {
        for (const memberId of group.members) {
          const exists = await Student.findById(memberId);
          if (exists) {
            anyMemberExists = true;
            break;
          }
        }
      }

      // If neither leader nor any member exists, delete the team
      if (!leaderExists && !anyMemberExists) {
        await Marks.deleteMany({ group: group._id });
        await Group.findByIdAndDelete(group._id);
        deletedCount++;
        console.log(`🧹 Deleted orphaned team: ${group.group_code}`);
      }
    }

    res.json({
      message: `Cleanup complete — deleted ${deletedCount} orphaned teams`,
      deleted: deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── DELETE STUDENT
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // If student is in a team, remove them from it
    if (student.group) {
      const group = await Group.findById(student.group);
      if (group) {
        // If they were the leader, delete the entire team
        if (group.leader?.toString() === student._id.toString()) {
          // Free all members from this team
          await Student.updateMany(
            { group: group._id },
            { $set: { group: null, team_role: null } }
          );
          // Delete marks records for this team
          await Marks.deleteMany({ group: group._id });
          // Delete the team
          await Group.findByIdAndDelete(group._id);
          console.log(`🧹 Deleted team ${group.group_code} (leader removed)`);
        } else {
          // Just remove them from the members array
          await Group.findByIdAndUpdate(group._id, {
            $pull: { members: student._id }
          });
          await Marks.deleteMany({ student: student._id });
        }
      }
    }

    await Student.findByIdAndDelete(student._id);
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ── ADMIN SAVE ANY STUDENT'S MARKS ────────────────────────────
export const adminSaveMarks = async (req, res) => {
  const { student_id, monthly, submissions, viva, documentation } = req.body;
  try {
    let marks = await Marks.findOne({ student: student_id });
    if (!marks) return res.status(404).json({ message: "Marks record not found" });

    if (monthly)       Object.assign(marks.monthly,       monthly);
    if (submissions)   Object.assign(marks.submissions,   submissions);
    if (viva)          Object.assign(marks.viva,          viva);
    if (documentation) Object.assign(marks.documentation, documentation);

    await marks.save();
    res.json({ message: "Marks updated by admin", marks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── DELETE SUPERVISOR ──────────────────────────────────────────
export const deleteSupervisor = async (req, res) => {
  try {
    await Supervisor.findByIdAndDelete(req.params.id);
    res.json({ message: "Supervisor deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};