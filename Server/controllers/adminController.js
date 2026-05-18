import Admin from "../Models/admin.js";
import Supervisor from "../Models/supervisor.js";
import Student from "../Models/student.js";
import Group from "../Models/group.js";
import Marks from "../Models/marks.js";
import Settings from "../Models/Settings.js";
import generatePassword from "../utils/generatePassword.js";
import { generateSupCode } from "../utils/generateSupCode.js"; 
import { sendEmail } from "../utils/sendEmail.js";
import Maintaince from "../Models/Maintaince.js";
import { supervisorCredentialsTemplate } from "../utils/emailTemplates/supervisorCredentials.js";
import bcrypt from "bcryptjs"; 


// ── ADD SUPERVISOR ─────────────────────────────────────────────
export const addSupervisor = async (req, res) => {
  const {
    name,
    email,
    password,
    designation,
    office,
    whatsapp,
    is_chairman,
    prefix   
  } = req.body;

  try {
    // 1. Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    // 2. Check duplicate email
    const exists = await Supervisor.findOne({ email });

    if (exists) {
      return res.status(400).json({
        message: "Supervisor with this email already exists"
      });
    }

    // 3. Generate supervisor code
    const sup_code = await generateSupCode();

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create supervisor (FIXED: prefix included)
    const supervisor = await Supervisor.create({
      name,
      email,
      password: hashedPassword,
      designation: designation || "Supervisor",
      office: office || "",
      whatsapp: whatsapp || "",
      prefix: prefix || "Mr", 
      is_chairman: is_chairman === true,
      role: is_chairman === true ? "chairman" : "supervisor",
      sup_code
    });

    // 6. Generate professional email template
    const { subject, html } = supervisorCredentialsTemplate({
      name,
      email,
      sup_code: supervisor.sup_code,
      password
    });

    // 7. Send email
    sendEmail({
      to: email,
      subject,
      html
    }).then(result => {
      if (!result.success) {
        console.warn("Email failed silently:", result.error);
      }
    });

    // 8. Response
    res.status(201).json({
      message: "Supervisor created successfully",
      supervisor: {
        _id: supervisor._id,
        name: supervisor.name,
        email: supervisor.email,
        sup_code: supervisor.sup_code,
        designation: supervisor.designation,
        whatsapp: supervisor.whatsapp,
        prefix: supervisor.prefix, // ✅ FIX: return prefix
        is_chairman: supervisor.is_chairman
      }
    });

  } catch (error) {
    console.error("Add Supervisor Error:", error);

    // Duplicate key handling
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate key error (email or sup_code already exists)"
      });
    }

    res.status(500).json({
      message: error.message
    });
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

