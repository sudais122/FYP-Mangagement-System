import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import cors from "cors";
import multer from "multer";
import fs from "fs";

dotenv.config();

const app = express();

// ------------------ Middleware ------------------
app.use(cors({
  origin: "http://127.0.0.1:5500",
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

// ------------------ Ensure uploads folder ------------------
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// ------------------ MongoDB Connection ------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connecting..."))
  .catch(err => console.log("Mongo Error:", err));

// 🔥 AUTO FIX OLD INDEXES (IMPORTANT)
mongoose.connection.once("open", async () => {
  console.log("MongoDB Connected");

  try {
    const collection = mongoose.connection.db.collection("users");
    const indexes = await collection.indexes();

    for (let index of indexes) {
      if (index.name === "reg_no_1" || index.name === "student_code_1") {
        await collection.dropIndex(index.name);
        console.log("Dropped old index:", index.name);
      }
    }
  } catch (err) {
    console.log("Index cleanup error:", err.message);
  }
});

// ------------------ User Schema ------------------
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  cv: { type: String, required: true },
  student_code: {
    type: String,
    unique: true,
    sparse: true   // ✅ prevents null duplicate issues
  }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

// ------------------ Multer Config ------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

// ✅ Only allow PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

// ------------------ Register API ------------------
app.post("/api/auth/register", upload.single("cv"), async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password || !req.file) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Auto student code
    const studentCode = "STD" + Date.now();

    // Save user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      cv: req.file.filename,
      student_code: studentCode
    });

    console.log("Saved user:", user);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        student_code: user.student_code
      }
    });

  } catch (error) {
    console.error("FULL ERROR:", error);

    // File type error
    if (error.message === "Only PDF files are allowed") {
      return res.status(400).json({ message: error.message });
    }

    // Duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }

    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ Start Server ------------------
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});