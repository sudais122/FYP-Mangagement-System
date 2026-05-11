import Student from "../Models/student.js";
import Group   from "../Models/group.js";
import Marks   from "../Models/marks.js";

// ── SEARCH STUDENT BY CODE 
export const searchStudent = async (req, res) => {
  const { student_code } = req.query;

  if (!student_code) {
    return res.status(400).json({ message: "Student code is required" });
  }

  try {
    const student = await Student.findOne({ student_code }).select(
      "name student_code email group"
    );

    if (!student) {
      return res.status(404).json({ message: `Student ${student_code} not found` });
    }

    const initials = (student.name || "")
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    res.json({
      _id: student._id,
      student_code: student.student_code,
      name: student.name,
      email: student.email,
      initials,
      in_team: !!student.group,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadStudentCV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const student = await Student.findById(req.user.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.cv_public_id) {
      await cloudinary.uploader.destroy(student.cv_public_id, {
        resource_type: "raw",
      });
    }

    student.cv_url = req.file.path;
    student.cv_public_id = req.file.filename;

    await student.save();

    res.json({
      message: "CV uploaded successfully",
      cv_url: student.cv_url,
    });

  } catch (error) {
    console.error("CV upload error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ── GET MY DASHBOARD ───────────────────────────────────────────
export const getMyDashboard = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id)
      .select("-password")
      .populate({
        path: "group",
        populate: [
          { path: "leader", select: "name student_code" },
          { path: "members", select: "name student_code" },
          { 
            path: "supervisor", 
            select: "name sup_code email office office_hours research_areas whatsapp designation" 
          },
        ],
      });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // CASE 1: No group
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

    // CASE 2: Has group
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
  try {
    const student = await Student.findById(req.user.id);

    if (!student || !student.group) {
      return res.status(404).json({ message: "You are not in a team" });
    }

    const marks = await Marks.find({ group: student.group })
      .populate("student", "name student_code");

    res.json(marks);

  } catch (err) {
    res.status(500).json({ message: err.message });
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
          { 
            path: "supervisor", 
            select: "name sup_code email office office_hours research_areas whatsapp designation" 
          },
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