// In adminController.js
export const updateSupervisor = async (req, res) => {
  try {
    const { name, email, whatsapp, is_chairman, prefix } = req.body;
    const updateData = { name, email, whatsapp, is_chairman };
    if (prefix) updateData.prefix = prefix;

    const supervisor = await Supervisor.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!supervisor) return res.status(404).json({ message: "Supervisor not found" });
    res.json({ message: "Updated successfully", supervisor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MARKS OF GROUP
export const getGroupMarks = async (req, res) => {
  try {
    const { groupId } = req.params;
const group = await Group.findById(groupId)
  .populate("leader")
  .populate("members")
  .populate("supervisor", "name prefix sup_code email designation whatsapp is_chairman avatar_url");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const studentIds = [
      group.leader?._id,
      ...(group.members || []).map(m => m._id)
    ].filter(Boolean);

    const marks = await Marks.find({
      student: { $in: studentIds }
    }).populate("student", "name email");

    res.json({ group, marks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ── GET ALL STUDENTS ───────────────────────────────────────────
export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .select("name email student_code whatsapp team_role group")
      .populate({
        path: "group",
        select: "group_code project_title supervisor",
        populate: { path: "supervisor", select: "name prefix sup_code is_chairman designation whatsapp avatar_url" },
      });

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
      .select("name email prefix sup_code designation whatsapp office is_chairman role avatar_url")
      .lean();

    const result = await Promise.all(
      supervisors.map(async (s) => {
        const teamCount = await Group.countDocuments({ supervisor: s._id });
        return { ...s, teamCount };
      })
    );

    res.json(result);
  } catch (error) {
    console.error("getAllSupervisors error:", error); 
    res.status(500).json({ message: error.message });
  }
};

// ── GET ALL GROUPS/TEAMS ───────────────────────────────────────
export const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find()
    .populate("supervisor", "name prefix sup_code email is_chairman designation whatsapp avatar_url");

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

export const getAllStudentsForAdmin = async (req, res) => {
  try {
    const students = await Student.find()
      .select("name email student_code whatsapp cv_url group")
      .populate({
        path: "group",
        select: "group_code project_title proposal_url proposal_status supervisor",
        populate: { path: "supervisor", select: "name prefix sup_code is_chairman designation whatsapp avatar_url" }
      })
      .sort({ createdAt: -1 })
      .lean();

    const studentIds = students.map(s => s._id);
    const allMarks = await Marks.find({ student: { $in: studentIds } }).lean();

    const totalByStudent = {};
    allMarks.forEach(m => { totalByStudent[m.student.toString()] = m.total || 0; });

    students.forEach(s => {
      s.total_marks = totalByStudent[s._id.toString()] || 0;
    });

    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
// In admin.controller.js — update adminSaveMarks
export const adminSaveMarks = async (req, res) => {
  const { student_id, monthly, submissions, viva, documentation } = req.body;
  try {
    let marks = await Marks.findOne({ student: student_id });
    if (!marks) return res.status(404).json({ message: "Marks record not found" });

    if (monthly) {
      Object.entries(monthly).forEach(([k, v]) => {
        if (v !== null && v !== undefined) marks.monthly[k] = v;
      });
    }
    if (submissions) {
      Object.entries(submissions).forEach(([k, v]) => {
        if (v !== null && v !== undefined) marks.submissions[k] = v;
      });
    }
    if (viva) {
      Object.entries(viva).forEach(([k, v]) => {
        if (v !== null && v !== undefined) marks.viva[k] = v;
      });
    }
    if (documentation) {
      Object.entries(documentation).forEach(([k, v]) => {
        if (v !== null && v !== undefined) marks.documentation[k] = v;
      });
    }

    // Recalculate total
    let total = 0;
    const m = marks.monthly || {};
    ["oct","nov","dec","feb","mar"].forEach(k => { total += Number(m[k]) || 0; });
    const s = marks.submissions || {};
    ["proposal","progress","code","prog_sim","thesis_sim"].forEach(k => { total += Number(s[k]) || 0; });
    const d = marks.documentation || {};
    total += Number(d.final) || 0;
    const v = marks.viva || {};
    ["internal1","internal2","external"].forEach(k => { total += Number(v[k]) || 0; });
    marks.total = total;

    marks.markModified("monthly");
    marks.markModified("submissions");
    marks.markModified("viva");
    marks.markModified("documentation");

    await marks.save();

    res.json({ message: "Marks updated by admin", total: marks.total, marks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMarkToggles = async (req, res) => {
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

export const saveMarkToggles = async (req, res) => {
  try {
    const { toggles } = req.body;
    if (!toggles || typeof toggles !== "object") {
      return res.status(400).json({ message: "toggles object is required" });
    }

    const updated = await Settings.findOneAndUpdate(
      { type: "marks" },
      { $set: { toggles } }, // ← use $set not full replace
      { upsert: true, new: true }
    );

    const saved = Object.fromEntries(updated.toggles);
    res.json({ message: "Settings saved", toggles: saved });
  } catch (err) {
    res.status(500).json({ message: err.message });
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

// ── SAVE MARKS (Admin) ─────────────────────────────────────────
export const saveMarks = async (req, res) => {
  try {
    const { student_id, monthly, submissions, viva, documentation } = req.body;

    if (!student_id) {
      return res.status(400).json({ message: "student_id is required" });
    }

    const student = await Student.findById(student_id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    if (!student.group) {
      return res.status(404).json({ message: "Student is not in a group" });
    }

    // Build $set object — only include fields that were sent
    const setObj = {};
    if (monthly)       setObj.monthly       = monthly;
    if (submissions)   setObj.submissions   = submissions;
    if (viva)          setObj.viva          = viva;
    if (documentation) setObj.documentation = documentation;

    // Calculate total from all sections
    const sumObj = (obj) => Object.values(obj || {}).reduce((s, v) => s + (Number(v) || 0), 0);
    const total  = sumObj(monthly) + sumObj(submissions) + sumObj(viva) + sumObj(documentation);

    setObj.total = total;

    const marks = await Marks.findOneAndUpdate(
      { student: student_id, group: student.group },
      {
        $set:      setObj,
        $setOnInsert: {
          student:  student_id,
          group:    student.group,
        }
      },
      { upsert: true, new: true }
    );

    res.json({
      message: "Marks saved successfully",
      total:   marks.total,
      marks,
    });

  } catch (err) {
    console.error("saveMarks error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getMaintenanceStatus = async (req, res) => {
  try {
    let settings = await Maintaince.findOne();
    if (!settings) {
      settings = await Maintaince.create({});
    }

    res.json({
      maintenance_mode:       settings.maintenance_mode,
      maintenance_reason:     settings.maintenance_reason,
      maintenance_started_at: settings.maintenance_started_at,
    });
  } catch (err) {
    console.error("Get maintenance status error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/admin/maintenance ──
export const toggleMaintenanceMode = async (req, res) => {
  try {
    const { enabled, reason } = req.body;

    let settings = await Maintaince.findOne();
    if (!settings) {
      settings = await Maintaince.create({});
    }

    settings.maintenance_mode = !!enabled;

    if (enabled) {
      settings.maintenance_reason     = reason || "We're upgrading the system. Please check back shortly.";
      settings.maintenance_started_at = new Date();
      settings.maintenance_enabled_by = req.user.id;
    } else {
      settings.maintenance_started_at = null;
      settings.maintenance_enabled_by = null;
    }

    await settings.save();

    res.json({
      message: enabled ? "Maintenance mode enabled" : "Maintenance mode disabled",
      maintenance_mode:       settings.maintenance_mode,
      maintenance_reason:     settings.maintenance_reason,
      maintenance_started_at: settings.maintenance_started_at,
    });
  } catch (err) {
    console.error("Toggle maintenance error:", err);
    res.status(500).json({ message: err.message });
  }
};