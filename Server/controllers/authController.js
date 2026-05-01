import Student    from "../Models/student.js";
import Supervisor from "../Models/supervisor.js";
import Admin      from "../Models/admin.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcrypt";

// ── LOGIN (works for all 3 roles) ──────────────────────────────
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    let user = null;
    let role = null;

    //  Check in Student
    user = await Student.findOne({ email });
    if (user) role = "student";

    // Check in Supervisor
    if (!user) {
      user = await Supervisor.findOne({ email });
      if (user) role = "supervisor";
    }

    // Check in Admin
    if (!user) {
      user = await Admin.findOne({ email });
      if (user) role = "admin";
    }

    // If no user found
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user._id, role);

    // Build response
    let userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role,
      token,
    };

    if (role === "student") {
      userData.student_code = user.student_code;
      userData.group = user.group;
    }

    if (role === "supervisor") {
      userData.sup_code = user.sup_code;
      userData.force_password_change = user.force_password_change;
    }

    res.json(userData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ── STUDENT REGISTER ───────────────────────────────────────────
export const registerStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await Student.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const student = await Student.create({
      name,
      email,
      password,
      role: "student"
    });

    res.status(201).json({
      message: "Registered successfully",
      user: {
        _id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
// ── CHANGE PASSWORD ────────────────────────────────────────────
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { id, role } = req.user;
  try {
    let user;
    if (role === "supervisor") user = await Supervisor.findById(id);
    else if (role === "student") user = await Student.findById(id);
    else if (role === "admin") user = await Admin.findById(id);

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    user.password = newPassword;
    if (role === "supervisor") user.force_password_change = false;
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET CURRENT USER PROFILE ───────────────────────────────────
export const getProfile = async (req, res) => {
  const { id, role } = req.user;
  try {
    let user;
    if (role === "student") {
      user = await Student.findById(id).select("-password").populate("group");
    } else if (role === "supervisor") {
      user = await Supervisor.findById(id).select("-password");
    } else if (role === "admin") {
      user = await Admin.findById(id).select("-password");
    }
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};