// import express from "express";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import bcrypt from "bcrypt";
// import cors from "cors";
// import multer from "multer";
// import fs from "fs";

// dotenv.config();

// const app = express();

// // ------------------ Middleware ------------------
// app.use(cors({
//   origin: "http://127.0.0.1:5500",
//   methods: ["GET", "POST"],
//   credentials: true
// }));

// app.use(express.json());

// // ------------------ Ensure uploads folder ------------------
// if (!fs.existsSync("uploads")) {
//   fs.mkdirSync("uploads");
// }

// // ------------------ MongoDB Connection ------------------
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB Connecting..."))
//   .catch(err => console.log("Mongo Error:", err));

// // 🔥 AUTO FIX OLD INDEXES (IMPORTANT)
// mongoose.connection.once("open", async () => {
//   console.log("MongoDB Connected");

//   try {
//     const collection = mongoose.connection.db.collection("users");
//     const indexes = await collection.indexes();

//     for (let index of indexes) {
//       if (index.name === "reg_no_1" || index.name === "student_code_1") {
//         await collection.dropIndex(index.name);
//         console.log("Dropped old index:", index.name);
//       }
//     }
//   } catch (err) {
//     console.log("Index cleanup error:", err.message);
//   }
// });

// // ------------------ Counter Schema ------------------
// const counterSchema = new mongoose.Schema({
//   _id: String,
//   seq: { type: Number, default: 0 }
// });

// const Counter = mongoose.model("Counter", counterSchema);

// // ------------------ Student Code Generator ------------------
// async function generateStudentCode() {
//   const year = new Date().getFullYear();

//   const counter = await Counter.findOneAndUpdate(
//     { _id: `studentCode_${year}` },
//     { $inc: { seq: 1 } },
//     { new: true, upsert: true }
//   );

//   const seqNumber = String(counter.seq).padStart(4, "0");

//   return `STD${year}${seqNumber}`;
// }

// // ------------------ User Schema ------------------
// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, unique: true, required: true },
//   password: { type: String, required: true },
//   cv: { type: String, required: true },
//   student_code: {
//     type: String,
//     unique: true,
//     sparse: true
//   }
// }, { timestamps: true });

// const User = mongoose.model("User", userSchema);

// // ------------------ Multer Config ------------------
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   }
// });

// // ✅ Only allow PDFs
// const fileFilter = (req, file, cb) => {
//   if (file.mimetype === "application/pdf") {
//     cb(null, true);
//   } else {
//     cb(new Error("Only PDF files are allowed"), false);
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 2 * 1024 * 1024 }
// });

// // ------------------ Register API ------------------
// app.post("/api/auth/register", upload.single("cv"), async (req, res) => {
//   try {
//     console.log("BODY:", req.body);
//     console.log("FILE:", req.file);

//     const { name, email, password } = req.body;

//     // Validation
//     if (!name || !email || !password || !req.file) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     // Check existing user
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "Email already exists" });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // ✅ Generate student code
//     const studentCode = await generateStudentCode();

//     // Save user
//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       cv: req.file.filename,
//       student_code: studentCode
//     });

//     console.log("Saved user:", user);

//     res.status(201).json({
//       message: "User registered successfully",
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         student_code: user.student_code
//       }
//     });

//   } catch (error) {
//     console.error("FULL ERROR:", error);

//     // File type error
//     if (error.message === "Only PDF files are allowed") {
//       return res.status(400).json({ message: error.message });
//     }

//     // Duplicate key error
//     if (error.code === 11000) {
//       const field = Object.keys(error.keyPattern)[0];
//       return res.status(400).json({ message: `${field} already exists` });
//     }

//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ------------------ Start Server ------------------
// const PORT = process.env.PORT || 5001;

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";
import authRoutes from "./Routes/authRoutes.js";

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

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});