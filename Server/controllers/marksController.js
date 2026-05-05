import Marks from "../Models/marks.js";
import Group from "../Models/group.js";
import Settings from "../Models/Settings.js";

/**
 * 📌 Save / Update Marks
 */
export const saveMarks = async (req, res) => {
  const { student_id, monthly, submissions, viva, documentation } = req.body;

  try {
    let marks = await Marks.findOne({ student: student_id });

    if (!marks) {
      return res.status(404).json({ message: "Marks record not found for this student" });
    }

    if (monthly) {
      Object.entries(monthly).forEach(([key, val]) => {
        if (val !== null && val !== undefined) marks.monthly[key] = val;
      });
    }

    if (submissions) {
      Object.entries(submissions).forEach(([key, val]) => {
        if (val !== null && val !== undefined) marks.submissions[key] = val;
      });
    }

    if (viva) {
      Object.entries(viva).forEach(([key, val]) => {
        if (val !== null && val !== undefined) marks.viva[key] = val;
      });
    }

    if (documentation) {
      Object.entries(documentation).forEach(([key, val]) => {
        if (val !== null && val !== undefined) marks.documentation[key] = val;
      });
    }

    marks.total = calculateTotal(marks);

    marks.markModified("monthly");
    marks.markModified("submissions");
    marks.markModified("viva");
    marks.markModified("documentation");

    await marks.save();

    res.json({
      message: "Marks saved successfully",
      total: marks.total,
      marks
    });

  } catch (error) {
    console.error("Save marks error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * 📌 Get Marks for ONE Student
 */
export const getStudentMarks = async (req, res) => {
  try {
    const { studentId } = req.params;

    const marks = await Marks.findOne({ student: studentId })
      .populate("student", "name email");

    if (!marks) {
      return res.status(404).json({ message: "Marks not found for this student" });
    }

    res.json(marks);

  } catch (error) {
    console.error("Get student marks error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * 📌 Get Marks for GROUP
 */
export const getGroupMarks = async (req, res) => {
  try {
    const marks = await Marks.find({ group: req.params.groupId })
      .populate("student", "name student_code team_role");
    res.json(marks);                    // ← this should send the array directly
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * 📌 Get ALL Marks (Admin)
 */
export const getAllMarks = async (req, res) => {
  try {
    const marks = await Marks.find()
      .populate("student", "name email")
      .populate("group");

    res.json({
      count: marks.length,
      marks
    });

  } catch (error) {
    console.error("Get all marks error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * 📌 Calculate Total
 */
function calculateTotal(marks) {
  let total = 0;

  const m = marks.monthly || {};
  ["oct", "nov", "dec", "feb", "mar"].forEach(k => {
    total += Number(m[k]) || 0;
  });

  const s = marks.submissions || {};
  ["proposal", "progress", "code", "prog_sim", "thesis_sim"].forEach(k => {
    total += Number(s[k]) || 0;
  });

  const d = marks.documentation || {};
  total += Number(d.final) || 0;

  const v = marks.viva || {};
  ["internal1", "internal2", "external"].forEach(k => {
    total += Number(v[k]) || 0;
  });

  return total;
}