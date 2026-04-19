import bcrypt from "bcrypt";
import User from "../Models/User.js";
import generateStudentCode from "../utils/generateStudentCode.js";

export const registerUser = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

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

    console.log("Saved user:", user);

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