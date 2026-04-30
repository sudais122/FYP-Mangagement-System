import Marks   from "../Models/marks.js";
import Student from "../Models/student.js";
import Group   from "../Models/group.js";

// ── SAVE / UPDATE MARKS (Supervisor or Admin) ──────────────────
export const saveMarks = async (req, res) => {
  const { student_id, monthly, submissions, viva, documentation } = req.body;

  try {
    let marks = await Marks.findOne({ student: student_id });
    if (!marks) {
      return res.status(404).json({ message: "Marks record not found for this student" });
    }

    // Update only provided fields
    if (monthly) {
      Object.keys(monthly).forEach((key) => {
        if (monthly[key] !== undefined && monthly[key] !== null) {
          marks.monthly[key] = monthly[key];
        }
      });
    }
    if (submissions) {
      Object.keys(submissions).forEach((key) => {
        if (submissions[key] !== undefined) marks.submissions[key] = submissions[key];
      });
    }
    if (viva) {
      Object.keys(viva).forEach((key) => {
        if (viva[key] !== undefined) marks.viva[key] = viva[key];
      });
    }
    if (documentation) {
      Object.keys(documentation).forEach((key) => {
        if (documentation[key] !== undefined) marks.documentation[key] = documentation[key];
      });
    }

    await marks.save(); // pre-save calculates total
    res.json({ message: "Marks saved successfully", marks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET MARKS FOR A STUDENT ────────────────────────────────────
export const getStudentMarks = async (req, res) => {
  try {
    const marks = await Marks.findOne({ student: req.params.studentId })
      .populate("student",    "name student_code")
      .populate("group",      "team_code project_title")
      .populate("supervisor", "name sup_code");
    if (!marks) return res.status(404).json({ message: "Marks not found" });
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET ALL MARKS FOR A GROUP ──────────────────────────────────
export const getGroupMarks = async (req, res) => {
  try {
    const marks = await Marks.find({ group: req.params.groupId })
      .populate("student", "name student_code team_role");
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET ALL MARKS (Admin overview) ────────────────────────────
export const getAllMarks = async (req, res) => {
  try {
    const marks = await Marks.find()
      .populate("student",    "name student_code")
      .populate("group",      "team_code project_title")
      .populate("supervisor", "name sup_code");
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};