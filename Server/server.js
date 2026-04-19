import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from 'bcryptjs';

import connectDB from "./config/db.js";
import authRoutes from "./Routes/authRoutes.js";
import User from "./Models/User.js"
dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());

// Database
connectDB();

// Routes
app.use("/api/auth", authRoutes);

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("BODY:", req.body); 

    const user = await User.findOne({ email });
    console.log("USER:", user);

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
        student_code: user.student_code
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});