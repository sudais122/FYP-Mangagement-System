import Student from "../Models/student.js";
import Group   from "../Models/group.js";
import Marks   from "../Models/marks.js";

// ── SEARCH STUDENT BY CODE (for adding to team) ────────────────
export const searchStudent = async (req, res) => {
  const { student_code } = req.query;

  if (!student_code) {
    return res.status(400).json({ message: "student_code is required" });
  }

  try {
    const student = await Student.findOne({ student_code })
      .select("name student_code group");

    if (!student) {
      return res.status(404).json({ message: "No student found with this ID" });
    }

    if (student.group) {
      return res.status(400).json({ message: "Student already has a team" });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MT DASHBOARD
export const getMyDashboard = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id)
      .select("-password")
      .populate({
        path: "group",
        populate: [
          { path: "leader", select: "name student_code" },
          { path: "members", select: "name student_code" },
          { path: "supervisor", select: "name sup_code email office office_hours research_areas" },
        ],
      });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // CASE 1: No group → show create team UI
    if (!student.group) {
      return res.json({
        hasGroup: false,
        student: {
          id: student._id,
          name: student.name,
          student_code: student.student_code
        }
      });
    }

    // CASE 2: Has group → full dashboard data
    return res.json({
      hasGroup: true,
      student: {
        id: student._id,
        name: student.name,
        student_code: student.student_code,
        team_role: student.team_role
      },
      group: student.group
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET MY MARKS ───────────────────────────────────────────────
export const getMyMarks = async (req, res) => {
  const { id } = req.user;

  try {
    const student = await Student.findById(id);

    if (!student || !student.group) {
      return res.status(404).json({ message: "You are not part of any group" });
    }

    const marks = await Marks.find({
      group: student.group,
      student: id
    });

    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET ALL TEAM MEMBERS' MARKS ────────────────────────────────
export const getTeamMarks = async (req, res) => {
  const { id } = req.user;

  try {
    const student = await Student.findById(id);

    if (!student || !student.group) {
      return res.status(404).json({ message: "No group found" });
    }

    const marks = await Marks.find({ group: student.group })
      .populate("student", "name student_code team_role");

    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET MY PROFILE ─────────────────────────────────────────────
export const getMyProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id)
      .select("-password")
      .populate({
        path: "group",
        populate: [
          { path: "leader", select: "name student_code" },
          { path: "members", select: "name student_code" },
          { path: "supervisor", select: "name sup_code email office office_hours" },
        ],
      });

    if (!student) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};