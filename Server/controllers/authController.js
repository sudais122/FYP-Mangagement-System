import Student    from "../Models/student.js";
import Supervisor from "../Models/supervisor.js";
import Admin      from "../Models/admin.js";
import crypto     from "crypto";
import nodemailer from "nodemailer";
import bcrypt     from "bcrypt";
import generateToken from "../utils/generateToken.js";


// ── STUDENT ID GENERATOR ─────────────────────────────
const generateStudentId = async () => {
  const studentCount = await Student.countDocuments();
  const sequentialNumber = (studentCount + 1).toString().padStart(4, '0');
  const year = new Date().getFullYear();
  return `STD-${year}${sequentialNumber}`;
};

// ── EMAIL TRANSPORTER ──────────────────────────────────────────
const getTransporter = () => {
  console.log("Creating transporter with:", process.env.EMAIL_USER, !!process.env.EMAIL_PASS);
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

// ── LOGIN (works for all 3 roles) ─────────────────────────────
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
      if (user) role = "supervisor";
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

    const token = generateToken(user._id, role);

    let userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role,
      token,
    };

    if (role === "student") {
      userData.student_code = user.student_code;
      userData.group        = user.group;
    }

    if (role === "supervisor") {
      userData.sup_code              = user.sup_code;
      userData.force_password_change = user.force_password_change;
    }

    res.json(userData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ── STUDENT REGISTER ──────────────────────────────────────────
export const registerStudent = async (req, res) => {
  try {
    const { name, email, whatsapp, password } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "CV is required" });
    }

    const existing = await Student.findOne({ email });
    if (existing) {
      await cloudinary.uploader.destroy(req.file.filename, { resource_type: "raw" });
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student_code = await generateStudentCode();

    const student = await Student.create({
      name,
      email,
      whatsapp,
      password: hashedPassword,
      student_code,
      cv_url: req.file.path,
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
    if (req.file?.filename) {
      await cloudinary.uploader.destroy(req.file.filename, { resource_type: "raw" });
    }
    res.status(500).json({ message: error.message });
  }
};

// ── FORGOT PASSWORD — sends reset link via email ───────────────
export const forgotPassword = async (req, res) => {
  console.log("=== forgotPassword HIT ===");
  console.log("Body:", req.body);
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);

  try {
    console.log("EMAIL_PASS LENGTH:", process.env.EMAIL_PASS?.length);
console.log("EMAIL_PASS VALUE:", process.env.EMAIL_PASS);
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Search across all three collections
    let user = await Student.findOne({ email });
    if (!user) user = await Supervisor.findOne({ email });
    if (!user) user = await Admin.findOne({ email });

    if (!user) {
      // Security best practice: don't reveal whether email exists
      return res.json({ message: "If this email is registered, a reset link has been sent." });
    }
    // With this:
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken  = otp;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });


    await transporter.sendMail({
      from:    `"FYP Management System" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: "Reset Your Password — FYP Management AWKUM",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px 24px;border:1px solid #e2e8f0;border-radius:12px;">
          <h2 style="color:#1e3a8a;margin-bottom:4px;">FYP Management System</h2>
          <p style="color:#64748b;font-size:13px;margin-bottom:24px;">AWKUM · CS Department</p>

          <p style="color:#0f172a;font-size:15px;">Hi <strong>${user.name}</strong>,</p>
          <p style="color:#334155;font-size:14px;    console.log("EMAIL_USER:", process.env.EMAIL_USER);
              console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);line-height:1.6;">
            We received a request to reset your password. Click the button below to set a new password.
            This link is valid for <strong>15 minutes</strong>.
          </p>

          <div style="text-align:center;margin:28px 0;">
            <a href="${resetUrl}"
               style="display:inline-block;padding:12px 28px;background:#1e3a8a;color:#ffffff;
                      text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">
              Reset My Password
            </a>
          </div>

          <p style="color:#64748b;font-size:13px;line-height:1.6;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color:#1e3a8a;word-break:break-all;">${resetUrl}</a>
          </p>

          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
          <p style="color:#94a3b8;font-size:12px;">
            If you didn't request a password reset, you can safely ignore this email.
            Your password will not be changed.
          </p>
        </div>
      `,
    });

    res.json({ message: "If this email is registered, a reset link has been sent." });

  } catch (err) {
    console.error("forgotPassword error:", err);
    res.status(500).json({ message: "Failed to send reset email. Please try again." });
  }
};

// ── RESET PASSWORD — validates token, sets new password ────────
export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    let user = await Student.findOne({ email });
    if (!user) user = await Supervisor.findOne({ email });
    if (!user) user = await Admin.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
      return res.status(400).json({ message: "OTP has expired" });
    }

    res.json({ message: "OTP verified" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};