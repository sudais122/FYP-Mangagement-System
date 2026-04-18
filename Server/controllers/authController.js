import bcrypt from "bcrypt";
import User from "../Models/User";

export const registerUser = async (req, res) => {

  try {

    const { name, email, password, student_code, reg_no } = req.body;

    const file = req.file; // CV file

    // check duplicate
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({

      name,
      email,
      password: hashedPassword,
      student_code,
      reg_no,

      cvUrl: file?.path,
      cvPublicId: file?.filename

    });

    res.status(201).json({
      message: "User registered successfully",
      user
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};