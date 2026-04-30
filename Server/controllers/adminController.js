import Admin      from "../Models/admin.js";
import Supervisor from "../Models/supervisor.js";
import Student    from "../Models/student.js";
import Group      from "../Models/group.js";
import Marks      from "../Models/marks.js";
import generatePassword from "../utils/generatePassword.js";

// ── ADD SUPERVISOR ─────────────────────────────────────────────
export const addSupervisor = async (req, res) => {
  const { name, email, designation, research_areas, office, office_hours, max_groups } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }
  try {
    const exists = await Supervisor.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }
    const tempPassword = generatePassword();
    const supervisor = await Supervisor.create({
      name, email,
      password: tempPassword,
      designation,
      research_areas: research_areas || [],
      office,
      office_hours,
      max_groups: max_groups || 5,
    });

    res.status(201).json({
      message: "Supervisor created successfully",
      supervisor: {
        _id:          supervisor._id,
        name:         supervisor.name,
        email:        supervisor.email,
        sup_code:     supervisor.sup_code,
        tempPassword, // send this to frontend to show admin
      },
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
      students,
      supervisors,
      groups,
      marks: {
        avgScore,
        topScore,
        pendingMarks,
        completedPct,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET ALL STUDENTS ───────────────────────────────────────────
export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .select("-password")
      .populate({
        path: "group",
        select: "team_code project_title supervisor",
        populate: { path: "supervisor", select: "name sup_code" },
      });
    res.json(students);
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