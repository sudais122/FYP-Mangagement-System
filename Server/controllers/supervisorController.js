import Supervisor from "../Models/supervisor.js";
import Group      from "../Models/group.js";
import Student    from "../Models/student.js";
import Marks      from "../Models/marks.js";

// ── GET ALL SUPERVISORS (Admin) ────────────────────────────────
export const getAllSupervisors = async (req, res) => {
  try {
    const supervisors = await Supervisor.find().select("-password");
    // Add team count to each
    const result = await Promise.all(
      supervisors.map(async (sup) => {
        const teamCount = await Group.countDocuments({ supervisor: sup._id });
        return { ...sup.toObject(), teamCount };
      })
    );
    res.json(result);
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
      .populate("leader",  "name student_code")
      .populate("members", "name student_code");

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