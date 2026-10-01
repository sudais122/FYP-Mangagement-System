import Marks from "../Models/marks.js";
import Group from "../Models/group.js";
import Settings from "../Models/Settings.js";

// Save / Update Marks

export const saveMarks = async (req, res) => {
  const Supervisor = (await import("../Models/supervisor.js")).default;
  const caller = await Supervisor.findById(req.user.id);

  if (caller && caller.is_chairman) {
    const { student_id } = req.body;
    const Student = (await import("../Models/student.js")).default;
    const student = await Student.findById(student_id);

    if (!student || !student.group) {
      return res.status(404).json({ message: "Student or group not found" });
    }

    const group = await Group.findById(student.group);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const userId = (req.user.id || req.user._id)?.toString();
    const isOwner = group.supervisor?.toString() === userId;

    console.log("Chairman mark save check:", {
      groupSupervisor: group.supervisor?.toString(),
      requestUserId: userId,
      isOwner,
    });

    if (!isOwner) {
      return res.status(403).json({
        message: "You can only edit marks for your own assigned groups",
      });
    }
  }

  const {
    student_id,
    supervisor_id,
    monthly,
    submissions,
    viva,
    documentation,
  } = req.body;

  try {
    let marks = await Marks.findOne({ student: student_id });
    if (!marks) {
      return res
        .status(404)
        .json({ message: "Marks record not found for this student" });
    }

    if (!marks.supervisor) {
      marks.supervisor = supervisor_id || req.user.id;
    }

    const updatedSections = [];

    const LABELS = {
      monthly: {
        oct: { label: "October Meeting", max: 10 },
        nov: { label: "November Meeting", max: 10 },
        dec: { label: "December Meeting", max: 10 },
        feb: { label: "February Meeting", max: 10 },
        mar: { label: "March Meeting", max: 10 },
      },
      submissions: {
        proposal: { label: "Proposal Submission", max: 10 },
        progress: { label: "Progress Report", max: 20 },
        code: { label: "Code / Practical Work", max: 10 },
        prog_sim: { label: "Progress Similarity", max: 5 },
        thesis_sim: { label: "Thesis Similarity", max: 5 },
      },
      documentation: {
        final: { label: "Thesis / Final Report", max: 20 },
      },
      viva: {
        internal1: { label: "Internal Viva 1", max: 25 },
        internal2: { label: "Internal Viva 2", max: 25 },
        external: { label: "External Viva", max: 30 },
      },
    };

    if (monthly) {
      Object.entries(monthly).forEach(([key, val]) => {
        if (val !== null && val !== undefined) {
          marks.monthly[key] = val;
          const info = LABELS.monthly[key];
          if (info)
            updatedSections.push({
              label: info.label,
              value: val,
              max: info.max,
            });
        }
      });
    }

    if (submissions) {
      Object.entries(submissions).forEach(([key, val]) => {
        if (val !== null && val !== undefined) {
          marks.submissions[key] = val;
          const info = LABELS.submissions[key];
          if (info)
            updatedSections.push({
              label: info.label,
              value: val,
              max: info.max,
            });
        }
      });
    }

    if (viva) {
      Object.entries(viva).forEach(([key, val]) => {
        if (val !== null && val !== undefined) {
          marks.viva[key] = val;
          const info = LABELS.viva[key];
          if (info)
            updatedSections.push({
              label: info.label,
              value: val,
              max: info.max,
            });
        }
      });
    }

    if (documentation) {
      Object.entries(documentation).forEach(([key, val]) => {
        if (val !== null && val !== undefined) {
          marks.documentation[key] = val;
          const info = LABELS.documentation[key];
          if (info)
            updatedSections.push({
              label: info.label,
              value: val,
              max: info.max,
            });
        }
      });
    }

    marks.total = calculateTotal(marks);

    marks.markModified("monthly");
    marks.markModified("submissions");
    marks.markModified("viva");
    marks.markModified("documentation");

    await marks.save();

    if (updatedSections.length > 0) {
      try {
        const Student = (await import("../Models/student.js")).default;
        const { marksUpdatedTemplate } =
          await import("../utils/emailTemplates/marksUpdated.js");
        const { sendEmail } = await import("../utils/sendEmail.js");

        const student = await Student.findById(student_id);
        const group = await (
          await import("../Models/group.js")
        ).default.findOne({
          $or: [{ leader: student_id }, { members: student_id }],
        });

        if (student?.email) {
          const { subject, html } = marksUpdatedTemplate({
            studentName: student.name,
            supervisorName: caller?.name || "Your Supervisor",
            groupCode: group?.group_code || "—",
            updatedSections,
            total: marks.total,
          });

          sendEmail({ to: student.email, subject, html }).then((r) => {
            if (!r.success)
              console.warn(`Marks email failed for ${student.email}:`, r.error);
          });
        }
      } catch (emailErr) {
        console.warn("Marks email error:", emailErr.message);
      }
    }

    res.json({
      message: "Marks saved successfully",
      total: marks.total,
      marks,
    });
  } catch (error) {
    console.error("Save marks error:", error);
    res.status(500).json({ message: error.message });
  }
};

//  Get Marks for ONE Student
export const getStudentMarks = async (req, res) => {
  try {
    const { studentId } = req.params;

    const marks = await Marks.findOne({ student: studentId }).populate(
      "student",
      "name email",
    );

    if (!marks) {
      return res
        .status(404)
        .json({ message: "Marks not found for this student" });
    }

    res.json(marks);
  } catch (error) {
    console.error("Get student marks error:", error);
    res.status(500).json({ message: error.message });
  }
};

//  Get Marks for GROUP
export const getGroupMarks = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate("leader")
      .populate("members");

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    const studentIds = [group.leader?._id, ...group.members.map((m) => m._id)];

    const marks = await Marks.find({
      student: { $in: studentIds },
    }).populate("student", "name student_code team_role");

    res.json(marks);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
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
      marks,
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
  ["oct", "nov", "dec", "feb", "mar"].forEach((k) => {
    total += Number(m[k]) || 0;
  });

  const s = marks.submissions || {};
  ["proposal", "progress", "code", "prog_sim", "thesis_sim"].forEach((k) => {
    total += Number(s[k]) || 0;
  });

  const d = marks.documentation || {};
  total += Number(d.final) || 0;

  const v = marks.viva || {};
  ["internal1", "internal2", "external"].forEach((k) => {
    total += Number(v[k]) || 0;
  });

  return total;
}
