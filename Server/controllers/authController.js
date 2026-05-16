import Student    from "../Models/student.js";
import Supervisor from "../Models/supervisor.js";
import Admin      from "../Models/admin.js";
import bcrypt     from "bcrypt";
import generateToken           from "../utils/generateToken.js";
import { generateStudentId }   from "../utils/generateStudentId.js";
import { sendEmail }           from "../utils/sendEmail.js";
import { otpEmailTemplate }        from "../utils/emailTemplates/otpEmail.js";
import { supervisorOtpTemplate }   from "../utils/emailTemplates/supervisorOtp.js";


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
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role,
      token,
    };

    if (role === "student") {
      userData.student_code = user.student_code;
      userData.group        = user.group;
    }

if (role === "supervisor" || role === "chairman") {
  userData.sup_code              = user.sup_code;
  userData.prefix                = user.prefix;
  userData.designation           = user.designation;   // ← ADD
  userData.force_password_change = user.force_password_change;
  userData.is_chairman           = user.is_chairman;
  userData.whatsapp              = user.whatsapp;
  userData.avatar_url            = user.avatar_url;
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
    const { name, email, whatsapp, password, gender } = req.body;

    // 1. CV required
    if (!req.file) {
      return res.status(400).json({ message: "CV is required" });
    }

    // 2. PDF check 
    const isPdfMime = req.file.mimetype === "application/pdf";
    const filename  = req.file.originalname || req.file.key || "";
    const isPdfExt  = filename.toLowerCase().endsWith(".pdf");

    if (!isPdfMime && !isPdfExt) {
      return res.status(400).json({ message: "CV must be a PDF file" });
    }

    // 3. Duplicate email check
    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 4. Password hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Student ID
    const student_code = await generateStudentId();

    // 6. Create student 
    const student = await Student.create({
      name,
      email,
      whatsapp,
      gender,
      password: hashedPassword,
      student_code,
      cv_url: req.file.location,
    });

    // 7. Response
    res.status(201).json({
      message: "Student registered successfully",
      student: {
        _id:          student._id,
        name:         student.name,
        email:        student.email,
        gender:       student.gender,
        student_code: student.student_code,
        cv_url:       student.cv_url,
      },
    });

  } catch (error) {
    console.error("REGISTER STUDENT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ── FORGOT PASSWORD (sends OTP) ──────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    let user = null;
    let userType = null;

    // ── FIND STUDENT ───────────────────────────────────────────
    user = await Student.findOne({ email });

    if (user) {
      userType = "student";
    }

    // ── FIND SUPERVISOR ───────────────────────────────────────
    if (!user) {
      user = await Supervisor.findOne({ email });

      if (user) {
        userType = "supervisor";
      }
    }

    if (!user) {
      return res.json({
        message: "If this email is registered, an OTP has been sent."
      });
    }

    //  GENERATE OTP 
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordToken = otp;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save({ validateBeforeSave: false });

    //EMAIL TEMPLATE 
    let emailTemplate;

    if (userType === "supervisor") {
      emailTemplate = supervisorOtpTemplate({
        name: user.name,
        otp
      });
    } else {
      emailTemplate = otpEmailTemplate({
        name: user.name,
        otp
      });
    }

    // SEND EMAIL 
    const result = await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    if (!result.success) {
      console.error("OTP email failed:", result.error);

      return res.status(500).json({
        message: "Failed to send OTP email"
      });
    }

    res.json({
      message: "If this email is registered, an OTP has been sent."
    });

  } catch (err) {
    console.error("forgotPassword error:", err);

    res.status(500).json({
      message: "Failed to send OTP"
    });
  }
};
// ── VERIFY OTP ───────────────────────────────────────
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    let user = await Student.findOne({ email });
    if (!user) user = await Supervisor.findOne({ email });
    if (!user) user = await Admin.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

console.log("DB token:", user.resetPasswordToken, typeof user.resetPasswordToken);
console.log("Received:", otp, typeof otp);

if (user.resetPasswordToken !== otp) {
  return res.status(400).json({ message: "Invalid OTP" });
}

    if (user.resetPasswordExpire < Date.now()) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    res.json({ message: "OTP verified successfully" });

  } catch (err) {
    console.error("verifyOtp error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── RESET PASSWORD ───────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
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

    // Clear OTP fields + set new password
    user.password            = await bcrypt.hash(password, 10);
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (err) {
    console.error("resetPassword error:", err);
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
    } else if (role === "supervisor" || role === "chairman") {
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