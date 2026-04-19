import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../Models/User.js";
import sendEmail from "../utils/sendEmail.js";
import { otpEmailTemplate } from "../utils/emailTemplates.js";
import generateStudentCode from "../utils/generateStudentCode.js";

//  REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password || !req.file) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const studentCode = await generateStudentCode();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      cv: req.file.filename,
      student_code: studentCode,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        student_code: user.student_code,
      },
    });

  } catch (error) {
    console.error("FULL ERROR:", error);

    if (error.message === "Only PDF files are allowed") {
      return res.status(400).json({ message: error.message });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }

    res.status(500).json({ message: "Server error" });
  }
};


// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Email not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        student_code: user.student_code,
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpire = Date.now() + 10 * 60 * 1000; 
    user.isOtpVerified = false;

    await user.save({ validateBeforeSave: false });

    const html = otpEmailTemplate(otp);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"FYP System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Password OTP",
      html: html,
    });

    console.log("OTP sent to:", email); 

    res.json({ message: "OTP sent to email" });

  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    if (error.code === "EAUTH") {
      return res.status(500).json({
        message: "Email service error: check EMAIL_USER and EMAIL_PASS in .env",
      });
    }

    res.status(500).json({ message: "Server error" });
  }
};

//OTP verify
export const verifyOtp = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);

    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    console.log("DB USER:", user);
    console.log("OTP FROM DB:", user?.resetOtp);
    console.log("OTP FROM FRONTEND:", otp);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.resetOtp.toString() !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.resetOtpExpire < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.isOtpVerified = true;
    await user.save({ validateBeforeSave: false });

    res.json({ message: "OTP verified" });

  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.isOtpVerified) {
      return res.status(403).json({ message: "OTP not verified" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;
    user.isOtpVerified = false;

    await user.save({ validateBeforeSave: false });

    res.json({ message: "Password reset successful" });

  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};