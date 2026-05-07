import Student from "../Models/student.js";
import Supervisor from "../Models/supervisor.js";
import Admin from "../Models/admin.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";
import { generateStudentId } from "../utils/generateStudentId.js";

// ── EMAIL TRANSPORTER ────────────────────────────────
const getTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// ── LOGIN ────────────────────────────────────────────
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    let user = null;
    let role = null;

    user = await Student.findOne({ email });
    if (user) role = "student";

    if (!user) {
      user = await Supervisor.findOne({ email });
      if (user) role = user.role || "supervisor";
    }

    if (!user) {
      user = await Admin.findOne({ email }).select("+password");
      if (user) role = "admin";
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);

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
      userData.is_chairman = user.is_chairman;
    }

    res.json(userData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ── STUDENT REGISTER ─────────────────────────────────
export const registerStudent = async (req, res) => {
  try {
    const { name, email, whatsapp, password } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "CV is required" });
    }

    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const student_code = await generateStudentId();

const student = await Student.create({
  name,
  email,
  whatsapp,
  password: hashedPassword,
  student_code,
  cv_url: `/uploads/cvs/${req.file.filename}`,  // local path
  cv_public_id: req.file.filename,
});

    res.status(201).json({
      message: "Student registered successfully",
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        student_code: student.student_code,
      },
    });

  } catch (error) {
      console.error("❌ REGISTER STUDENT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ── FORGOT PASSWORD ──────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let user = await Student.findOne({ email });
    if (!user) user = await Supervisor.findOne({ email });
    if (!user) user = await Admin.findOne({ email });

    if (!user) {
      return res.json({ message: "If this email is registered, a reset link has been sent." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordToken = otp;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const transporter = getTransporter();

    const resetUrl = `http://localhost:3000/reset-password?email=${email}`;

    await transporter.sendMail({
      from: `"FYP Management System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password — FYP Management",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;border:1px solid #e2e8f0;border-radius:12px;">
          <h2 style="color:#1e3a8a;">FYP Management System</h2>

          <p>Hi <strong>${user.name}</strong>,</p>

          <p>Use this OTP to reset your password:</p>

          <h1 style="text-align:center;color:#1e3a8a;">${otp}</h1>

          <p>This OTP is valid for 15 minutes.</p>

          <p>Or click below:</p>

          <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#1e3a8a;color:#fff;border-radius:6px;text-decoration:none;">
            Reset Password
          </a>
        </div>
      `,
    });

    res.json({ message: "If this email is registered, a reset link has been sent." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send email" });
  }
};

// ── VERIFY OTP ───────────────────────────────────────
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    let user = await Student.findOne({ email });
    if (!user) user = await Supervisor.findOne({ email });
    if (!user) user = await Admin.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.resetPasswordToken !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.resetPasswordExpire < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    res.json({ message: "OTP verified" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── RESET PASSWORD ───────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await Student.findOne({ email });
    if (!user) user = await Supervisor.findOne({ email });
    if (!user) user = await Admin.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET PROFILE ──────────────────────────────────────
export const getProfile = async (req, res) => {
  const { id, role } = req.user;

  try {
    let user;

    if (role === "student") {
      user = await Student.findById(id).select("-password");
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